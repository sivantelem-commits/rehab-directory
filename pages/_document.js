import { Html, Head, Main, NextScript } from 'next/document'
export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2E0060" />
        <meta name="robots" content="index, follow" />
        <meta name="description" content="הנגשת בריאות הנפש בישראל – מצאו שירותי שיקום וטיפול לפי אזור" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <meta property="og:title" content="בריאות נפש בישראל" />
        <meta property="og:description" content="הנגשת בריאות הנפש בישראל – מצאו שירותי שיקום וטיפול לפי אזור" />
        <meta property="og:locale" content="he_IL" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="בריאות נפש בישראל" />
        <meta name="twitter:description" content="הנגשת בריאות הנפש בישראל – מצאו שירותי שיקום וטיפול לפי אזור" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="בריאות נפש בישראל" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="בריאות נפש" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />

        {/* Google Analytics */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied'
          });
          window.__loadGA = function() {
            var s = document.createElement('script');
            s.src = 'https://www.googletagmanager.com/gtag/js?id=G-CL2BJ9Q4X3';
            s.async = true;
            document.head.appendChild(s);
            gtag('js', new Date());
            gtag('config', 'G-CL2BJ9Q4X3', { anonymize_ip: true });
            gtag('consent', 'update', { analytics_storage: 'granted' });
          };
          if (typeof localStorage !== 'undefined' && localStorage.getItem('cookie_consent') === 'accepted') {
            window.__loadGA();
          }
        `}} />

        {/* Service Worker */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
