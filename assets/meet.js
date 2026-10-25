(() => {
  'use strict';
  const app = document.querySelector('[data-meal-app]');
  if (!app) return;
  const zh = document.documentElement.lang === 'zh-CN';
  const t = (en, cn) => zh ? cn : en;
  const $ = (name) => app.querySelector(`[data-${name}]`);
  const status = (message, error = false) => { $('status').textContent = message; $('status').dataset.error = String(error); };
  let allSlots = [], selected = null, currentToken = '', changing = false, pending = null, generation = 0;
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
  function button(label, action, parent) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.setAttribute('aria-pressed','false'); b.addEventListener('click', action); parent.append(b); return b;
  }
  function lockForm(locked) {
    for (const field of $('picker').querySelectorAll('select,input,textarea,button')) field.disabled = locked;
    // An uncertain submission can only retry the same captured request.
    $('submit').disabled = false;
  }
  function showTimes(day) {
    selected = null; $('booking').hidden = true; $('slots').replaceChildren();
    for (const b of $('dates').children) b.setAttribute('aria-pressed', String(b.dataset.date === day));
    for (const s of allSlots.filter((s) => s.date === day)) {
      const b = button(`${s.start}–${s.end}`, () => {
        selected = s;
        for (const other of $('slots').children) other.setAttribute('aria-pressed',String(other === b));
        $('selection').textContent = displaySlot(s); $('booking').hidden = false;
        $('booking').querySelector('.meal-fields').hidden = changing;
        $('booking').querySelector('.meal-consent').hidden = changing;
        for (const field of $('booking').querySelectorAll('input,textarea')) field.disabled = changing;
        $('submit').textContent = changing ? t('Confirm new time','确认新时间') : t('Confirm this time','确认预约');
      }, $('slots'));
    }
  }
  async function loadSlots() {
    const ownGeneration = ++generation;
    $('booking').hidden = true; $('dates').replaceChildren(); $('slots').replaceChildren(); selected = null;
    status(t('Checking available meal times…','正在查询可约饭的时间……'));
    try {
      const filter = { meal: $('meal').value, duration: Number($('duration').value) };
      const result = changing ? await request('options', { ...filter, token: currentToken }) : await request(`availability?${new URLSearchParams(filter)}`);
      if (ownGeneration !== generation) return;
      allSlots = result.slots; $('picker').hidden = false;
      $('zone').textContent = t(`All times: ${result.timezone}. Book at least ${result.noticeHours} hours ahead.`, `时间均为 ${result.timezone}，至少提前 ${result.noticeHours} 小时预约。`);
      for (const day of [...new Set(allSlots.map((s) => s.date))]) {
        const d = new Date(day + 'T12:00:00Z');
        const b = button(new Intl.DateTimeFormat(zh ? 'zh-CN' : 'en', { weekday: 'short', timeZone: 'UTC' }).format(d), () => showTimes(day), $('dates'));
        b.dataset.date = day; const n = document.createElement('strong'); n.textContent = `${d.getUTCMonth()+1}/${d.getUTCDate()}`; b.append(n);
      }
      if (allSlots.length) { status(t('Choose a date, then a time.','选择日期，再选一个时间。')); showTimes(allSlots[0].date); }
      else status(t('No meal times are available in this window. Try another meal or contact me by email.', '这段时间没有可预约的饭点，可以换个饭点或发邮件联系。'));
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
  $('meal').addEventListener('change',loadSlots); $('duration').addEventListener('change',loadSlots);
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
