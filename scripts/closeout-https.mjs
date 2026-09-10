import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createPublicationInventory} from './publication-inventory.mjs';
import {repositoryRoot as root,closeoutRoot} from './closeout-paths.mjs';
const base=process.argv[2];assert(/^https:\/\/[a-z0-9-]+--oztimberfloor\.netlify\.app$/.test(base),'An explicit Oz draft URL is required');
const planBytes=fs.readFileSync(root+'/docs/seo-migration/OZ-MIG-004/revisions/R1/DECISION_PLAN_R1.json');
const p=JSON.parse(planBytes);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(sha(planBytes),'d2ab0a23d6d171ef465a933ea191eabdb1db68ae6c4337b5c948ca0f68bf8fa7','Approved R1 bytes changed');
const attributes=tag=>Object.fromEntries([...tag.matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(x=>[x[1].toLowerCase(),x[2]??x[3]??x[4]??'']));
const norm=x=>String(x||'').replace(/\s+/g,' ').trim();
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
function contract(html){
 const tags=[...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map(m=>attributes(m[0]));const metas=name=>tags.filter(t=>(t.name||'').toLowerCase()===name).map(t=>t.content);
 const canonical=tags.filter(t=>(t.rel||'').toLowerCase().split(/\s+/).includes('canonical')).map(t=>t.href);
 const jsonLd=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>attributes('<script '+m[1]+'>').type==='application/ld+json').map(m=>stable(JSON.parse(m[2])));
 return {title:[...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map(m=>norm(m[1])),description:metas('description'),canonical,robots:metas('robots').map(x=>x.toLowerCase().split(/[\s,]+/).filter(Boolean).sort().join(',')),h1:[...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>norm(m[1])),jsonLd,forms:[...html.matchAll(/<form\b[^>]*>/gi)].map(m=>{const a=attributes(m[0]);return {name:a.name,action:a.action,method:a.method};})};
}
const inventory=createPublicationInventory({root,domain:'https://oztimberfloor.com.au'}),tasks=[],corrections=[];
const ownerFile=new Map(inventory.publicationPages.map(x=>[x.route,x.file]));
const expected=f=>contract(fs.readFileSync(path.join(root,f),'utf8'));
function add(id,route,file,{status=200,firstStatus,shadow=false,maxApplicationHops=1}={}){tasks.push({id,route,file,status,firstStatus,shadow,maxApplicationHops,expected:file?expected(file):null});}
for(const page of inventory.publicationPages)add('sitemap:'+page.route,page.route,page.file,{firstStatus:200,maxApplicationHops:0});
for(const op of p.ruleOperations.filter(x=>x.disposition==='RETARGET_DIRECTLY_TO_SELECTED_OWNER'||x.sourceShadowedByExistingControlledPage)){
 const r=op.proposedEffectiveResponse;const policy={status:r.status,firstStatus:op.sourceShadowedByExistingControlledPage?200:301,shadow:op.sourceShadowedByExistingControlledPage,maxApplicationHops:op.sourceShadowedByExistingControlledPage?0:1};add(op.id,op.from,r.file,policy);
 if(op.disposition==='RETARGET_DIRECTLY_TO_SELECTED_OWNER')add('incoming-query:'+op.id,op.from+'?enquiry=stock&product=oak%20board&source=old%2Fpath&utm_source=oz_release_qa',r.file,policy);
 const c=r.file?expected(r.file).canonical[0]:null;if(r.canonical===null&&c)corrections.push({id:op.id,route:op.from,historicalParsedCanonical:null,actualApprovedHtmlCanonical:c,file:r.file,reason:'Attribute-order-independent parse; approved HTML preserved, no plan edits'});
}
for(const route of p.frozenDecisions.exact172HoldRoutes)add('hold:'+route,route,route.slice(1)+'index.html',{firstStatus:200});
for(const b of p.frozenDecisions.bamboo.legacyUrls)add('bamboo:'+b.route,b.route,ownerFile.get(b.target),{firstStatus:301});
for(const o of p.proposals.slice(0,9)){
 for(const route of [o.selected_owner,o.selected_owner.slice(0,-1),o.selected_owner.slice(0,-1)+'.html',o.selected_owner+'index.html'])add('owner-variant:'+route,route,ownerFile.get(o.selected_owner),{maxApplicationHops:0});
 for(const route of [o.current_candidate_owner,o.current_candidate_owner.slice(0,-1),o.current_candidate_owner.slice(0,-1)+'.html',o.current_candidate_owner+'index.html'])add('alias-variant:'+route,route,ownerFile.get(o.selected_owner),{firstStatus:301});
 add('query:'+o.current_candidate_owner,o.current_candidate_owner+'?utm_source=oz_release_qa&enquiry=stock',ownerFile.get(o.selected_owner),{firstStatus:301});
}
const semanticDecisions=JSON.parse(fs.readFileSync(root+'/data/seo-migration-redirect-expectations.json'));
// Existing ETF fallback is a physical noindex page, not a forced redirect.
// R1 explicitly preserves it; do not flatten this inherited exception into the
// separate 128 affected incoming-rule shadows or the 172 newly approved holds.
const etfSource='/ranges/etf-hybrid-spc-9mm/',etfTarget='/ranges/etf-9-0mm-hybrid/',etfFile='ranges/etf-hybrid-spc-9mm/index.html';
const etfRule=etfSource+' '+etfTarget+' 301';
const sourceRules=text=>text.split(/\r?\n/).filter(line=>line.trim().split(/\s+/)[0]===etfSource);
const inheritedRules=sourceRules(execFileSync('git',['show',p.startingHead+':_redirects'],{cwd:root,encoding:'utf8'}));
const etfInput={route:etfSource,target:etfTarget,html:fs.readFileSync(root+'/'+etfFile,'utf8'),rules:sourceRules(fs.readFileSync(root+'/_redirects','utf8')),fallback:semanticDecisions.catalogueFallbacks.find(x=>x.route===etfSource)};
function validateEtfShadow(input){
 assert.equal(input.route,etfSource);assert.equal(input.target,etfTarget);
 assert.deepEqual(input.fallback,{route:etfSource,target:etfTarget});
 assert.deepEqual(input.rules,[etfRule],'ETF fallback must retain its exact unforced rule');
 assert.deepEqual(inheritedRules,[etfRule],'ETF fallback baseline rule changed');
 const op=p.fileOperations.find(x=>x.file===etfFile);assert.equal(op?.id,'FILE-c347bae3b3fdc766');assert.equal(op.kind,'ADDRESS_REFERENCE_ONLY');
 const state=contract(input.html);assert.deepEqual(state.canonical,['https://oztimberfloor.com.au'+etfSource]);assert(state.robots.some(x=>x.split(',').includes('noindex')),'ETF physical control lost noindex');
 assert.equal(sha(input.html),op.afterSha256,'ETF physical control differs from exact approved R1 output');
 for(const inventory of [p.fullBeforePublication,p.fullProposedPublication]){assert(inventory.noindexRoutes.includes(etfSource));assert(!inventory.publicationRoutes.includes(etfSource));assert(!inventory.sitemapRoutes.includes(etfSource));}
 assert(!p.frozenDecisions.exact172HoldRoutes.includes(etfSource));
 assert(!p.ruleOperations.some(x=>x.from===etfSource),'ETF control must not be added to an affected incoming-rule cohort');
 return {file:etfFile,approvedFileOperation:op.id,approvedFileSha256:op.afterSha256};
}
const etfControl=validateEtfShadow(etfInput),etfNegativeControls=[];
for(const [id,mutation]of [['force',{rules:[etfRule+'!']}],['target',{rules:[etfSource+' /products/ 301']}],['noindex',{html:etfInput.html.replace(/noindex/g,'index')}],['fallback-target',{fallback:{route:etfSource,target:'/products/'}}]]){
 assert.throws(()=>validateEtfShadow({...etfInput,...mutation}),'ETF negative control must fail: '+id);etfNegativeControls.push({id,rejected:true});
}
const effectiveExpectationCorrections=[{source:etfSource,target:etfTarget,...etfControl,expectedStatus:200,expectedApplicationHops:0,reason:'Existing approved physical/noindex fallback shadows its unchanged unforced rule; not an additional member of the 128 affected-rule cohort or 172 holds',negativeControls:etfNegativeControls}];
for(const r of semanticDecisions.reviewedRedirects){
 if(r.source===etfSource){assert.equal(r.target,etfTarget);add('semantic:'+r.source,r.source,etfControl.file,{firstStatus:200,shadow:true,maxApplicationHops:0});}
 else {const file=ownerFile.get(r.target)||r.target.slice(1)+'index.html';add('semantic:'+r.source,r.source,fs.existsSync(root+'/'+file)?file:null);}
}
for(const route of p.frozenDecisions.supplierOwners)add('supplier:'+route,route,ownerFile.get(route),{firstStatus:200});
add('gone','/innovakitchens/','404.html',{status:410,firstStatus:410});add('notfound','/oz-release-intentional-missing-9d80ef/','404.html',{status:404,firstStatus:404});
for(const route of ['/.git/config','/.netlify/state.json','/AGENTS.md','/OZ_STATUS.md','/netlify.toml','/package.json','/data/product-catalogue.json','/data/catalogue-quality-overrides.json','/docs/seo-migration/OZ-MIG-004/revisions/R1/DECISION_PLAN_R1.json','/docs/release/OZ-RELEASE-CLOSEOUT/LEDGER.json','/migration/redirect-map.csv','/scripts/closeout-browser.mjs','/.env','/backup.zip','/assets/site.js.map'])tasks.push({id:'sensitive:'+route,route,status:404,firstStatus:404,sensitive:true});
const results=[],cache=new Map(),transients=[];let next=0;
async function throttle(){const time=Math.max(Date.now(),next);next=time+250;await new Promise(r=>setTimeout(r,Math.max(0,time-Date.now())));}
async function request(route){
 if(cache.has(route))return cache.get(route);
 const promise=(async()=>{let url=new URL(route,base),trail=[];for(let hop=0;hop<8;hop++){
  assert.equal(url.origin,base,'Cross-origin redirect refused');let response;
  for(let attempt=0;attempt<3;attempt++){await throttle();try{response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Oz-Release-Closeout-ReadOnly-QA/1.0'}});if(response.status<500&&response.status!==429)break;transients.push({url:url.href,status:response.status,attempt});await response.body?.cancel();}catch(e){transients.push({url:url.href,error:e.message,attempt});if(attempt===2)throw e;}await new Promise(r=>setTimeout(r,1000*(attempt+1)));}
  const location=response.headers.get('location');trail.push({url:url.href,status:response.status,location,noindex:response.headers.get('x-robots-tag')});if(response.status>=300&&response.status<400&&location){await response.body?.cancel();url=new URL(location,url);continue;}
  const html=await response.text();return {status:response.status,finalUrl:url.href,trail,bodySha256:sha(html),html,contentType:response.headers.get('content-type'),measuredAt:new Date().toISOString()};
 }throw new Error('Redirect loop or more than 7 hops: '+route);})();cache.set(route,promise);return promise;
}
let index=0;
async function worker(){while(index<tasks.length){const task=tasks[index++];const errors=[];try{
 const r=await request(task.route);if(r.status!==task.status)errors.push('status '+r.status+' expected '+task.status);if(task.firstStatus&&r.trail[0].status!==task.firstStatus)errors.push('first status '+r.trail[0].status+' expected '+task.firstStatus);
 if(!/noindex/.test(r.trail.at(-1).noindex||'')||!/nofollow/.test(r.trail.at(-1).noindex||''))errors.push('Missing global preview noindex/nofollow');
 const actual=contract(r.html);if(task.expected)for(const key of Object.keys(task.expected))if(JSON.stringify(actual[key])!==JSON.stringify(task.expected[key]))errors.push('Semantic mismatch: '+key);
 const normalizedPath=value=>new URL(value,base).pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/').replace(/\/$/,'')||'/';
 const redirectSteps=r.trail.filter(x=>x.status>=300&&x.status<400&&x.location).map(x=>({...x,kind:normalizedPath(x.url)===normalizedPath(new URL(x.location,x.url).href)?'provider-path-normalization':'application-owner-transition'}));
 const applicationHops=redirectSteps.filter(x=>x.kind==='application-owner-transition').length;
 if(applicationHops>(task.maxApplicationHops??1))errors.push('Unexpected application redirect chain: '+applicationHops);
 r.redirectSteps=redirectSteps;r.applicationHops=applicationHops;
 if(task.shadow&&(r.trail.length!==1||!actual.robots.some(x=>x.includes('noindex'))))errors.push('Reviewed shadow noindex/physical behavior changed');
 if(task.route.includes('?')){const final=new URL(r.finalUrl),requested=new URL(task.route,base);for(const [k,v]of requested.searchParams)if(final.searchParams.get(k)!==v)errors.push('Query lost: '+k);}
 if(task.sensitive&&(/DECISION_PLAN_R1|NETLIFY_AUTH_TOKEN|"ranges"\s*:|\[build\]/.test(r.html)))errors.push('Sensitive content served');
 results.push({...task,expected:undefined,actual,html:undefined,...r,html:undefined,success:!errors.length,errors});
 }catch(e){results.push({...task,expected:undefined,success:false,errors:[e.message]});}
 if(results.length%100===0){console.log('HTTPS contracts '+results.length+'/'+tasks.length+'; failures '+results.filter(x=>!x.success).length);save(false);}
}}
function save(complete){fs.writeFileSync(closeoutRoot+'/HTTPS_CONTRACTS.json',JSON.stringify({task:'OZ-RELEASE-CLOSEOUT',baseUrl:base,checkedAt:new Date().toISOString(),complete,success:complete&&results.every(x=>x.success),rateLimit:'At most 4 request starts/second; 3 concurrent workers; up to 2 retries recorded',tasks:tasks.length,uniqueUrls:cache.size,results,transients,canonicalParsingCorrections:corrections,effectiveExpectationCorrections},null,2)+'\n');}
await Promise.all([worker(),worker(),worker()]);save(true);const failures=results.filter(x=>!x.success);console.log(JSON.stringify({tasks:tasks.length,uniqueUrls:cache.size,success:!failures.length,failures:failures.map(x=>({id:x.id,route:x.route,errors:x.errors,trail:x.trail}))},null,2));if(failures.length)process.exitCode=1;
