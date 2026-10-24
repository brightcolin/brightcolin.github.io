document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
const language = document.querySelector('[data-language]');
if (language && window.location.hash) language.href += window.location.hash;
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.06 }) : null;
if (observer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.project-card, .about-strip').forEach(el => observer.observe(el));
}
