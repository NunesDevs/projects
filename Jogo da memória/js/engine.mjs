/** Pure memory-game rules. Timers and rendering belong to the browser adapter. */
export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Random value must be in [0, 1)');
    const other = Math.floor(value * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function playerName(value) {
  if (typeof value !== 'string') return 'Visitante';
  return value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ').slice(0, 32) || 'Visitante';
}

export class MemoryGame {
  #symbols; #random; #now; #deck; #status; #selected; #matched; #turns; #elapsed; #started;
  constructor({symbols, random = Math.random, now = () => performance.now()} = {}) {
    if (!Array.isArray(symbols) || symbols.length < 2 || symbols.length > 20 || symbols.some(s => typeof s !== 'string' || !s || s.length > 64) || new Set(symbols).size !== symbols.length) throw new TypeError('Use 2 to 20 unique symbol identifiers');
    if (typeof random !== 'function' || typeof now !== 'function') throw new TypeError('Invalid clock or random source');
    this.#symbols = [...symbols]; this.#random = random; this.#now = now;
    this.reset();
  }
  #time() {
    const value = this.#now();
    if (!Number.isFinite(value)) throw new RangeError('Invalid clock');
    return value;
  }
  reset() {
    const deck = shuffle([...this.#symbols, ...this.#symbols], this.#random);
    this.#deck = deck; this.#status = 'ready'; this.#selected = []; this.#matched = new Set();
    this.#turns = 0; this.#elapsed = 0; this.#started = null;
  }
  flip(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.#deck.length || this.#status === 'paused' || this.#status === 'won' || this.#selected.length === 2 || this.#selected.includes(index) || this.#matched.has(index)) return false;
    if (this.#status === 'ready') { this.#started = this.#time(); this.#status = 'running'; }
    this.#selected.push(index);
    if (this.#selected.length === 2) {
      this.#turns++;
      const [first, second] = this.#selected;
      if (this.#deck[first] === this.#deck[second]) {
        this.#matched.add(first); this.#matched.add(second); this.#selected = [];
        if (this.#matched.size === this.#deck.length) {
          this.#elapsed += Math.max(0, this.#time() - this.#started);
          this.#started = null; this.#status = 'won';
        }
      }
    }
    return true;
  }
  settle() {
    if (this.#status !== 'running' || this.#selected.length !== 2) return false;
    this.#selected = []; return true;
  }
  pause() {
    if (this.#status !== 'running') return false;
    this.#elapsed += Math.max(0, this.#time() - this.#started);
    this.#started = null; this.#status = 'paused'; return true;
  }
  resume() {
    if (this.#status !== 'paused') return false;
    this.#started = this.#time(); this.#status = 'running'; return true;
  }
  snapshot() {
    const elapsedMs = this.#elapsed + (this.#status === 'running' ? Math.max(0, this.#time() - this.#started) : 0);
    const paused = this.#status === 'paused';
    return Object.freeze({
      status: this.#status, turns: this.#turns, pairs: this.#matched.size / 2, totalPairs: this.#symbols.length,
      elapsedMs, locked: this.#selected.length === 2,
      cards: Object.freeze(this.#deck.map((symbol, index) => Object.freeze({
        id: index, matched: this.#matched.has(index),
        revealed: !paused && (this.#matched.has(index) || this.#selected.includes(index)),
        symbol: !paused && (this.#matched.has(index) || this.#selected.includes(index)) ? symbol : null,
      }))),
    });
  }
}
