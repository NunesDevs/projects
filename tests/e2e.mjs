import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createPreview} from '../tools/preview.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.resolve(process.env.QA_OUTPUT_DIR||path.join(root,'reports/qa'));
await fs.mkdir(path.join(output,'images'),{recursive:true});
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const report={startedAt:new Date().toISOString(),checks:[],layouts:[],images:[],errors:[]};
let browser,preview;
function observe(page,label){page.on('pageerror',error=>report.errors.push({label,type:'pageerror',text:error.message}));page.on('console',message=>{if(message.type()==='error')report.errors.push({label,type:'console',text:message.text()});});page.on('response',response=>{if(response.status()>=400)report.errors.push({label,type:'http',url:response.url(),status:response.status()});});page.on('request',request=>{if(!request.url().startsWith(preview.origin)&&!request.url().startsWith('data:'))report.errors.push({label,type:'external',url:request.url()});});}
async function check(name,run){try{await run();report.checks.push({name,passed:true});console.log('PASS '+name);}catch(error){report.checks.push({name,passed:false,error:error.stack});console.log('FAIL '+name+': '+error.message);}}
async function context(width=390,blocked=false){const ctx=await browser.newContext({viewport:{width,height:1100},hasTouch:width<=430,locale:'pt-BR',reducedMotion:'reduce'});await ctx.addInitScript(()=>{Math.random=()=>0.999999;});if(blocked)await ctx.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{get(){throw Error('Storage blocked by QA');}});});return ctx;}
async function startGame(page,name='Jogador demo'){await page.goto(preview.origin+'/memory/');await page.locator('#nickname').fill(name);await page.locator('#play').click();await page.waitForURL('**/memory/pages/game.html');await page.locator('#grid .card').first().waitFor();}
try{
 preview=await createPreview(0);browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 await check('Memory: safe nickname, keyboard/touch, mismatch/reset, pause/time and complete game',async()=>{const ctx=await context(),page=await ctx.newPage();observe(page,'memory flow');try{
  await startGame(page,'<img src=x>');assert.equal(await page.locator('#player').textContent(),'<img src=x>');assert.equal(await page.locator('#player img').count(),0);
  const cards=page.locator('#grid .card');await cards.nth(0).focus();await cards.nth(0).press('Enter');await cards.nth(1).tap();assert.equal(await page.locator('#moves').textContent(),'01');await cards.nth(2).evaluate(button=>button.click());assert.equal(await page.locator('#grid img').count(),2);
  await page.locator('#restart').tap();await page.waitForTimeout(550);assert.equal(await page.locator('#moves').textContent(),'00');assert.equal(await page.locator('#grid img').count(),0);
  await cards.nth(0).tap();await cards.nth(10).tap();assert.equal(await page.locator('#pairs').textContent(),'1/10');await page.waitForTimeout(1150);await page.locator('#pause').tap();const stopped=await page.locator('#time').textContent();assert.equal(await page.locator('#grid img').count(),0);await page.waitForTimeout(650);assert.equal(await page.locator('#time').textContent(),stopped);await page.locator('#pause').tap();assert.equal(await page.locator('#grid img').count(),2);
  for(let i=1;i<10;i++){await cards.nth(i).tap();await cards.nth(i+10).tap();}assert.equal(await page.locator('#pairs').textContent(),'10/10');assert.match(await page.locator('#game_status').textContent(),/encontrou os 10 pares/);const done=await page.locator('#time').textContent();await page.waitForTimeout(550);assert.equal(await page.locator('#time').textContent(),done);
  await page.locator('#restart').tap();assert.equal(await page.locator('#pairs').textContent(),'0/10');await page.getByRole('link',{name:'Catálogo',exact:true}).tap();await page.getByRole('heading',{name:'Catálogo de personagens'}).waitFor();
 }finally{await ctx.close();}});
 await check('Memory: visitor works with blocked storage and root redirects safely',async()=>{const ctx=await context(390,true),page=await ctx.newPage();observe(page,'storage flow');try{await page.goto(preview.origin);await page.waitForURL('**/memory/');await page.locator('#nickname').fill('  ');assert.equal(await page.locator('#play').isDisabled(),true);await page.locator('#visitor').tap();await page.waitForURL('**/memory/pages/game.html');assert.equal(await page.locator('#player').textContent(),'Visitante');await page.locator('#grid .card').first().tap();assert.equal(await page.locator('#grid img').count(),1);}finally{await ctx.close();}});
 await check('Catalogue: actual local data, combined filters, reset, numeric sort and navigation', async () => {
  const ctx = await context(1440);
  const page = await ctx.newPage();
  observe(page, 'catalogue flow');
  const query = page.locator('#query');
  const role = page.locator('#role');
  const order = page.locator('#sort');
  const waitForCardCount = (count) => page.waitForFunction(
   expected => document.querySelectorAll('.character-card').length === expected,
   count
  );

  try {
   await page.goto(preview.origin + '/catalogue');
   await page.waitForURL('**/catalogue/');
   await waitForCardCount(4);
   await query.fill('Skywalker');
   await waitForCardCount(2);
   await role.selectOption('pilot');
   await page.getByRole('heading', { name: 'Nenhum personagem encontrado' }).waitFor();
   await page.getByRole('button', { name: 'Limpar filtros' }).click();
   await waitForCardCount(4);
   assert.equal(await query.inputValue(), '');
   assert.equal(await role.inputValue(), 'all');
   assert.equal(await order.inputValue(), 'name');
   await order.selectOption('attributes');
   await page.locator('.character-card:first-child[data-id="obi-wan"]').waitFor();
   assert.equal(await page.locator('[data-id=anakin] dd').last().textContent(), '0');
   await page.getByRole('link', { name: 'Memória', exact: true }).click();
   await page.locator('#nickname').waitFor();
  } finally {
   await ctx.close();
  }
 });
 for(const app of['memory','catalogue'])for(const width of[320,360,390,430,768,1024,1440,1920]){const ctx=await context(width),page=await ctx.newPage();observe(page,app+' '+width);try{if(app==='memory'){await startGame(page);await page.locator('#grid .card').nth(0).click();await page.locator('#grid .card').nth(10).click();}else{await page.goto(preview.origin+'/catalogue/');await page.locator('.character-card').first().waitFor();}await page.evaluate(()=>document.fonts.ready);const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),minimumTarget:Math.min(...[...document.querySelectorAll('button,input,select,a.button')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect().height))}));assert.ok(layout.scrollWidth<=width,app+' horizontal overflow '+width);assert.ok(layout.minimumTarget>=44);assert.ok(layout.fonts.every(f=>f.status==='loaded'));report.layouts.push({app,width,...layout});if(width===390||width===1440){const filename='projects-'+app+'-'+(width===390?'mobile':'desktop')+'.png',imagePath=path.join(output,'images',filename);await page.screenshot({path:imagePath,fullPage:true});report.images.push({projectSlug:'projects',kind:'application',imagePath,viewport:{width,height:1100},sourceCommit:null,sourceState:'reviewed-working-tree-pending-commit',captureSHA256:crypto.createHash('sha256').update(await fs.readFile(imagePath)).digest('hex'),sanitized:true,source:page.url(),app,fullPage:true});}console.log('PASS layout '+app+' '+width);}finally{await ctx.close();}}
}catch(error){report.errors.push({type:'runner',text:error.stack});}
finally{if(browser)await browser.close();if(preview)await new Promise(resolve=>preview.server.close(resolve));report.finishedAt=new Date().toISOString();report.passed=report.checks.length===3&&report.checks.every(c=>c.passed)&&report.layouts.length===16&&report.images.length===4&&report.errors.length===0;await fs.writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,layouts:report.layouts.length,images:report.images.length,errors:report.errors}));if(!report.passed)process.exitCode=1;}
