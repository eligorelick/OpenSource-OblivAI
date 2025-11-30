// Small script to set the initial theme class before React mounts
// Privacy-first: Only uses localStorage (stays on device), no server calls
(function(){
  try {
    var THEME_KEY = 'oblivai-theme';
    var isDark;

    // Check localStorage first for user's saved preference
    var savedTheme = null;
    try {
      savedTheme = localStorage.getItem(THEME_KEY);
    } catch (e) {
      // localStorage not available (private browsing, etc.)
    }

    if (savedTheme === 'light') {
      isDark = false;
    } else {
      // Default to dark mode (including when no preference is saved)
      isDark = true;
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Default to dark on any error
    document.documentElement.classList.add('dark');
  }
})();
