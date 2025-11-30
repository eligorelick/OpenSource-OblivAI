// Browser compatibility check - shows friendly message for unsupported browsers
(function() {
  var hasWasm = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
  var hasModules = 'noModule' in HTMLScriptElement.prototype;
  var hasPromise = typeof Promise !== 'undefined';

  if (!hasWasm || !hasModules || !hasPromise) {
    document.getElementById('root').innerHTML =
      '<div style="font-family: system-ui, sans-serif; background: #0F0F23; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center;">' +
      '<div style="max-width: 500px;">' +
      '<h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Browser Update Required</h1>' +
      '<p style="color: #9ca3af; margin-bottom: 1.5rem;">OBLIVAI requires a modern browser with WebAssembly support to run AI models locally in your browser.</p>' +
      '<p style="color: #9ca3af; margin-bottom: 1rem;">Please update your browser or try one of these:</p>' +
      '<ul style="list-style: none; padding: 0; color: #06B6D4;">' +
      '<li style="margin: 0.5rem 0;"><a href="https://www.google.com/chrome/" style="color: #06B6D4;">Chrome 89+</a></li>' +
      '<li style="margin: 0.5rem 0;"><a href="https://www.mozilla.org/firefox/" style="color: #06B6D4;">Firefox 89+</a></li>' +
      '<li style="margin: 0.5rem 0;"><a href="https://www.apple.com/safari/" style="color: #06B6D4;">Safari 15+</a></li>' +
      '<li style="margin: 0.5rem 0;"><a href="https://www.microsoft.com/edge" style="color: #06B6D4;">Edge 89+</a></li>' +
      '</ul>' +
      '<p style="color: #6b7280; font-size: 0.875rem; margin-top: 1.5rem;">Your privacy is still protected - no data was sent to any server.</p>' +
      '</div></div>';
  }
})();
