(() => {
  'use strict';
  const app = document.querySelector('[data-meal-app]');
  if (!app) return;
  const zh = document.documentElement.lang === 'zh-CN';
  const t = (en, cn) => zh ? cn : en;
  const $ = (name) => app.querySelector(`[data-${name}]`);
  const status = (message, error = false) => { $('status').textContent = message; $('status').dataset.error = String(error); };
  let allSlots = [], selected = null, currentToken = '', changing = false, pending = null, generation = 0;
  let settings = null, weekStart = '', firstWeek = '', lastDay = '', locked = false, drag = null, pointerEnded = -1000;
  let slotIndex = new Map();
  const mins = (time) => Number(time.slice(0,2)) * 60 + Number(time.slice(3));
  const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;
  const plusDays = (day,n) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0,10); };
  const monday = (day) => plusDays(day,-((new Date(day + 'T12:00:00Z').getUTCDay() + 6) % 7));
  const key = (s) => `${s.date}/${s.meal}/${s.start}/${s.duration}`;
  const api = app.dataset.api;
  const tokenFromHash = new URLSearchParams(location.hash.slice(1)).get('booking');
  if (/^[a-f0-9]{64}$/.test(tokenFromHash || '')) currentToken = tokenFromHash;
  const errors = {
    RATE_LIMITED: t('Too many requests. Please wait before trying again.', '请求较多，请稍后再试。'),
    SLOT_TAKEN: t('This time is no longer available. Please choose another time.', '这个时间刚刚已不可约，请重新选择。'),
    NOT_OPEN: t('Bookings are not open yet. You can reach me by email.', '预约尚未开放，欢迎先发邮件联系。'),
    NOT_FOUND: t('This booking could not be found. Please contact Colin.', '未找到这次预约，请联系 Colin。'),
    REQUEST_CHANGED: t('A request is still being resolved. Retry with the original details or refresh its status.', '上一项请求仍在处理中，请按原信息重试或刷新预约状态。'),
    INVALID_INPUT: t('Please check the details and try again.', '请检查填写的信息后重试。'),
    NOT_CONFIRMED: t('This booking cannot be changed in its current state.', '当前预约状态暂时不能改期。'),
  };
  async function request(path, data) {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(api + '/public/meals/' + path, { method: data ? 'POST' : 'GET', headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw Object.assign(new Error(errors[result.error] || t('The service is unavailable. Please retry shortly.', '服务暂时不可用，请稍后重试。')), { code: result.error });
      return result;
    } catch (e) {
      if (!e.code) throw new Error(t('Connection interrupted. A submitted booking may still have been saved. Retry or refresh its status before making another booking.', '连接中断。已提交的预约可能仍然写入成功，请重试或刷新状态后再进行其他预约。'));
      throw e;
    } finally { clearTimeout(timeout); }
  }
  function displaySlot(s) {
    const date = new Intl.DateTimeFormat(zh ? 'zh-CN' : 'en', { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' }).format(new Date(s.date + 'T12:00:00Z'));
    const endMins = Number(s.start.slice(0,2)) * 60 + Number(s.start.slice(3)) + s.duration;
    const end = `${String(Math.floor(endMins/60)).padStart(2,'0')}:${String(endMins%60).padStart(2,'0')}`;
    return `${date} · ${s.start}–${end} · ${s.meal === 'lunch' ? t('Lunch','午饭') : t('Dinner','晚饭')}`;
  }
  function lockForm(locked) {
    setLocked(locked);
    // An uncertain submission can only retry the same captured request.
    $('submit').disabled = false;
  }
  function setLocked(value) {
    locked = value;
    for (const field of $('picker').querySelectorAll('input,textarea,button')) {
      field.disabled = locked || (field.hasAttribute('data-timecell') && field.dataset.start !== 'true') || (changing && field.matches('input,textarea'));
    }
    navigation();
  }
  function navigation() {
    $('prev').disabled = locked || weekStart <= firstWeek;
    $('next').disabled = locked || plusDays(weekStart,7) > lastDay;
  }
  function clearSelection() {
    selected = null; drag = null; $('booking').hidden = true;
    $('calendar').querySelectorAll('.meal-draft').forEach(el => el.remove());
    $('calendar').querySelectorAll('[aria-pressed=true]').forEach(el => el.setAttribute('aria-pressed','false'));
  }
  function paint(s, invalid = false) {
    $('calendar').querySelectorAll('.meal-draft').forEach(el => el.remove());
    $('calendar').querySelectorAll('[data-day]').forEach(col => {
      if (col.dataset.day !== s.date || col.dataset.meal !== s.meal) return;
      const offset = (mins(s.start) - Number(col.dataset.begin)) / 15;
      const count = Number(col.dataset.count), visibleStart = Math.max(0,offset), visibleEnd = Math.min(count,offset+s.duration/15);
      if (visibleEnd <= visibleStart) return;
      const block = document.createElement('div'); block.className = 'meal-draft'; block.dataset.invalid = String(invalid);
      block.style.top = `${visibleStart/count*100}%`; block.style.height = `${(visibleEnd-visibleStart)/count*100}%`;
      const label = document.createElement('strong'); label.textContent = `${s.start}–${hhmm(mins(s.start)+s.duration)}`;
      const note = document.createElement('span'); note.textContent = invalid ? t('Unavailable','不可约') : t('Meal together','一起吃饭');
      block.append(label,note); col.append(block);
    });
  }
  function choose(s) {
    if (locked || !s) return;
    selected = s; paint(s);
    for (const cell of $('calendar').querySelectorAll('[data-timecell]')) cell.setAttribute('aria-pressed',String(cell.dataset.date === s.date && cell.dataset.meal === s.meal && Number(cell.dataset.minute) === mins(s.start)));
    $('selection').textContent = displaySlot(s); $('booking').hidden = false;
    $('booking').querySelector('.meal-fields').hidden = changing;
    $('booking').querySelector('.meal-consent').hidden = changing;
    for (const field of $('booking').querySelectorAll('input,textarea')) field.disabled = changing;
    $('submit').textContent = changing ? t('Confirm new time','确认新时间') : t('Confirm this time','确认约饭');
    status(t('Time selected. Add your details below.','时间选好了，在下方留下见面信息。'));
  }
  function slotAt(date,meal,start,duration) { return slotIndex.get(key({date,meal,start:hhmm(start),duration})); }
  function wireColumn(col) {
    col.addEventListener('pointerdown',e => {
      if (locked || (e.button !== undefined && e.button !== 0)) return;
      const cell = e.target.closest('[data-timecell]');
      if (!cell || cell.disabled) return;
      e.preventDefault();
      clearSelection();
      const anchor = Number(cell.dataset.minute);
      drag = { col, pointerId:e.pointerId, anchor, duration:60, slot:slotAt(col.dataset.day,col.dataset.meal,anchor,60) || slotAt(col.dataset.day,col.dataset.meal,anchor,90) };
      if (col.setPointerCapture) col.setPointerCapture(e.pointerId);
      if (drag.slot) paint(drag.slot);
    });
    col.addEventListener('pointermove',e => {
      if (!drag || drag.col !== col || drag.pointerId !== e.pointerId) return;
      e.preventDefault();
      const rect = col.getBoundingClientRect();
      if (!rect.height) return;
      const row = Math.floor((e.clientY - rect.top) / rect.height * Number(col.dataset.count));
      const at = Number(col.dataset.begin) + row*15;
      const length = at < drag.anchor ? drag.anchor+15-at : at+15-drag.anchor;
      const duration = length >= 75 ? 90 : 60;
      const start = at < drag.anchor ? drag.anchor+15-duration : drag.anchor;
      const candidate = {date:col.dataset.day,meal:col.dataset.meal,start:hhmm(Math.max(0,start)),duration};
      const inColumn = e.clientX >= rect.left && e.clientX <= rect.right && at >= Number(col.dataset.begin) && at < Number(col.dataset.end);
      drag.slot = inColumn ? slotIndex.get(key(candidate)) : null;
      paint(candidate,!drag.slot);
    });
    col.addEventListener('pointerup',e => {
      if (!drag || drag.col !== col || drag.pointerId !== e.pointerId) return;
      const s = drag.slot; drag = null; pointerEnded = performance.now();
      if (col.hasPointerCapture?.(e.pointerId)) col.releasePointerCapture(e.pointerId);
      if (s) choose(s); else { clearSelection(); status(t('That range is unavailable. Drag within a green area.','这段时间不可约，请在绿色区域里重新拖动。'),true); }
    });
    col.addEventListener('pointercancel',() => { if(drag?.col === col) clearSelection(); });
    col.addEventListener('lostpointercapture',() => { if(drag?.col === col) clearSelection(); });
    col.addEventListener('click',e => {
      if (locked || (e.detail > 0 && performance.now()-pointerEnded < 350)) return;
      const cell = e.target.closest('[data-timecell]'); if(!cell || cell.disabled) return;
      const m = Number(cell.dataset.minute);
      choose(slotAt(col.dataset.day,col.dataset.meal,m,60) || slotAt(col.dataset.day,col.dataset.meal,m,90));
    });
    col.addEventListener('keydown',e => {
      if (locked) return;
      if(e.key === 'Escape') { clearSelection(); return; }
      if (!selected || selected.date !== col.dataset.day || selected.meal !== col.dataset.meal || !['ArrowDown','ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const s = slotAt(selected.date,selected.meal,mins(selected.start),e.key === 'ArrowDown' ? 90 : 60);
      if(s) choose(s); else status(t('That duration is not available here.','这里没有足够的空闲时间。'),true);
    });
  }
  function renderWeek() {
    const calendar = $('calendar'); calendar.replaceChildren();
    const fmt = options => new Intl.DateTimeFormat(zh?'zh-CN':'en',{...options,timeZone:'UTC'});
    const dates = Array.from({length:7},(_,i)=>plusDays(weekStart,i));
    $('week-label').textContent = `${fmt({month:'short',day:'numeric'}).format(new Date(weekStart+'T12:00:00Z'))} — ${fmt({month:'short',day:'numeric'}).format(new Date(dates[6]+'T12:00:00Z'))}`;
    const head = document.createElement('div'); head.className = 'meal-week-head'; head.append(document.createElement('div'));
    for(const date of dates) {
      const el = document.createElement('div'); el.className = 'meal-day-heading';
      el.textContent = fmt({weekday:'short'}).format(new Date(date+'T12:00:00Z'));
      const day = document.createElement('strong'); day.textContent = String(Number(date.slice(-2))); el.append(day); head.append(el);
    }
    calendar.append(head);
    for(const meal of ['lunch','dinner']) {
      const window = settings[meal], begin = mins(window.start), end = mins(window.end), count = (end-begin)/15;
      if(meal === 'dinner') { const gap = document.createElement('div'); gap.className = 'meal-band-separator'; gap.textContent = t('Afternoon hours hidden','非饭点时段已收起'); calendar.append(gap); }
      const label = document.createElement('div'); label.className = 'meal-period-label'; label.textContent = meal === 'lunch' ? t('Lunch','午饭') : t('Dinner','晚饭');
      const range = document.createElement('small'); range.textContent = `${window.start}–${window.end}`; label.append(range); calendar.append(label);
      const band = document.createElement('div'); band.className = 'meal-band';
      const axis = document.createElement('div'); axis.className = 'meal-time-axis';
      for(let m=begin;m<end;m+=30) { const mark = document.createElement('span'); mark.textContent = hhmm(m); mark.style.top = `${(m-begin)/(end-begin)*100}%`; if(m === begin) mark.style.transform = 'none'; axis.append(mark); } band.append(axis);
      for(const date of dates) {
        const col = document.createElement('div'); col.className = 'meal-day-column'; Object.assign(col.dataset,{day:date,meal,begin:String(begin),end:String(end),count:String(count)});
        const available = allSlots.filter(s=>s.date === date && s.meal === meal);
        for(let m=begin;m<end;m+=15) {
          const cell = document.createElement('button'); cell.type='button'; cell.className='meal-cell';
          const canStart = !!(slotAt(date,meal,m,60) || slotAt(date,meal,m,90));
          Object.assign(cell.dataset,{timecell:'',date,meal,minute:String(m),free:String(available.some(s=>mins(s.start)<=m && mins(s.start)+s.duration>=m+15)),start:String(canStart)});
          cell.disabled = locked || !canStart; cell.setAttribute('aria-pressed','false');
          cell.setAttribute('aria-label',`${date} ${hhmm(m)} ${meal === 'lunch'?t('Lunch','午饭'):t('Dinner','晚饭')} · ${canStart?t('Select time','选择时间'):t('Unavailable start','不可作为开始时间')}`);
          col.append(cell);
        }
        wireColumn(col); band.append(col);
      }
      calendar.append(band);
    }
    navigation(); if(selected) paint(selected);
  }
  async function loadSlots() {
    const ownGeneration = ++generation;
    clearSelection(); $('picker').hidden = true;
    status(t('Checking available meal times…','正在查询可约饭的时间……'));
    try {
      const filters = ['lunch','dinner'].flatMap(meal=>[60,90].map(duration=>({meal,duration})));
      const results = await Promise.all(filters.map(filter=>changing ? request('options',{...filter,token:currentToken}) : request(`availability?${new URLSearchParams(filter)}`)));
      if (ownGeneration !== generation) return;
      settings = results[0]; allSlots = results.flatMap(r=>r.slots); slotIndex = new Map(allSlots.map(s=>[key(s),s]));
      $('zone').textContent = t(`${settings.timezone} · Book at least ${settings.noticeHours} hours ahead.`,`${settings.timezone} · 至少提前 ${settings.noticeHours} 小时预约。`);
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:settings.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now())).map(p=>[p.type,p.value]));
      const today = `${parts.year}-${parts.month}-${parts.day}`;
      firstWeek = monday(today); lastDay = plusDays(today,settings.horizonDays-1);
      const first = allSlots.map(s=>s.date).sort()[0]; weekStart = first ? monday(first) : firstWeek;
      locked = false; renderWeek(); $('picker').hidden = false;
      status(allSlots.length ? t('Drag a green area to choose your time.','在绿色区域里拖动，选一个见面的时间。') : t('No meal times are currently available. You can reach me by email.','这段时间没有可预约的饭点，欢迎发邮件联系。'));
    } catch (e) { if (ownGeneration === generation) status(e.message,true); }
  }
  function link() { const url = new URL(location.href); url.search = ''; url.hash = 'booking=' + currentToken; return url.href; }
  function rememberLink() {
    history.replaceState(null,'',link());
    const language = document.querySelector('[data-language]');
    if (language) { const u = new URL(language.href); u.hash = 'booking=' + currentToken; language.href = u.href; }
  }
  function showResult(result) {
    lockForm(false);
    ++generation; $('picker').hidden = true; $('result').hidden = false; pending = null; changing = false;
    const confirmed = result.status === 'confirmed', cancelled = result.status === 'cancelled';
    $('result-title').textContent = confirmed ? t('See you soon.','到时见。') : cancelled ? t('Booking cancelled.','预约已取消。') : t('Checking your booking.','正在确认预约状态。');
    $('result-time').textContent = displaySlot(result.slot) + ' · ' + result.timezone;
    $('result-place').textContent = result.location;
    $('manage-link').value = link(); rememberLink();
    $('reschedule').hidden = !confirmed; $('cancel').hidden = cancelled;
    status(confirmed ? t('Confirmed and saved in Colin’s calendar.','预约成功，已写入 Colin 的日历。') : cancelled ? t('The time has been released.','原来的时间已释放。') : t('The calendar update is not yet confirmed. Refresh status or cancel; do not book again.', '日历更新尚未确认。请刷新状态或取消，暂时不要重新预约。'));
  }
  async function refresh() { try { showResult(await request('lookup',{ token: currentToken })); } catch (e) { status(e.message,true); } }
  for(const [name,offset] of [['prev',-7],['next',7]]) $(name).addEventListener('click',()=>{ if(locked) return; clearSelection(); weekStart=plusDays(weekStart,offset); renderWeek(); });
  $('booking').addEventListener('submit', async (e) => {
    e.preventDefault(); if (!selected) return;
    $('submit').disabled = true;
    const slot = { date: selected.date, start: selected.start, duration: selected.duration, meal: selected.meal };
    const operation = changing ? 'reschedule' : 'book';
    if (!currentToken) currentToken = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2,'0')).join('');
    if (!pending) pending = changing ? { ...slot, token: currentToken } : { ...slot, ...Object.fromEntries(new FormData($('booking'))), token: currentToken };
    lockForm(true); $('submit').disabled = true;
    status(t('Saving to the calendar…','正在写入日历……'));
    try { showResult(await request(operation, pending)); }
    catch (error) {
      const noWrite = ['SLOT_TAKEN','INVALID_INPUT','NOT_OPEN','RATE_LIMITED'].includes(error.code);
      if (noWrite) { pending = null; lockForm(false); if (!changing) currentToken = ''; }
      if (error.code === 'SLOT_TAKEN') await loadSlots();
      status(error.message,true);
      if (!noWrite && currentToken) { rememberLink(); $('submit').textContent = t('Retry the same request','重试本次请求'); $('result').hidden = false; $('result-title').textContent = t('Not confirmed yet','尚未确认'); $('manage-link').value = link(); $('reschedule').hidden = true; }
    } finally { $('submit').disabled = false; }
  });
  $('refresh').addEventListener('click',refresh);
  $('copy').addEventListener('click',async () => { try { await navigator.clipboard.writeText(link()); status(t('Private link copied.','已复制私密链接。')); } catch { $('manage-link').select(); status(t('Select and copy the private link above.','请选中并复制上方的私密链接。')); } });
  $('cancel').addEventListener('click',async () => {
    if (!confirm(t('Cancel this meal booking?','确认取消这次约饭吗？'))) return;
    $('cancel').disabled = true;
    try { showResult(await request('cancel',{ token: currentToken })); } catch (e) { status(e.message,true); } finally { $('cancel').disabled = false; }
  });
  $('reschedule').addEventListener('click',() => { changing = true; $('result').hidden = true; loadSlots(); });
  if (!api) { status(errors.NOT_OPEN); return; }
  try {
    const url = new URL(api);
    if (url.origin !== api || (url.protocol !== 'https:' && !['127.0.0.1','localhost'].includes(url.hostname))) throw new Error();
  } catch { status(errors.NOT_OPEN); return; }
  if (currentToken) refresh(); else loadSlots();
})();
