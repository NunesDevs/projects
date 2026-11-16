export const STAT_KEYS = ['strength', 'dexterity', 'power', 'defense', 'intelligence'] as const;
export type StatKey = typeof STAT_KEYS[number];
export type Role = 'jedi' | 'pilot';
export interface Character {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly role: Role;
  readonly initials: string;
  readonly stats: Readonly<Record<StatKey, number>>;
}
export interface CatalogOptions { readonly query?: string; readonly role?: string; readonly sort?: string; }

export function normalized(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

export function validateCatalog(value: unknown): readonly Character[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 500) throw new TypeError('Invalid catalogue');
  const ids = new Set<string>();
  const result = value.map((candidate: unknown) => {
    if (!candidate || typeof candidate !== 'object') throw new TypeError('Invalid character');
    const item = candidate as Record<string, unknown>;
    if (typeof item['id'] !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(item['id']) || ids.has(item['id'])) throw new TypeError('Invalid or duplicate id');
    ids.add(item['id']);
    for (const key of ['name', 'title', 'initials']) if (typeof item[key] !== 'string' || !(item[key] as string).trim() || (item[key] as string).length > 100) throw new TypeError('Invalid character text');
    if (item['role'] !== 'jedi' && item['role'] !== 'pilot') throw new TypeError('Invalid role');
    const values = item['stats'];
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw new TypeError('Invalid attributes');
    const stats = {} as Record<StatKey, number>;
    for (const key of STAT_KEYS) {
      const stat = (values as Record<string, unknown>)[key];
      if (typeof stat !== 'number' || !Number.isInteger(stat) || stat < 0 || stat > 200) throw new TypeError('Attributes must be integers from 0 to 200');
      stats[key] = stat;
    }
    return Object.freeze({id:item['id'],name:(item['name'] as string).trim(),title:(item['title'] as string).trim(),initials:(item['initials'] as string).trim(),role:item['role'],stats:Object.freeze(stats)}) as Character;
  });
  return Object.freeze(result);
}

export function attributeTotal(character: Character): number {
  return STAT_KEYS.reduce((total,key) => total + character.stats[key], 0);
}

export function viewCatalog(characters: readonly Character[], options: CatalogOptions = {}): readonly Character[] {
  const query = typeof options.query === 'string' ? normalized(options.query.slice(0,100)) : '';
  const role = options.role === 'jedi' || options.role === 'pilot' ? options.role : 'all';
  const compareName = (a: Character,b: Character) => a.name.localeCompare(b.name,'pt-BR');
  const result = characters.filter(item => (role === 'all' || item.role === role) && normalized(item.name+' '+item.title).includes(query));
  result.sort(options.sort === 'attributes' ? (a,b) => attributeTotal(b)-attributeTotal(a) || compareName(a,b) : compareName);
  return result;
}
