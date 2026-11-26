/* js/analytics.js — Vercel Web Analytics initialization
   Initializes Vercel Web Analytics using the inject method.
   Based on @vercel/analytics package documentation. */
(function () {
  'use strict';
  
  // Initialize the analytics queue (from @vercel/analytics)
  if (window.va) return;
  window.va = function a() {
    var params = Array.prototype.slice.call(arguments);
    if (!window.vaq) window.vaq = [];
    window.vaq.push(params);
  };
  
  // Inject the Vercel Analytics script
  // In production on Vercel, this will load from /_vercel/insights/script.js
  // In development, it loads from the debug endpoint
  var isDev = false; // Set to true for local development
  var src = isDev 
    ? 'https://va.vercel-scripts.com/v1/script.debug.js'
    : '/_vercel/insights/script.js';
  
  // Check if script is already loaded
  if (document.head.querySelector('script[src*="' + src + '"]')) return;
  
  // Create and configure the script element
  var script = document.createElement('script');
  script.src = src;
  script.defer = true;
  
  // Add SDK metadata
  script.dataset.sdkn = '@vercel/analytics';
  script.dataset.sdkv = '2.0.1';
  
  // Error handler
  script.onerror = function () {
    var errorMessage = isDev
      ? 'Please check if any ad blockers are enabled and try again.'
      : 'Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.';
    console.log('[Vercel Web Analytics] Failed to load script from ' + src + '. ' + errorMessage);
  };
  
  // Append script to document head
  document.head.appendChild(script);
})();
