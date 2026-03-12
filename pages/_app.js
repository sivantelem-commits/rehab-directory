import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const isHome = router.pathname === '/'

  return (
    <>
      {!isHome && (
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
            filter: 'brightness(0) invert(1)',
            mixBlendMode: 'multiply',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      )}
      <Component {...pageProps} />
    </>
  )
}
