import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1A3A5C" />
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
        <link rel="icon" href="/logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
