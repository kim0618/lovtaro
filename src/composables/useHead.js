import { watchEffect, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const defaults = {
  title: 'Lovtaro | 감정의 흐름을 읽는 타로',
  description: '눈에 보이지 않는 의미를 천천히 비춥니다. 관계의 결을 깊고 조용하게 해석하는 프리미엄 타로 리딩, Lovtaro.',
}

// 도메인 변경 시 여기만 수정
export const SITE_URL = 'https://lovtaro.pages.dev'

const JSON_LD_ID = 'lovtaro-jsonld'

export function useHead({ title, description, jsonLd }) {
  const route = useRoute()

  watchEffect(() => {
    const t = typeof title === 'function' ? title() : title
    const d = typeof description === 'function' ? description() : description
    const url = `${SITE_URL}${route.path}`

    document.title = t || defaults.title

    setMeta('description', d || defaults.description)
    setMeta('og:title', t || defaults.title, 'property')
    setMeta('og:description', d || defaults.description, 'property')
    setMeta('og:url', url, 'property')

    setLink('canonical', url)

    if (jsonLd) {
      const data = typeof jsonLd === 'function' ? jsonLd() : jsonLd
      setJsonLd(data)
    }
  })

  onUnmounted(() => {
    document.title = defaults.title
    setMeta('description', defaults.description)
    setMeta('og:title', defaults.title, 'property')
    setMeta('og:description', defaults.description, 'property')
    setMeta('og:url', SITE_URL, 'property')
    setLink('canonical', SITE_URL)
    removeJsonLd()
  })
}

function setMeta(name, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(data) {
  let el = document.getElementById(JSON_LD_ID)
  if (!el) {
    el = document.createElement('script')
    el.id = JSON_LD_ID
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLd() {
  const el = document.getElementById(JSON_LD_ID)
  if (el) el.remove()
}
