import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
export async function createPreview(port=0){
 const base=await fs.realpath(path.join(root,'dist/site'));
 const server=http.createServer(async(request,response)=>{
  response.setHeader('X-Content-Type-Options','nosniff');response.setHeader('Referrer-Policy','no-referrer');
  response.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  try{if(!['GET','HEAD'].includes(request.method)){response.writeHead(405).end();return;}const url=new URL(request.url,'http://127.0.0.1'),decoded=decodeURIComponent(url.pathname);if(decoded.includes('\0')||decoded.split('/').some(part=>part.startsWith('.'))){response.writeHead(400).end();return;}
   let candidate=path.resolve(base,'.'+decoded);if(candidate!==base&&!candidate.startsWith(base+path.sep)){response.writeHead(403).end();return;}let stat=await fs.stat(candidate);if(stat.isDirectory()){if(!url.pathname.endsWith('/')){response.writeHead(308,{Location:url.pathname+'/'+url.search}).end();return;}candidate=path.join(candidate,'index.html');}const real=await fs.realpath(candidate);if(!real.startsWith(base+path.sep)){response.writeHead(403).end();return;}const content=await fs.readFile(real);response.writeHead(200,{'Content-Type':types[path.extname(real)]||'text/plain; charset=utf-8','Content-Length':content.length});response.end(request.method==='HEAD'?undefined:content);
  }catch(error){response.writeHead(['ENOENT','ENOTDIR'].includes(error.code)?404:400).end();}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 return{server,origin:'http://127.0.0.1:'+server.address().port};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||4331);if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');const{origin}=await createPreview(port);console.log(origin);}
