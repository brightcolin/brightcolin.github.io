import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);files.push(...(e.isDirectory()?await walk(p):[p]));}return files;}
const files=await walk(root),html=files.filter(p=>p.endsWith('.html'));let checked=0;const errors=[];
for(const file of html){
  const text=await readFile(file,'utf8');
  if(!/<html lang="(en|zh-CN)"/.test(text))errors.push(`Missing language: ${file}`);
  if((text.match(/<h1[ >]/g)||[]).length!==1)errors.push(`Expected one h1: ${file}`);
  if(/undefined|TODO|Lorem ipsum/.test(text))errors.push(`Placeholder: ${file}`);
  for(const [,value] of text.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:)/.test(value))continue;
    const [part,hash]=value.split('#');
    let target=part.startsWith('/')?path.join(root,part):path.resolve(path.dirname(file),part||path.basename(file));
    if(!target.startsWith(root)) {errors.push(`Escaping path ${value} in ${file}`);continue;}
    try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');const body=await readFile(target,'utf8');if(hash&&!body.includes(`id="${hash}"`))errors.push(`Broken anchor ${value} in ${file}`);checked++;}catch{errors.push(`Broken local link ${value} in ${file}`);}
  }
  const alt=text.match(/<a[^>]+href="([^"]+)"[^>]*data-language/);
  if(alt){const other=path.resolve(path.dirname(file),alt[1]);const source=await readFile(other,'utf8');const back=source.match(/<a[^>]+href="([^"]+)"[^>]*data-language/);if(!back||path.resolve(path.dirname(other),back[1])!==file)errors.push(`Nonreciprocal language link: ${file}`);}
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${html.length} HTML pages; ${checked} local links/assets; reciprocal language routes, anchors, document language, headings, and placeholders checked.`);
