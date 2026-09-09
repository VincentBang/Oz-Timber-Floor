import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const oldHost = /https?:\/\/oztimberfloor\.com\.au\/wp-content\/[^\s"'<>]+/gi;
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist"].includes(entry.name)) continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.html?$/.test(entry.name)) files.push(target);
  }
}

walk(root);
let references = [];
let changed = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (!oldHost.test(html)) {
    oldHost.lastIndex = 0;
    continue;
  }
  oldHost.lastIndex = 0;
  if (apply) {
    html = html.replace(/<img\b[^>]*>/gi, (tag) => {
      if (!oldHost.test(tag)) {
        oldHost.lastIndex = 0;
        return tag;
      }
      oldHost.lastIndex = 0;
      const source = tag.match(/\bsrc="([^"]+)"/i)?.[1] || "";
      const sourceFile = source.startsWith("/assets/") ? path.join(root, source.slice(1)) : "";
      if (!sourceFile || !fs.existsSync(sourceFile)) {
        throw new Error(`Cannot remove old-host fallback without a local primary asset: ${path.relative(root, file)} ${source}`);
      }
      return tag.replace(/\s+srcset="[^"]*"/i, "").replace(/\s+sizes="[^"]*"/i, "");
    });
    fs.writeFileSync(file, html);
    changed += 1;
  }
  references.push(...[...html.matchAll(oldHost)].map((match) => ({ file: path.relative(root, file), url: match[0] })));
  oldHost.lastIndex = 0;
}

if (apply) {
  console.log(`OLD ASSET APPLY changedFiles=${changed}`);
  process.exitCode = references.length ? 1 : 0;
} else if (references.length) {
  console.error(`OLD ASSET FAIL references=${references.length} files=${new Set(references.map((item) => item.file)).size}`);
  references.slice(0, 20).forEach((item) => console.error(`- ${item.file}: ${item.url}`));
  process.exitCode = 1;
} else {
  console.log(`OLD ASSET PASS htmlFiles=${files.length} references=0`);
}
