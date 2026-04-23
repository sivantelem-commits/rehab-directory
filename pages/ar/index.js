import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://rehabdirectoryil.vercel.app'

export async function getStaticProps() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const [
    { count: rehabCount },
    { count: treatmentCount },
    { count: practitionerCount },
  ] = await Promise.all([
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('treatment_services').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('practitioners').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
  ])

  return {
    props: {
      rehabCount:        rehabCount        || 0,
      treatmentCount:    treatmentCount    || 0,
      practitionerCount: practitionerCount || 0,
    },
    revalidate: 3600,
  }
}

const ARABIC_CITIES = [
  { slug: 'נצרת', label: 'الناصرة' },
  { slug: 'אום-אל-פחם', label: 'أم الفحم' },
  { slug: 'שפרעם', label: 'شفاعمرو' },
  { slug: 'טמרה', label: 'طمرة' },
  { slug: 'רהט', label: 'رهط' },
  { slug: 'חיפה', label: 'حيفا' },
  { slug: 'תל-אביב', label: 'تل أبيب' },
  { slug: 'ירושלים', label: 'القدس' },
  { slug: 'באר-שבע', label: 'بئر السبع' },
  { slug: 'עכו', label: 'عكا' },
]

const SECTIONS = [
  {
    href: '/rehab',
    icon: '♿',
    title: 'خدمات إعادة التأهيل',
    desc: 'خدمات إعادة التأهيل المجتمعية — السكن، التوظيف، التعليم والمرافقة الاجتماعية لمرضى الصحة النفسية',
    color: '#8B00D4',
    bg: '#f7f0ff',
  },
  {
    href: '/treatment',
    icon: '🏥',
    title: 'خدمات العلاج النفسي',
    desc: 'المستشفيات النفسية، عيادات الصحة النفسية، المشافي اليومية والعلاج المنزلي',
    color: '#0891B2',
    bg: '#f0faff',
  },
  {
    href: '/practitioners',
    icon: '🧠',
    title: 'المعالجون النفسيون الخاصون',
    desc: 'علماء نفس، أطباء نفسيون، مرشدون نفسيون ومعالجون معتمدون',
    color: '#0F4C75',
    bg: '#e8f2f8',
  },
  {
    href: '/map',
    icon: '🗺️',
    title: 'خريطة الخدمات',
    desc: 'ابحث عن الخدمات القريبة منك على الخريطة التفاعلية',
    color: '#1A3A5C',
    bg: '#f0f4f8',
  },
]

export default function ArHomePage({ rehabCount, treatmentCount, practitionerCount }) {
  const total = rehabCount + treatmentCount + practitionerCount

  return (
    <>
      <Head>
        <title>الصحة النفسية في إسرائيل | دليل الخدمات النفسية</title>
        <meta name="description" content={`دليل شامل لخدمات الصحة النفسية في إسرائيل — ${total} خدمة ومعالج. إعادة التأهيل، العلاج النفسي والمعالجون الخاصون.`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${BASE_URL}/ar`} />
        <link rel="alternate" hrefLang="he" href={BASE_URL} />
        <link rel="alternate" hrefLang="ar" href={`${BASE_URL}/ar`} />
        <meta property="og:title" content="الصحة النفسية في إسرائيل | دليل الخدمات" />
        <meta property="og:locale" content="ar_IL" />
        <meta property="og:locale:alternate" content="he_IL" />
        <meta property="og:site_name" content="الصحة النفسية في إسرائيل" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic', 'Arial', sans-serif", minHeight: '100vh', background: '#f5f7fa' }}>

        {/* Header */}
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/ar">
              <img src="/logo.png" alt="" style={{ width: 38, height: 38, objectFit: 'contain', filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
            </Link>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>الصحة النفسية في إسرائيل</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>دليل الخدمات</div>
            </div>
          </div>
          <Link href="/" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 999, padding: '5px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>
            עברית 🇮🇱
          </Link>
        </header>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '48px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.3 }}>
            الصحة النفسية في إسرائيل
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 24px', maxWidth: 560, marginInline: 'auto', lineHeight: 1.7 }}>
            دليل شامل لخدمات الصحة النفسية — إعادة التأهيل، العلاج النفسي والمعالجون الخاصون في جميع أنحاء البلاد
          </p>

          {/* مددي المفاتيح */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
            {[
              [rehabCount, 'خدمة تأهيل', '#f7f0ff', '#8B00D4'],
              [treatmentCount, 'خدمة علاج', '#f0faff', '#0891B2'],
              [practitionerCount, 'معالج خاص', '#e8f2f8', '#0F4C75'],
            ].map(([count, label, bg, color]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 22px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>{count}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
              </div>
            ))}
          </div>

          <a href="/map" style={{ display: 'inline-block', background: 'white', color: '#1A3A5C', borderRadius: 999, padding: '12px 28px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            🗺️ ابحث على الخريطة
          </a>
        </div>

        <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>

          {/* الأقسام الرئيسية */}
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A3A5C', marginBottom: 16, textAlign: 'center' }}>
            ما الذي تبحث عنه؟
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 40 }}>
            {SECTIONS.map(s => (
              <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
                <div style={{ background: s.bg, border: `2px solid ${s.color}22`, borderTop: `4px solid ${s.color}`, borderRadius: 14, padding: '20px 16px', textAlign: 'center', transition: 'transform 0.12s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: s.color, marginBottom: 8, lineHeight: 1.4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* البحث حسب المدينة */}
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1.5px solid #e0e0e0', marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>البحث حسب المدينة</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>اختر مدينتك للعثور على الخدمات القريبة منك</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ARABIC_CITIES.map(({ slug, label }) => (
                <Link key={slug} href={`/city/${slug.replace(/\s/g, '-')}`}
                  style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#f5f7fa', color: '#1A3A5C', textDecoration: 'none', border: '1.5px solid #ddd' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* معلومات مهمة */}
          <div style={{ background: '#fff8e1', border: '1.5px solid #ffd54f', borderRadius: 14, padding: '20px 24px', marginBottom: 32 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e65100', marginBottom: 12 }}>⚠️ في حالة الطوارئ</h3>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
              <div><strong>خط الأزمات:</strong> <a href="tel:1201" style={{ color: '#1A3A5C', fontWeight: 700 }}>1201</a> (إيران — عربي)</div>
              <div><strong>الإسعاف:</strong> <a href="tel:101" style={{ color: '#1A3A5C', fontWeight: 700 }}>101</a></div>
              <div><strong>خط دعم نفسي:</strong> <a href="tel:1201" style={{ color: '#1A3A5C', fontWeight: 700 }}>1201</a></div>
            </div>
          </div>

          {/* كيفية التسجيل */}
          <div style={{ background: 'white', borderRadius: 14, padding: '20px 24px', border: '1.5px solid #e0e0e0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A3A5C', marginBottom: 8 }}>هل تقدم خدمات؟</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>إذا كنت تقدم خدمات صحة نفسية وتريد إضافتها إلى الدليل، يمكنك التسجيل مجانًا.</p>
            <Link href="/register" style={{ display: 'inline-block', background: '#1A3A5C', color: 'white', borderRadius: 999, padding: '10px 24px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              + أضف خدمتك
            </Link>
          </div>

        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 32 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/ar" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>الرئيسية</Link>
            <span style={{ opacity: 0.4 }}>·</span>
            <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>تواصل معنا</Link>
            <span style={{ opacity: 0.4 }}>·</span>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>עברית</Link>
          </div>
          الصحة النفسية في إسرائيل © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
