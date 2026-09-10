import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createPublicationInventory,publicationBlockingIssues} from './publication-inventory.mjs';
import {repositoryRoot as root,closeoutRoot} from './closeout-paths.mjs';

// The approved manifest is an immutable specification, never a regenerated
// actual-state baseline. Historical OZ-MIG-004 contract/evidence remains intact.
const r1Dir=path.join(root,'docs/seo-migration/OZ-MIG-004/revisions/R1');
const digest='d2ab0a23d6d171ef465a933ea191eabdb1db68ae6c4337b5c948ca0f68bf8fa7';
const parentDigest='ab50628d77038ea331e94d253aa4735ee0405a05f5d1d785b8cd28bf5650514e';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=f=>fs.readFileSync(path.join(root,f));
const specBytes=fs.readFileSync(path.join(r1Dir,'DECISION_PLAN_R1.json'));
assert.equal(sha(specBytes),digest,'Approved R1 bytes changed');
const p=JSON.parse(specBytes);
assert.equal(p.parentDecisionJsonSha256,parentDigest);
assert.equal(sha(read('docs/seo-migration/OZ-MIG-004/DECISION_PLAN.json')),parentDigest);
for(const [f,hash]of Object.entries(p.referencedArtifactHashes))assert.equal(sha(fs.readFileSync(path.join(r1Dir,f))),hash,f);
const failures=[],results=[];
for(const op of p.fileOperations){
 let actual=read(op.file).toString();
 // Exact inverse of reviewed report-location plumbing only. No source HTML,
 // routing/data operation gets a blanket hash exception.
 if(op.file==='scripts/image-dimension-audit.mjs')actual=actual.replace('docs/release/OZ-RELEASE-CLOSEOUT/generated/performance/image-dimension-audit.json','docs/performance/generated/image-dimension-audit.json');
 if(op.file==='scripts/seo-migration-hardening.mjs')actual=actual.replace('process.env.OZ_MIGRATION_GENERATED_DIR\n  ? path.resolve(process.env.OZ_MIGRATION_GENERATED_DIR)\n  : path.join(root, "docs/release/OZ-RELEASE-CLOSEOUT/generated/migration")','path.join(root, "docs", "seo-migration", "generated")');
 const ok=sha(actual)===op.afterSha256;results.push({id:op.id,file:op.file,actualSha256:sha(read(op.file)),approvedSha256:op.afterSha256,success:ok});if(!ok)failures.push('Unapproved operation drift: '+op.file);
}
// All other public bytes and historical evidence must match task-entry HEAD.
// Status documents had inherited edits and are intentionally not public inputs.
const git=(args,encoding)=>execFileSync('git',args,{cwd:root,encoding,maxBuffer:64e6});
const repairBytes=read('config/closeout-mechanical-repairs.json');
assert.equal(sha(repairBytes),'4127c9d96e8422340512361d35727b807aa5ff0213fbed0f5960d1feb39f731e','Reviewed mechanical repair specification changed');
const mechanical=JSON.parse(repairBytes).repairs;
assert.deepEqual(mechanical.map(x=>x.file),['assets/site.js']);
for(const repair of mechanical){
 let expected=git(['show',p.startingHead+':'+repair.file],'utf8');assert.equal(sha(expected),repair.beforeSha256);
 for(const edit of repair.edits){assert.equal(expected.split(edit.before).length,2,'Repair anchor must be unique');expected=expected.replace(edit.before,edit.after);}
 assert.equal(sha(expected),repair.afterSha256);if(sha(read(repair.file))!==sha(expected))failures.push('Unreviewed mechanical repair drift: '+repair.file);
}
const tracked=git(['ls-tree','-r',p.startingHead],'utf8').trim().split('\n').map(line=>{const [info,file]=line.split('\t');return {file,blob:info.split(' ')[2]};});
const operated=new Set([...p.fileOperations.map(x=>x.file),...mechanical.map(x=>x.file)]);let immutableCount=0;
for(const {file,blob} of tracked){
 const protectedFile=file.endsWith('.html')||file.startsWith('assets/')||file.startsWith('data/')||file.startsWith('config/')||file.startsWith('migration/')||file.startsWith('docs/seo-migration/')||file.startsWith('docs/ui-ux/')||file.startsWith('docs/performance/')||['_headers','robots.txt','netlify.toml','scripts/current-release-contract.mjs'].includes(file);
 if(!protectedFile||operated.has(file))continue;
 if(!fs.existsSync(path.join(root,file))){failures.push('Protected file removed: '+file);continue;}
 const bytes=read(file),actual=crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');immutableCount++;if(actual!==blob)failures.push('Protected baseline drift: '+file);
}
const inventory=createPublicationInventory({root,domain:'https://oztimberfloor.com.au'});
for(const key of ['physicalHtmlFiles','physicalIndexableHtmlFiles','publicationRoutes','sitemapRoutes','noindexRoutes','redirectOnlyRoutes']){
 try{assert.deepEqual(inventory[key],p.fullProposedPublication[key]);}catch{failures.push('Approved publication set/count differs: '+key);}
}
for(const issue of publicationBlockingIssues(inventory))failures.push(issue);
const incoming=p.ruleOperations.filter(r=>r.disposition==='RETARGET_DIRECTLY_TO_SELECTED_OWNER');
assert.equal(incoming.length,413);assert.equal(incoming.filter(r=>r.protectedCohort.member).length,297);
const shadow=incoming.filter(r=>r.sourceShadowedByExistingControlledPage);assert.equal(shadow.length,128);
const ruleLines=read('_redirects').toString().split(/\r?\n/);
for(const r of p.ruleOperations){if(r.after&&!ruleLines.includes(r.after))failures.push('Rule missing: '+r.id);if(r.sourceShadowedByExistingControlledPage&&r.forceAfter)failures.push('Shadow was forced: '+r.id);}
const report={task:'OZ-RELEASE-CLOSEOUT',checkedAt:new Date().toISOString(),r1Sha256:digest,parentSha256:parentDigest,success:!failures.length,approvedOperationCount:results.length,immutableBaselineFiles:immutableCount,counts:{physicalHtml:inventory.physicalHtmlFiles,physicalIndexable:inventory.physicalIndexableHtmlFiles,publication:inventory.publicationRoutes.length,sitemap:inventory.sitemapRoutes.length,noindex:inventory.noindexRoutes.length,redirectOnly:inventory.redirectOnlyRoutes.length,incoming:incoming.length,protectedRules:297,shadowedIncoming:shadow.length},publicationRoutes:inventory.publicationRoutes,sitemapRoutes:inventory.sitemapRoutes,operations:results,failures};
fs.mkdirSync(closeoutRoot,{recursive:true});fs.writeFileSync(path.join(closeoutRoot,'CURRENT_RELEASE_CONTRACT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,operations:undefined,publicationRoutes:undefined,sitemapRoutes:undefined},null,2));if(failures.length)process.exitCode=1;
