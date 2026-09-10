import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {repositoryRoot as root,closeoutRoot} from './closeout-paths.mjs';
const domain='https://oztimberfloor.com.au',p=JSON.parse(fs.readFileSync(root+'/docs/seo-migration/OZ-MIG-004/revisions/R1/DECISION_PLAN_R1.json'));
const attrs=t=>Object.fromEntries([...t.matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(x=>[x[1].toLowerCase(),x[2]??x[3]??x[4]??'']));
function htmlState(file){const html=file&&file.endsWith('.html')?fs.readFileSync(root+'/'+file,'utf8'):'';const tags=[...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map(x=>attrs(x[0]));return {canonical:tags.find(x=>x.rel==='canonical')?.href||null,noindex:tags.filter(x=>x.name==='robots').some(x=>/\bnoindex\b/.test(x.content||''))};}
const norm=v=>new URL(v,domain).pathname.replace(/\/$/,'')||'/';
const rules=fs.readFileSync(root+'/_redirects','utf8').split(/\r?\n/).flatMap((line,i)=>{if(!line.trim()||line.startsWith('#'))return[];const [from,to,status='301',...conditions]=line.trim().split(/\s+/);return[{line:i+1,raw:line,from,to,status:parseInt(status),force:status.endsWith('!'),conditions}];});
assert.equal(rules.length,1930);assert(!rules.some(r=>r.conditions.length),'New conditions require explicit model handling');
function physical(url){const s=new URL(url,domain).pathname.slice(1);return [s||'index.html',s.replace(/\/$/,'')+'/index.html',s.replace(/\/$/,'')+'.html'].find(f=>fs.existsSync(root+'/'+f)&&fs.statSync(root+'/'+f).isFile())||null;}
function match(from,url){const a=norm(from),b=norm(url);return a.includes('*')?b.startsWith(a.slice(0,a.indexOf('*'))):a===b;}
function resolve(input,rs=rules){let url=new URL(input,domain),trail=[],seen=new Set();for(let i=0;i<20;i++){
 const key=url.pathname+url.search;if(seen.has(key))return {error:'loop',trail};seen.add(key);const file=physical(url),rule=rs.find(r=>match(r.from,url));
 if(rule&&(!file||rule.force)){trail.push(rule.raw);if(rule.status>=300&&rule.status<400){const next=new URL(rule.to,domain);if(!next.search)next.search=url.search;url=next;continue;}const target=physical(rule.to);return {status:rule.status,file:target,...htmlState(target),hops:trail.filter(t=>/\s3\d\d!?\s*$/.test(t)).length,query:url.search,trail};}
 return {status:file?200:404,file,...htmlState(file),hops:trail.length,query:url.search,trail};
}return {error:'hop-limit',trail};}
const tests=[],corrections=[];
const add=(id,expected,actual)=>{let success=true;try{assert.deepEqual(actual,expected);}catch{success=false;}tests.push({id,expected,actual,success});};
for(const op of p.ruleOperations.filter(r=>!r.from.includes('*'))){const spec=op.proposedEffectiveResponse;if(!spec)continue;const actual=resolve(op.from);const corrected=htmlState(spec.file);if(spec.canonical===null&&corrected.canonical)corrections.push({id:op.id,file:spec.file,canonical:corrected.canonical,reason:'Historical parser missed href-before-rel attribute order; HTML unchanged'});for(const key of ['status','file','hops'])add(op.id+':'+key,spec[key],actual[key]);add(op.id+':canonical',corrected.canonical,actual.canonical);add(op.id+':noindex',corrected.noindex,actual.noindex);}
const incoming=p.ruleOperations.filter(x=>x.disposition==='RETARGET_DIRECTLY_TO_SELECTED_OWNER');assert.equal(incoming.length,413);
for(const op of incoming){const query='?enquiry=stock&product=oak%20board&source=old%2Fpath&utm_source=closeout';const actual=resolve(op.from+query);add('QUERY:'+op.id,query,actual.query);if(op.sourceShadowedByExistingControlledPage){add('SHADOW:'+op.id,{hops:0,noindex:true},{hops:actual.hops,noindex:actual.noindex});}else add('DIRECT:'+op.id,{hops:1,canonical:domain+op.selectedFinalOwner},{hops:actual.hops,canonical:actual.canonical});}
for(const route of p.frozenDecisions.exact172HoldRoutes){const r=resolve(route);add('HOLD:'+route,{status:200,noindex:true,hops:0},{status:r.status,noindex:r.noindex,hops:r.hops});}
for(const b of p.frozenDecisions.bamboo.legacyUrls){const r=resolve(b.route);add('BAMBOO:'+b.route,{status:200,hops:1,canonical:domain+b.target},{status:r.status,hops:r.hops,canonical:r.canonical});}
for(const route of p.frozenDecisions.supplierOwners){const r=resolve(route);add('SUPPLIER:'+route,{status:200,canonical:domain+route,noindex:false},{status:r.status,canonical:r.canonical,noindex:r.noindex});}
for(const o of p.proposals.slice(0,9))for(const route of [o.selected_owner,o.selected_owner.slice(0,-1),o.selected_owner.slice(0,-1)+'.html',o.selected_owner+'index.html',o.current_candidate_owner,o.current_candidate_owner.slice(0,-1),o.current_candidate_owner.slice(0,-1)+'.html',o.current_candidate_owner+'index.html']){const r=resolve(route);add('VARIANT:'+route,{status:200,canonical:domain+o.selected_owner},{status:r.status,canonical:r.canonical});}
const hybrid=p.proposals.find(x=>x.id==='route-hybrid');
add('NEGATIVE:alias-force',0,resolve(hybrid.current_candidate_owner,rules.map(r=>norm(r.from)===norm(hybrid.current_candidate_owner)?{...r,force:false}:r)).hops);
add('NEGATIVE:owner-loop','loop',resolve(hybrid.current_candidate_owner,rules.map(r=>norm(r.from)===norm(hybrid.selected_owner)?{...r,to:hybrid.current_candidate_owner,status:301,force:true}:r)).error);
add('NEGATIVE:missing-payload',null,resolve(hybrid.selected_owner,rules.map(r=>norm(r.from)===norm(hybrid.selected_owner)?{...r,to:'/closeout-intentionally-absent.html'}:r)).file);
const failures=tests.filter(t=>!t.success),result={task:'OZ-RELEASE-CLOSEOUT',checkedAt:new Date().toISOString(),success:!failures.length,model:'Local first-match/force/physical-file model; not a substitute for Netlify HTTPS/Pretty-URL evidence',assertions:tests.length,incomingRules:incoming.length,shadowedIncoming:incoming.filter(x=>x.sourceShadowedByExistingControlledPage).length,canonicalParsingCorrections:corrections,tests,failures};fs.writeFileSync(closeoutRoot+'/LOCAL_ROUTING_CONTRACTS.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,tests:undefined},null,2));if(failures.length)process.exitCode=1;
