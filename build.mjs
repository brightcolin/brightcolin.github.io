import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { profile, projects } from './content.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const arrow = '<span aria-hidden="true">↗</span>';
const external = (url,label,cls='text-link') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ${arrow}</a>`;

function drawing(type, lang) {
  const zh = lang === 'zh';
  const small = (x,y,t,c='#65766f')=>`<text x="${x}" y="${y}" fill="${c}" font-family="Arial, sans-serif" font-size="12">${t}</text>`;
  const box = (x,y,w,h,fill,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
  let content='';
  if(type==='calendar') {
    content=box(35,25,430,222,'#fff')+small(55,52,zh?'将想法放进日程':'A LITTLE STRUCTURE FOR YOUR WEEK','#254e43');
    for(let i=0;i<5;i++) {content+=small(67+i*78,83,['MON','TUE','WED','THU','FRI'][i]);content+=`<path d="M${55+i*78} 96v124" stroke="#e4ebe6"/>`;}
    for(let i=0;i<4;i++) content+=`<path d="M55 ${100+i*37}h385" stroke="#e4ebe6"/>`;
    content+=box(60,107,68,52,'#d7e5d1')+small(69,128,zh?'阅读':'Read')+box(138,145,68,37,'#e3e5f3')+small(146,168,zh?'课程':'Class')+box(216,109,68,72,'#f3dfca')+small(223,132,zh?'开发':'Build')+box(294,186,68,30,'#d7e5d1')+small(302,206,zh?'复盘':'Review')+box(372,110,68,51,'#e3e5f3')+small(380,136,zh?'课程':'Class');
    content+=box(205,206,267,49,'#244d43',12)+`<circle cx="227" cy="230" r="4" fill="#d7ed8e"/>`+small(241,235,zh?'自然语言 → 可调整的计划':'Natural language → a workable plan','#fff');
  } else if(type==='finance') {
    content=small(36,42,zh?'数据有序流动，计算保持确定':'A PIPELINE WITH CLEAR RESPONSIBILITIES','#4e586a');
    const labels=['Parser','Classifier','Analyzer','Advisor'];
    for(let i=0;i<4;i++) {let x=32+i*118; content+=box(x,87,104,106,i===3?'#324838':'#fff',9)+small(x+12,113,`0${i+1}`,i===3?'#d7ed8e':'#9199a6')+small(x+12,143,labels[i],i===3?'#fff':'#293444')+small(x+12,171,['CSV','Rules + LLM','Statistics','LLM'][i],i===3?'#c7d4c8':'#79818f'); if(i<3)content+=`<path d="M${x+106} 140h10m-4-4 4 4-4 4" stroke="#8994a5" fill="none"/>`;}
    content+=`<path d="M40 217h329m-329-5v10m329-10v10" stroke="#a2aabb"/>`+small(109,242,zh?'清晰可检查的计算步骤':'Explicit, inspectable calculations')+small(402,236,zh?'建议':'Advice','#324838');
  } else if(type==='course') {
    content=box(42,39,182,53,'#fff')+small(58,61,zh?'选课偏好与时间约束':'Preferences & constraints','#6b563d')+small(58,80,zh?'课程 / 空闲时间':'Courses / available time','#8a7c6b')+box(42,123,182,92,'#43594c')+small(60,151,'Agent + scheduler','#fff')+small(60,177,'Search → check → plan','#d0dfd2')+`<path d="M133 94v27m-5-5 5 5 5-5M227 167h36m-5-5 5 5-5 5" stroke="#8a7c6b" fill="none"/>`;
    content+=box(276,40,181,177,'#fff')+small(294,66,zh?'候选课程表':'Candidate timetable','#6b563d');
    for(let i=0;i<4;i++)for(let j=0;j<3;j++) content+=box(293+i*37,83+j*39,29,30,(i+j)%3===0?'#ddc3a2':(i+j)%3===1?'#cbd9c9':'#f3f0e9',3);
  } else {
    content=box(35,53,125,144,'#fff')+small(52,82,'Unity client','#39566a')+`<path d="M57 119h75m-75 12h52m-52 12h62" stroke="#c4d4de" stroke-width="5"/>`+small(53,178,'HTTP API','#6c8290')+`<path d="M164 125h30m-5-5 5 5-5 5M334 125h30m-5-5 5 5-5 5" stroke="#78949e" fill="none"/>`+box(200,53,130,144,'#284c59')+small(215,82,'FastAPI','#fff')+small(215,114,zh?'游戏时间':'Game time','#c8dbe0')+small(215,139,zh?'角色状态':'Player state','#c8dbe0')+small(215,164,zh?'成长与结局':'Progression','#c8dbe0')+box(370,53,96,144,'#fff')+small(383,82,'SQLite','#39566a')+small(383,125,zh?'单人':'Single-player','#6c8290')+small(383,145,zh?'存档':'save','#6c8290');
    content+=small(135,238,zh?'让多个成长系统保持一致':'Keeping connected systems consistent','#6c8290');
  }
  return `<svg class="project-diagram" viewBox="0 0 500 280" role="img" aria-label="${esc(projects.find(p=>p.type===type)?.[lang].visual||'Architecture diagram')}">${content}</svg>`;
}
function orbit(lang) {
  return `<div class="research-card"><div class="eyebrow">${profile[lang].research}</div><h2>${profile[lang].researchTitle}</h2><svg class="orbit" viewBox="0 0 320 150" aria-hidden="true"><path d="M42 110Q80 0 164 64T279 37M42 110Q141 161 164 64T279 37M42 110L279 37" fill="none" stroke="#78958a" stroke-width="1"/><ellipse cx="164" cy="76" rx="77" ry="48" fill="none" stroke="#4c7464" stroke-dasharray="3 5"/><circle cx="42" cy="110" r="7" fill="#a1b8a8"/><circle cx="164" cy="64" r="14" fill="#d9ec9b"/><circle class="orbit-dot" cx="279" cy="37" r="8" fill="#dc9b76"/><text x="13" y="138" fill="#b9cdc2" font-size="11" font-family="monospace">MATH</text><text x="145" y="100" fill="#dbe6db" font-size="11" font-family="monospace">VISION</text><text x="270" y="67" fill="#b9cdc2" font-size="11" font-family="monospace">CODE</text></svg><p>${profile[lang].researchText}</p><div class="research-foot">${profile[lang].researchFoot}</div></div>`;
}
function shell(lang, page, body, title, desc) {
  const t=profile[lang], depth=page.split('/').length-1, pre='../'.repeat(depth), home=pre+'index.html';
  const other=(lang==='en'?'zh/':'../')+page;
  // Every locale lives in its own directory; page depth is relative to that locale.
  const languageHref=pre+other;
  return `<!doctype html>
<html lang="${lang==='en'?'en':'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta name="theme-color" content="#f8f7f2"><link rel="icon" href="${pre}${lang==='zh'?'../':''}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${pre}${lang==='zh'?'../':''}assets/style.css"><link rel="alternate" hreflang="${lang==='en'?'zh-CN':'en'}" href="${languageHref}"><script defer src="${pre}${lang==='zh'?'../':''}assets/site.js"></script></head>
<body><a class="skip-link" href="#main">${lang==='en'?'Skip to content':'跳到正文'}</a><div class="site-wrap"><header class="site-header"><a class="brand" href="${home}" aria-label="Colin — ${lang==='en'?'home':'首页'}"><span class="monogram">c<span>.</span></span><span>Colin<span class="brand-sub"> / brightcolin</span></span></a><nav aria-label="${lang==='en'?'Main navigation':'主导航'}"><a href="${home}#projects">${t.nav[0]}</a><a href="${home}#background">${t.nav[1]}</a><a href="${pre}about.html"${page==='about.html'?' aria-current="page"':''}>${t.nav[2]}</a><a class="language" lang="${lang==='en'?'zh-CN':'en'}" href="${languageHref}" data-language>${t.lang}<span aria-hidden="true"> ↔</span></a></nav></header><main id="main">${body}</main><footer class="site-footer"><a class="footer-name" href="${home}">Colin<span> / brightcolin</span></a><span>${t.footer}</span><div>${external(profile.github,'GitHub')}<a href="mailto:${profile.email}">Email ${arrow}</a></div></footer></div></body></html>`;
}
function card(p,lang,i) {
  const t=profile[lang],c=p[lang];
  return `<article class="project-card ${p.type}"><a class="visual-link" href="projects/${p.slug}.html" aria-label="${esc(c.title)}">${drawing(p.type,lang)}<span class="visual-caption">${lang==='en'?'SYSTEM SKETCH':'系统示意'} <span>0${i+1}</span></span></a><div class="project-info"><div class="eyebrow">${c.category}</div><h3><a href="projects/${p.slug}.html">${c.title} ${arrow}</a></h3><p>${c.description}</p><div class="tags">${p.tags.map(x=>`<span>${x}</span>`).join('')}</div><a class="text-link" href="projects/${p.slug}.html">${t.projectLink} <span aria-hidden="true">→</span></a></div></article>`;
}
function home(lang) {
  const t=profile[lang];
  return `<section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="status-dot"></span>${t.kicker}</div><h1>${t.headline}</h1><p class="intro">${t.intro}</p><p class="hero-description">${t.blurb}</p><div class="hero-actions"><a class="button" href="#projects">${t.work}<span aria-hidden="true">↓</span></a><a class="text-link" href="cv.html">${t.cv} ${arrow}</a>${external(profile.github,'GitHub')}</div></div>${orbit(lang)}</section>
<section class="section" id="projects"><div class="section-heading"><div><div class="eyebrow">${t.projectsLabel}</div><h2>${t.projectsTitle}</h2></div>${external(profile.github,t.allGithub)}</div><p class="section-intro">${t.projectsIntro}</p><div class="projects-grid">${projects.map((p,i)=>card(p,lang,i)).join('')}</div></section>
<section class="section" id="background"><div class="section-heading"><div><div class="eyebrow">${t.backgroundLabel}</div><h2>${t.backgroundTitle}</h2></div><a class="text-link" href="cv.html">${t.cv} ${arrow}</a></div><div class="background-grid"><div class="education"><span class="small-label">${lang==='en'?'EDUCATION':'教育背景'}</span><h3>${t.educationTitle}</h3><p>${t.educationDetail}</p><p class="degree">${t.degree}</p><div class="research-note"><span class="small-label">${t.interestTitle}</span><h4>${t.researchProject}</h4><p class="research-meta">${t.researchRole}<br>${t.researchAffiliation}<br>${t.researchPeriod}</p><ul>${t.researchBullets.map(b=>`<li>${b}</li>`).join('')}</ul></div></div><div class="awards"><span class="small-label">${lang==='en'?'SELECTED RECOGNITION':'精选荣誉'}</span>${t.awards.map(([y,n,d])=>`<div class="award"><span class="year">${y}</span><div><h3>${n}</h3><p>${d}</p></div></div>`).join('')}</div></div></section>
<section class="about-strip"><div><div class="eyebrow">${t.aboutLabel}</div><h2>${t.aboutTitle}</h2></div><div><p>${t.aboutText}</p><a class="text-link" href="about.html">${t.aboutLink} <span aria-hidden="true">→</span></a></div></section>${contact(lang)}`;
}
function contact(lang) { const t=profile[lang]; return `<section class="contact"><span class="contact-mark" aria-hidden="true">↗</span><div><h2>${t.closing}</h2><p>${t.closingText}</p></div><a class="button button-light" href="mailto:${profile.email}">${t.contact} ${arrow}</a></section>`; }
function projectPage(p,lang) {
  const c=p[lang],t=profile[lang],next=projects[(projects.indexOf(p)+1)%projects.length];
  return `<div class="page-top"><a class="text-link" href="../index.html#projects">← ${t.back}</a><span class="eyebrow">${c.category}</span></div><section class="project-hero"><div><h1>${c.title}</h1><p class="project-subtitle">${c.short}</p><div class="tags">${p.tags.map(x=>`<span>${x}</span>`).join('')}</div><div class="hero-actions">${external('https://github.com/brightcolin/'+p.repo,t.source,'button')}${c.action?external(c.actionUrl,c.action):''}</div></div><figure class="detail-visual ${p.type}">${drawing(p.type,lang)}<figcaption>${c.visual}</figcaption></figure></section><div class="case-layout"><aside><div class="small-label">${t.role}</div><p>${c.role}</p><div class="small-label">${t.status}</div><p>${c.status}</p></aside><div class="case-body"><section><div class="eyebrow">01 / ${t.context}</div><h2>${lang==='en'?'Where it started.':'从实际问题出发。'}</h2><p>${c.problem}</p></section><section><div class="eyebrow">02 / ${t.design}</div>${c.decisions.map(([h,b],i)=>`<div class="decision"><span class="decision-index">0${i+1}</span><div><h3>${h}</h3><p>${b}</p></div></div>`).join('')}</section></div></div><div class="next-project"><span class="eyebrow">${t.next}</span><a href="${next.slug}.html">${next[lang].title} <span aria-hidden="true">→</span></a></div>`;
}
function about(lang) {const t=profile[lang];return `<section class="about-hero"><div class="eyebrow">COLIN / BRIGHTCOLIN</div><h1>${t.aboutPageTitle}</h1><p>${t.aboutIntro}</p><div class="hero-actions"><a class="button" href="cv.html">${t.cv} ${arrow}</a>${external(profile.github,'GitHub')}</div></section><div class="about-body"><aside class="about-facts"><div class="monogram large">c<span>.</span></div><h2>Colin</h2><p>${lang==='en'?'Tsinghua University<br>Weiyang College':'清华大学<br>未央书院'}</p><a class="text-link" href="mailto:${profile.email}">Email ${arrow}</a></aside><div>${t.aboutSections.map(([h,b],i)=>`<section><span class="small-label">0${i+1}</span><h2>${h}</h2><p>${b}</p></section>`).join('')}</div></div>${contact(lang)}`;}
function cv(lang) {const t=profile[lang];return `<div class="cv-toolbar"><a class="text-link" href="index.html">← ${lang==='en'?'Home':'首页'}</a><button class="button" data-print>${t.print} ${arrow}</button></div><article class="cv"><div class="cv-head"><div><div class="eyebrow">${t.cvTitle}</div><h1>Colin <span>/ brightcolin</span></h1><p>${t.cvNote}</p></div><div><a href="mailto:${profile.email}">${profile.email}</a><br><a href="${profile.github}">github.com/brightcolin</a></div></div><section><h2>${t.cvEducation}</h2><h3>${t.educationTitle}</h3><p>${t.educationDetail}</p><p>${t.degree.replace('<br>',' ')}</p></section><section><h2>${t.cvResearch}</h2><h3>${t.researchProject}</h3><p>${t.researchRole} · ${t.researchAffiliation}<br>${t.researchPeriod}</p><ul>${t.researchBullets.map(b=>`<li>${b}</li>`).join('')}</ul></section><section><h2>${t.cvProjects}</h2>${projects.map(p=>`<div class="cv-entry"><h3><a href="projects/${p.slug}.html">${p[lang].title}</a><span>2026</span></h3><p>${p[lang].description}</p><p>${p[lang].role}</p></div>`).join('')}</section><section><h2>${t.cvAwards}</h2>${t.awards.map(([y,n,d])=>`<p><strong>${y ? y+' · ' : ''}${n}</strong><br>${d}</p>`).join('')}</section><section><h2>${t.cvService}</h2><ul>${t.service.map(s=>`<li>${s}</li>`).join('')}</ul></section><section><h2>${t.cvSkills}</h2><p>${t.skills}</p></section></article>`;}
await mkdir(path.join(out,'assets'), {recursive:true});
for(const file of ['style.css','site.js','favicon.svg']) await copyFile(path.join(root,'assets',file),path.join(out,'assets',file));
for(const lang of ['en','zh']) {
  const dir=lang==='en'?out:path.join(out,'zh');
  await mkdir(path.join(dir,'projects'),{recursive:true});
  const pages=[['index.html',home(lang),(lang==='en'?'Colin — Computer Vision & Software':'Colin — 计算机视觉与软件'),profile[lang].blurb],['about.html',about(lang),`Colin — ${lang==='en'?'About':'关于我'}`,profile[lang].aboutIntro],['cv.html',cv(lang),`Colin — ${profile[lang].cvTitle}`,profile[lang].cvNote],...projects.map(p=>[`projects/${p.slug}.html`,projectPage(p,lang),`${p[lang].title} — Colin`,p[lang].description])];
  for(const [page,body,title,desc] of pages) await writeFile(path.join(dir,page),shell(lang,page,body,title,desc));
}
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Colin</title><body style="font:18px/1.6 system-ui;margin:12vh auto;max-width:600px;padding:24px;background:#f8f7f2;color:#254e43"><p>404 / PAGE NOT FOUND</p><h1>Let’s get you back.</h1><p>This page may have moved.</p><a href="/">Go to the homepage →</a></body></html>');
console.log('Built 14 bilingual content pages + 404 into dist/.');
