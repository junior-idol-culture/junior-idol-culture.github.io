(() => {
  const root = document.documentElement;
  root.classList.add('js');

  const isJapanese = root.lang.toLowerCase().startsWith('ja');
  const labels = isJapanese
    ? { dark: 'ダーク', light: 'ライト', useDark: 'ダークテーマを使用', useLight: 'ライトテーマを使用' }
    : { dark: 'Dark', light: 'Light', useDark: 'Use dark theme', useLight: 'Use light theme' };

  const themeButton = document.querySelector('[data-theme-toggle]');
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('jic-theme');
  } catch (_) {
    // Storage can be unavailable in restrictive private-browsing contexts.
  }
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeButton) {
      const isDark = theme === 'dark';
      themeButton.textContent = isDark ? labels.light : labels.dark;
      themeButton.setAttribute('aria-label', isDark ? labels.useLight : labels.useDark);
    }
  };

  applyTheme(savedTheme || (systemDark ? 'dark' : 'light'));

  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('jic-theme', next);
    } catch (_) {
      // The theme still applies for the current page view.
    }
    applyTheme(next);
  });

  const progressBar = document.querySelector('.reading-progress span');
  const updateProgress = () => {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  const toc = document.querySelector('.toc');
  const tocToggle = document.querySelector('.toc-toggle');
  tocToggle?.addEventListener('click', () => {
    const open = toc?.dataset.open === 'true';
    if (toc) toc.dataset.open = String(!open);
    tocToggle.setAttribute('aria-expanded', String(!open));
    tocToggle.textContent = isJapanese
      ? (!open ? '目次を隠す' : '目次を表示')
      : (!open ? 'Hide contents' : 'Show contents');
  });

  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  const sections = tocLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      tocLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-18% 0px -70% 0px', threshold: [0, 1] });

    sections.forEach((section) => observer.observe(section));
  }
})();
