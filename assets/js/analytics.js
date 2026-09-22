// Preserve the existing Cloudflare property; never count redirects, admin or archives.
(() => {
  const token=document.querySelector('meta[name="cf-web-analytics-token"]')?.content.trim();
  if (!token || window.self!==window.top || !['aganzo.com','www.aganzo.com','carlosaganzo.com','www.carlosaganzo.com'].includes(location.hostname)) return;
  if (window.__aganzoAnalyticsLoaded || document.querySelector('script[data-cf-beacon]')) return;
  window.__aganzoAnalyticsLoaded=true;
  const beacon=document.createElement('script');beacon.defer=true;
  beacon.src='https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon=JSON.stringify({token});document.body.append(beacon);
})();
