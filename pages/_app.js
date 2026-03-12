export default function App({ Component, pageProps }) {
  return (
    <>
      <img
        src="/logo.png"
        alt="לוגו"
        style={{
          position: 'fixed',
          top: 12,
          right: 16,
          width: 44,
          height: 44,
          objectFit: 'contain',
          mixBlendMode: 'multiply',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      />
      <Component {...pageProps} />
    </>
  )
}
