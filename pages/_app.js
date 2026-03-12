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
            top: 8,
            right: 12,
            width: 44,
            height: 44,
            objectFit: 'contain',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      )}
      <Component {...pageProps} />
    </>
  )
}
