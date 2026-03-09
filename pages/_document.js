import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="מאגר שירותי סל שיקום בקהילה – מצאו שירותי דיור, תעסוקה, השכלה וליווי לפי אזור בישראל" />
        <meta name="keywords" content="סל שיקום, שירותי שיקום, דיור מוגן, תעסוקה נתמכת, שיקום בקהילה, בריאות הנפש" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="מאגר שירותי סל שיקום" />
        <meta property="og:title" content="מאגר שירותי סל שיקום" />
        <meta property="og:description" content="מצאו שירותי שיקום בקהילה לפי אזור וקטגוריה" />
        <meta property="og:locale" content="he_IL" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="מאגר שירותי סל שיקום" />
        <meta name="twitter:description" content="מצאו שירותי שיקום בקהילה לפי אזור וקטגוריה" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23F47B20'/><text y='.9em' font-size='70' x='15'>♿</text></svg>" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
