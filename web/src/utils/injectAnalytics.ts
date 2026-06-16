export function injectAnalytics(settings: Record<string, string>) {
  injectGA(settings.gaId);
  injectMetaPixel(settings.metaPixelId);
}

function injectGA(id: string | undefined) {
  const existing = document.getElementById('ga-script');
  if (!id) {
    existing?.remove();
    document.getElementById('ga-inline')?.remove();
    return;
  }
  if (existing) return; // already injected
  const s1 = document.createElement('script');
  s1.id = 'ga-script';
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  s2.id = 'ga-inline';
  s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
  document.head.appendChild(s2);
}

function injectMetaPixel(id: string | undefined) {
  if (!id) {
    document.getElementById('meta-pixel')?.remove();
    return;
  }
  if (document.getElementById('meta-pixel')) return;
  const s = document.createElement('script');
  s.id = 'meta-pixel';
  s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
  document.head.appendChild(s);
}
