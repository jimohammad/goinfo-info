(function () {
  var root = document.documentElement;
  var saved = localStorage.getItem('goinfo-theme');
  var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var theme = saved || preferred;
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', theme === 'dark');

  function syncIcon(btn) {
    if (!btn) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.innerHTML = dark
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/></svg>';
  }

  function applyTheme(next) {
    root.setAttribute('data-theme', next);
    root.classList.toggle('dark', next === 'dark');
    localStorage.setItem('goinfo-theme', next);
    document.querySelectorAll('#giThemeBtn, #themeBtn').forEach(syncIcon);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#08111f' : '#F7F9FC');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#giThemeBtn, #themeBtn').forEach(function (btn) {
      syncIcon(btn);
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });
  });

  // expose for pages that call theme early
  window.GoInfoShell = { applyTheme: applyTheme, syncIcon: syncIcon };
})();
