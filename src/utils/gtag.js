// ⚠️ 오픈 전 필수: GA4 속성 생성 후 아래 ID를 실제 측정 ID로 교체하세요
// Google Analytics → 관리 → 데이터 스트림 → 측정 ID (G-XXXXXXXXXX 형식)
const GA_ID = 'G-XXXXXXXXXX'

export function initGA() {
  if (typeof window === 'undefined') return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    send_page_view: false, // 라우터에서 수동 전송
  })
}

export function trackPageView(path, title) {
  if (!window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  })
}

export function trackEvent(name, params = {}) {
  if (!window.gtag) return
  window.gtag('event', name, params)
}
