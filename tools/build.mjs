import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist'),out=path.join(dist,'site');
const ownerFile=path.join(dist,'.site-owner.json');
async function regular(filename){const info=await fs.lstat(filename);if(info.isSymbolicLink()||!info.isFile())throw Error('Expected regular file: '+path.basename(filename));return fs.readFile(filename);}
async function copyTree(source,destination){for(const entry of await fs.readdir(source,{withFileTypes:true})){const src=path.join(source,entry.name),dst=path.join(destination,entry.name);if(entry.isSymbolicLink())throw Error('Symlink in approved tree');if(entry.isDirectory()){await fs.mkdir(dst,{recursive:true});await copyTree(src,dst);}else{await fs.writeFile(dst,await regular(src));}}}
const angular=path.join(root,'monsters');
for(const folder of[root,angular])if((await fs.lstat(folder)).isSymbolicLink())throw Error('Unexpected project symlink');
await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(angular,'node_modules/@angular/cli/bin/ng.js'),'build'],{cwd:angular,windowsHide:true,stdio:'inherit',env:{...process.env,NG_CLI_ANALYTICS:'false'}});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Angular build failed: '+code)));});
await fs.mkdir(dist,{recursive:true});
if((await fs.lstat(dist)).isSymbolicLink()||await fs.realpath(dist)!==dist)throw Error('Unsafe build parent');
try{await fs.lstat(out);const owner=JSON.parse(await regular(ownerFile));if(owner.generator!=='nunesdevs-projects-static-v1'||owner.output!=='site'||(await fs.lstat(out)).isSymbolicLink()||await fs.realpath(out)!==out||path.dirname(out)!==dist)throw Error('Refusing to remove unknown output');await fs.rm(out,{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;}
await fs.mkdir(out);await fs.writeFile(ownerFile,JSON.stringify({generator:'nunesdevs-projects-static-v1',output:'site'})+'\n');
const memory=path.join(root,'Jogo da memória');
for(const relative of['index.html','pages/game.html','css/game.css','js/login.js','js/game.js','js/engine.mjs']){const target=path.join(out,'memory',relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,await regular(path.join(memory,relative)));}
for(const relative of['assets/fonts','assets/symbols']){const target=path.join(out,'memory',relative);await fs.mkdir(target,{recursive:true});await copyTree(path.join(memory,relative),target);}
await fs.mkdir(path.join(out,'catalogue'));await copyTree(path.join(angular,'dist/monsters/browser'),path.join(out,'catalogue'));
const licenses=path.join(angular,'dist/monsters/3rdpartylicenses.txt');try{await fs.writeFile(path.join(out,'catalogue/3rdpartylicenses.txt'),await regular(licenses));}catch(error){if(error.code!=='ENOENT')throw error;}
await fs.writeFile(path.join(out,'LICENSE'),await regular(path.join(root,'LICENSE')));
await fs.writeFile(path.join(out,'index.html'),'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=./memory/"><link rel="icon" href="data:,"><title>Estudos interativos</title></head><body><a href="./memory/">Abrir jogo da memória</a> · <a href="./catalogue/">Abrir catálogo</a></body></html>\n');
const files=[];
async function inspect(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const filename=path.join(directory,entry.name),relative=path.relative(out,filename).split(path.sep).join('/');if(entry.isSymbolicLink())throw Error('Symlink in output');if(entry.isDirectory()){await inspect(filename);continue;}if(!/\.(?:html|css|m?js|svg|woff2|txt)$/.test(relative)&&relative!=='LICENSE')throw Error('Unexpected output extension: '+relative);const bytes=await regular(filename);if(/\.(?:html|css|m?js|svg)$/.test(relative)){const source=bytes.toString('utf8');if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source)||/sourceMappingURL|\.pkl\b|ssl\/|\.server\.key/.test(source)||/fonts\.googleapis\.com|64\.media\.tumblr|pinimg\.com/.test(source))throw Error('Disallowed content in runtime: '+relative);}
files.push({file:relative,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}
await inspect(out);
await fs.writeFile(path.join(dist,'site-manifest.json'),JSON.stringify({generatedAt:new Date().toISOString(),passed:true,files,policy:'Allowlisted memory files and compiled catalogue only; no old photos, TLS keys, source maps or internal docs'},null,2)+'\n');
console.log(JSON.stringify({passed:true,files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0)}));
