export const bookingApiOrigin = process.env.BOOKING_API_ORIGIN || '';
export function meetPage(lang, email) {
  const zh = lang === 'zh';
  const t = (en, cn) => zh ? cn : en;
  return `<section class="meal-intro"><div class="eyebrow">COLIN / AT THE TABLE</div><h1>${t('Let’s share a meal.','找个时间，一起吃饭。')}</h1><p>${t('Drag across an available time below. I’ll save our meal in my calendar.','在下方的空闲时间里拖动选一段，一起吃顿饭。')}</p></section>
  <section class="meal-layout" data-meal-app data-api="${bookingApiOrigin}"><div class="meal-main">
    <p class="meal-status" role="status" aria-live="polite" data-status>${t('Checking availability…','正在查看空闲时间……')}</p>
    <div data-picker hidden>
      <div class="meal-toolbar"><h2 data-week-label></h2><div class="meal-week-nav"><button type="button" data-prev aria-label="${t('Previous week','上一周')}">←</button><button type="button" data-next aria-label="${t('Next week','下一周')}">→</button></div></div>
      <p class="meal-caption" data-zone></p>
      <div class="meal-legend"><span class="meal-key"></span>${t('Available','可约')}<span class="meal-drag-hint">${t('Drag for 60 or 90 minutes · or click, then use ↑ / ↓ to adjust','拖动选择 60 或 90 分钟 · 也可点击后用 ↑ / ↓ 调整')}</span></div>
      <div class="meal-calendar-scroll" tabindex="0" aria-label="${t('Weekly meal calendar; scroll sideways for more days','每周约饭日历，可左右滚动查看日期')}"><div class="meal-calendar" data-calendar aria-label="${t('Drag an available time to book','在空闲区域拖动选择约饭时间')}"></div></div>
      <form data-booking hidden><h2 class="meal-form-heading">${t('See you there.','就约这个时间。')}</h2><p class="meal-selection" data-selection></p>
        <div class="meal-fields"><label>${t('Your name','怎么称呼你')}<input name="name" maxlength="50" autocomplete="name" required></label><label>${t('How can I reach you?','怎么联系你')}<input name="contact" maxlength="150" autocomplete="email" required></label><label class="wide">${t('Where shall we eat?','想在哪里吃')}<input name="location" maxlength="150" placeholder="${t('A place, or decide together','餐厅名称，或写“到时一起商量”')}" required></label><label class="wide">${t('Anything to add? (optional)','补充一句（选填）')}<textarea name="note" rows="2" maxlength="500"></textarea></label></div>
        <div class="meal-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <label class="meal-consent"><input type="checkbox" required>${t('Share these details with Colin to arrange this meal, saved in the booking service and his private calendar.','同意将这些信息提供给 Colin 安排约饭，并保存在预约服务与他的私人日历中。')}</label>
        <button class="button" type="submit" data-submit>${t('Confirm this time','确认约饭')} <span aria-hidden="true">→</span></button>
      </form>
    </div>
    <div data-result hidden><h2 data-result-title></h2><p class="meal-selection" data-result-time></p><p data-result-place></p><p class="meal-caption">${t('Keep this private link to view, change or cancel your booking. Anyone with the link can manage it.','保存这个私密链接，就能查看、改期或取消；持有链接的人可以管理本次预约。')}</p><label>${t('Your private booking link','你的私密预约链接')}<input data-manage-link readonly></label><div class="hero-actions"><button class="button" data-copy>${t('Copy link','复制链接')}</button><button class="text-link" data-reschedule>${t('Change time','更改时间')}</button><button class="text-link" data-cancel>${t('Cancel booking','取消预约')}</button><button class="text-link" data-refresh>${t('Refresh status','刷新状态')}</button></div></div>
    <p class="meal-footnote">${t('Only bookable meal times are shown. Other plans stay private, with a 30-minute buffer. No Google account needed.','只展示可约的饭点，与其他日程留出 30 分钟；其他日程保持私密，无需 Google 账号。')} <a href="mailto:${email}">${t('Or email me','也可以发邮件联系')}</a></p>
    <noscript><p>${t('Please enable JavaScript to check availability, or contact me by email.','请启用 JavaScript 查看可约时间，或直接发邮件联系。')}</p></noscript>
  </div></section><link rel="stylesheet" href="${zh ? '../../' : '../'}assets/meet.css"><script defer src="${zh ? '../../' : '../'}assets/meet.js"></script>`;
}
