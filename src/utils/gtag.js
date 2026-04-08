const GA_ID = 'G-9B8C0RHKXX'

export function initGA() {
  if (typeof window === 'undefined') return

  // GA 스크립트는 index.html에서 이미 로드됨
  // 여기서는 라우터 수동 페이지뷰를 위해 send_page_view만 비활성화
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
  }
  window.gtag('config', GA_ID, {
    send_page_view: false,
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
