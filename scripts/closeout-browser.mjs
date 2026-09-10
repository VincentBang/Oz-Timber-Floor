import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {buildImageDimensionReport, priorityRoutes} from './image-dimension-audit.mjs';
import {repositoryRoot as root, browserOutput as output} from './closeout-paths.mjs';

// Current evidence only. Historical browser reports are never rewritten. All
// non-GET requests are denied, including contact submissions and analytics.
const {chromium}=createRequire(import.meta.url)(process.env.OZ_PLAYWRIGHT_PATH || '/Users/daibang/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const write=(name,value)=>fs.writeFileSync(path.join(output,name),JSON.stringify(value,null,2)+'\n');
const views=[{width:1440,height:1000},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:320,height:800}];
const routes=[...new Set([...priorityRoutes.map(x=>x.route),'/ranges/','/ranges/avala/','/products/avala-blackbutt/','/privacy/','/terms/','/404.html','/ranges/hardwood-collection/','/products/hardwood-collection-forest-oak/','/guides/choosing-office-flooring-durability-design-performance/','/vinyl/','/hardwood-timber-flooring-sydney/'])];
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon','.xml':'application/xml'};
const rules=fs.readFileSync(path.join(root,'_redirects'),'utf8').split(/\r?\n/).map(x=>x.trim().split(/\s+/)).filter(x=>x.length>=2&&!x[0].startsWith('#'));
function physical(route){
  const file=path.resolve(root,decodeURIComponent(route).replace(/^\//,''));
  if(!file.startsWith(root+'/')&&file!==root)throw new Error('Traversal denied');
  return [file,path.join(file,'index.html'),file+'.html'].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile()) || null;
}
function match(from,p){return from==='/*'||from===p||(!path.extname(p)&&from===p.replace(/\/$/,'')+'/');}
function resolve(p){
  const existing=physical(p);
  const rule=rules.find(r=>match(r[0],p)&&(!existing||r[2]?.endsWith('!')));
  if(rule){const code=parseInt(rule[2]||'301');return {status:code,file:code===200||code>=400?physical(rule[1]):null,location:rule[1]};}
  return {status:existing?200:404,file:existing||physical('/404.html')};
}
const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const u=new URL(req.url,'http://local'),r=resolve(u.pathname);
  if(r.status>=300&&r.status<400){res.writeHead(r.status,{Location:r.location+u.search});res.end();return;}
  res.writeHead(r.status,{'Content-Type':mime[path.extname(r.file||'')]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});
  res.end(req.method==='HEAD'?undefined:r.file?fs.readFileSync(r.file):'Not found');
});
let base=process.env.OZ_BROWSER_BASE_URL;
if(!base){await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
else if(!/^https:\/\/[a-z0-9-]+--oztimberfloor\.netlify\.app$/.test(base))throw new Error('Only an Oz non-production HTTPS draft may be tested');
fs.mkdirSync(path.join(output,'screenshots'),{recursive:true});
const staticAudit=buildImageDimensionReport();
const start=new Date().toISOString(), sourceHashes={};
for(const f of ['assets/site.js','assets/site.css','assets/contact-config.js','_redirects',...routes.map(r=>path.relative(root,resolve(r).file))])sourceHashes[f]=sha(fs.readFileSync(path.join(root,f)));
const report={schemaVersion:1,startedAt:start,baseUrl:base,sourceHashes,routeMatrix:[],captures:[],mobileInteractions:[],productImageStyles:[],dockTests:[],failures:[],nonGetRequests:[],emulated:true};
const records=[];
const interactionsOnly=process.argv.includes('--interactions-only');
if(interactionsOnly){
 const prior=JSON.parse(fs.readFileSync(path.join(output,'browser-qa.json')));
 for(const [file,hash]of Object.entries(prior.sourceHashes))if(sha(fs.readFileSync(path.join(root,file)))!==hash)throw new Error('Cannot reuse stale matrix: '+file);
 report.routeMatrix=prior.routeMatrix;report.captures=prior.captures;report.matrixStartedAt=prior.startedAt;report.matrixBaseUrl=prior.baseUrl;
 report.failures=prior.failures.filter(x=>x.kind==='route-cell'||x.kind==='source-drift');
 records.push(...JSON.parse(fs.readFileSync(path.join(output,'priority-current-records.json'))));
}
const browser=await chromium.launch({executablePath:process.env.OZ_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,chromiumSandbox:true});
report.browserVersion=browser.version();
async function context(viewport){const c=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});await c.route('**/*',async r=>{if(!['GET','HEAD'].includes(r.request().method())){report.nonGetRequests.push({method:r.request().method(),url:r.request().url()});await r.abort();}else await r.continue();});return c;}
async function load(page,route,scroll=true){
  const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:60000});await page.evaluate(()=>document.fonts.ready);
  if(scroll)await page.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';for(let y=0;y<document.documentElement.scrollHeight;y+=Math.max(200,innerHeight-100)){scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}await Promise.race([Promise.all([...document.images].map(x=>x.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,5000))]);scrollTo(0,0);});
  await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,0);});await page.waitForTimeout(150);return response;
}
function fail(kind,detail){report.failures.push({kind,...detail});}
try{
 for(const viewport of interactionsOnly?[]:views){const c=await context(viewport);
  for(const route of routes){
   const page=await c.newPage(),errors=[],requests=[];
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>requests.push({url:r.url(),error:r.failure()?.errorText}));
   await page.addInitScript(()=>{window.ozVitals={lcp:null,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.ozVitals.lcp={startTime:e.startTime,size:e.size,url:e.url,tag:e.element?.tagName};}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.ozVitals.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
   const response=await load(page,route);const bytes=await response.body();
   const scan=await page.evaluate(()=>({broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),pending:[...document.images].filter(i=>!i.complete).map(i=>i.src),overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,h1Count:document.querySelectorAll('h1').length}));
   // Fresh natural top after the lazy scan avoids sticky compositor artifacts.
   await load(page,route,false);
   const metrics=await page.evaluate(()=>{
    const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,left:r.left,right:r.right};};
    const imgs=[...document.images],candidate=document.querySelector('[data-lcp-image]');
    const visible=e=>{const r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0;};
    const ctas=[...document.querySelectorAll('a.button, a.btn, .header-cta')].filter(visible).map(e=>({text:e.textContent.trim(),href:e.getAttribute('href'),box:rect(e)}));
    return {scrollY,header:rect(document.querySelector('.site-header')),brand:rect(document.querySelector('.brand')||document.querySelector('.site-header img')),visibleImagesReady:imgs.filter(visible).every(i=>i.complete&&i.naturalWidth>0),missingDims:imgs.filter(i=>!i.getAttribute('width')||!i.getAttribute('height')).length,highCount:imgs.filter(i=>i.fetchPriority==='high').length,candidate:candidate?{src:candidate.getAttribute('src'),loading:candidate.loading}:null,vitals:window.ozVitals,ctas,h1:document.querySelector('h1')?.textContent.trim(),hero:rect(document.querySelector('.hero')),reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
   });
   const file=path.relative(root,resolve(route).file),measuredAt=new Date().toISOString();
   const success=(response.status()===200||(route==='/404.html'&&response.status()===404))&&!scan.broken.length&&!scan.pending.length&&scan.overflow<=0&&scan.h1Count===1&&!errors.length&&!requests.length&&metrics.scrollY===0&&metrics.visibleImagesReady;
   const cell={route,viewport,status:response.status(),resolvedUrl:page.url(),measuredAt,sourceSha256:sha(fs.readFileSync(path.join(root,file))),responseSha256:sha(bytes),file,...scan,...metrics,errors,failedRequests:requests,success};report.routeMatrix.push(cell);
   if(!success)fail('route-cell',{route,width:viewport.width,scan,errors,requests});
   if(priorityRoutes.some(x=>x.route===route))records.push({url:route,viewport:{w:viewport.width,h:viewport.height},measuredAt,sourceSha256:cell.sourceSha256,missingDims:metrics.missingDims,highCount:metrics.highCount,overflow:scan.overflow,candidate:metrics.candidate,vitals:metrics.vitals,consoleErrors:errors.length,failedRequests:requests.length});
   if([1440,320].includes(viewport.width)&&['/','/floor-levelling/','/hybrid/','/engineered-timber-flooring/','/contact/','/ranges/avala/','/products/avala-blackbutt/','/projects/'].includes(route)){
    const name=route==='/'?'home':route.replace(/^\/|\/$/g,'').replaceAll('/','-');const file=`screenshots/${name}-${viewport.width}x${viewport.height}.png`;const png=await page.screenshot({path:path.join(output,file),animations:'disabled'});report.captures.push({route,viewport,file,sha256:sha(png),bytes:png.length});
   }
   await page.close();
  }await c.close();console.log(`Current browser ${viewport.width}px: ${routes.length} routes measured`);write('browser-progress.json',report);
 }
 for(const width of [320,390,768]){
  const c=await context(views.find(v=>v.width===width)),page=await c.newPage();await load(page,'/',false);await page.locator('.nav-toggle').click();
  const m={width,...await page.evaluate(()=>({open:document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='true',bodyLocked:document.body.style.position==='fixed'&&document.body.style.overflow==='hidden'}))};
  for(const name of ['services','products']){const b=page.getByRole('button',{name:`Toggle ${name} menu`,exact:true});await b.click();m[name+'Expanded']=await b.getAttribute('aria-expanded')==='true';}
  m.drawer=await page.locator('.site-header').evaluate(e=>{const r=e.getBoundingClientRect(),before=e.scrollTop;e.scrollTop=e.scrollHeight;const nav=e.querySelector('.nav-links').getBoundingClientRect();return {scrollNeeded:e.scrollHeight>e.clientHeight,scrolls:e.scrollTop>before,fits:r.left>=0&&r.right<=innerWidth&&nav.left>=0&&nav.right<=innerWidth,overflow:document.documentElement.scrollWidth>innerWidth};});
  await page.keyboard.press('Escape');m.escape=await page.evaluate(()=>({closed:document.querySelector('.nav-toggle').getAttribute('aria-expanded')==='false',unlocked:!document.body.classList.contains('mobile-nav-scroll-locked'),reset:[...document.querySelectorAll('.nav-dropdown-toggle')].every(b=>b.getAttribute('aria-expanded')==='false')}));
  await page.locator('.nav-toggle').click();await page.evaluate(()=>document.querySelector('main').dispatchEvent(new MouseEvent('click',{bubbles:true})));m.outsideClick={method:'synthetic bubbling main click; full-height drawer has no guaranteed outside point',closed:await page.locator('.nav-toggle').getAttribute('aria-expanded')==='false'};
  await page.locator('.nav-toggle').click();await page.locator('.nav-toggle').click();m.toggleCloses=await page.locator('.nav-toggle').getAttribute('aria-expanded')==='false';
  m.success=m.open&&m.bodyLocked&&m.servicesExpanded&&m.productsExpanded&&(!m.drawer.scrollNeeded||m.drawer.scrolls)&&m.drawer.fits&&!m.drawer.overflow&&Object.values(m.escape).every(Boolean)&&m.outsideClick.closed&&m.toggleCloses;report.mobileInteractions.push(m);if(!m.success)fail('mobile-menu',{width,m});
  if(width!==768){
   await load(page,'/products/avala-blackbutt/');const styles=await page.locator('main img').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return {src:e.getAttribute('src'),filter:s.filter,opacity:s.opacity,blend:s.mixBlendMode};}));report.productImageStyles.push({width,styles,success:styles.every(s=>s.filter==='none'&&s.opacity==='1'&&s.blend==='normal')});
   const dock=page.locator('main > .mobile-sticky-cta');const exists=await dock.count();const checks=[];
   for(const selector of ['.product-hero .button-row','main > .section:last-of-type .button-row','.site-footer']){const target=page.locator(selector).first();if(await target.count()){await target.scrollIntoViewIfNeeded();await page.waitForTimeout(250);checks.push({selector,suppressed:exists?await dock.getAttribute('aria-hidden')==='true':false});}}
   report.dockTests.push({width,route:'/products/avala-blackbutt/',exists:!!exists,checks,success:!!exists&&checks.length>=2&&checks.every(x=>x.suppressed)});
  }
  await c.close();
 }
 const c=await context({width:320,height:800}),page=await c.newPage();
 await load(page,'/floor-levelling/');const faq=page.locator('details.faq-item').first(),summary=faq.locator('summary');const initiallyClosed=!(await faq.getAttribute('open')!==null);await summary.focus();const focus=await summary.evaluate(e=>{const s=getComputedStyle(e);return {active:document.activeElement===e,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,outlineColor:s.outlineColor,boxShadow:s.boxShadow};});await page.keyboard.press('Enter');const opened=await faq.getAttribute('open')!==null;await page.keyboard.press('Enter');const closed=await faq.getAttribute('open')===null;report.faqKeyboard={initiallyClosed,opened,closed,focus,success:initiallyClosed&&opened&&closed&&focus.active&&(focus.outlineStyle!=='none'||focus.boxShadow!=='none')};
 await load(page,'/ranges/');const cards=page.locator('[data-range-card]'),total=await cards.count();const beyond=cards.nth(12);await beyond.scrollIntoViewIfNeeded();const beyondAccessible=await beyond.isVisible();await page.locator('#rangeSearch').fill('no-match-oz-release-qa');const emptyCount=await page.locator('[data-range-card]:visible').count();await page.locator('#rangeSearch').fill('');const restored=await page.locator('[data-range-card]:visible').count();report.catalogue={total,beyondItem12Accessible:beyondAccessible,emptyCount,restored,clearMethod:'Clear existing search input; this page has no separate clear button',success:total>12&&beyondAccessible&&emptyCount===0&&restored===total};
 const actual=fs.readFileSync(path.join(root,'ranges/hardwood-collection/index.html'),'utf8').match(/href="(\/contact\/\?enquiry=stock&amp;product=Hardwood\+Collection\+Forest\+Oak[^"]+)"/)?.[1]?.replaceAll('&amp;','&');if(!actual)throw new Error('Expected current range CTA missing');await load(page,actual);
 const contact=await page.evaluate(()=>{const f=document.querySelector('form[data-contact-form]');return {formName:f.getAttribute('name'),action:f.getAttribute('action'),enquiry:document.querySelector('#enquiryType').value,product:document.querySelector('#product').value,productSlug:document.querySelector('#productSlug').value,range:document.querySelector('#rangeField').value,category:document.querySelector('#category').value,sourcePage:document.querySelector('#sourcePage').value,summaryVisible:!document.querySelector('[data-selected-enquiry]').hidden,consentRequired:f.querySelector('[name="consent"]').required,fields:[...f.elements].map(e=>({name:e.name,type:e.type,required:e.required}))};});
 await page.locator('#enquiryType').selectOption('service');contact.selection=await page.evaluate(()=>({serviceVisible:!document.querySelector('[data-field="service_type"]').hidden,productHidden:document.querySelector('[data-field="product"]').hidden}));await page.locator('#enquiryType').selectOption('stock');const submit=page.locator('form[data-contact-form] button[type="submit"]');await submit.scrollIntoViewIfNeeded();contact.submit=await submit.evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {visible:r.width>0&&r.height>0,unobstructed:e===h||e.contains(h)};});
 contact.success=contact.formName==='oz-flooring-enquiry'&&contact.action==='/thank-you/'&&contact.enquiry==='stock'&&contact.product==='Hardwood Collection Forest Oak'&&contact.productSlug==='hardwood-collection-forest-oak'&&contact.range==='Hardwood Collection'&&contact.category==='Engineered timber'&&contact.sourcePage==='/ranges/hardwood-collection/'&&contact.summaryVisible&&contact.consentRequired&&contact.selection.serviceVisible&&contact.selection.productHidden&&contact.submit.visible&&contact.submit.unobstructed;report.contact=contact;
 await c.close();
 for(const key of ['catalogue','contact','faqKeyboard'])if(!report[key].success)fail(key,report[key]);
 for(const key of ['dockTests','productImageStyles'])for(const test of report[key])if(!test.success)fail(key,test);
 for(const [file,hash]of Object.entries(sourceHashes))if(sha(fs.readFileSync(path.join(root,file)))!==hash)fail('source-drift',{file});
 if(report.nonGetRequests.length)fail('non-get-request',{count:report.nonGetRequests.length});
}catch(error){fail('execution-error',{message:error.stack});}
finally{await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
report.endedAt=new Date().toISOString();report.success=report.failures.length===0;write('browser-qa.json',report);write('priority-current-records.json',records);
console.log(JSON.stringify({success:report.success,browser:report.browserVersion,cells:report.routeMatrix.length,priorityCells:records.length,captures:report.captures.length,failures:report.failures},null,2));
if(!report.success)process.exitCode=1;
