import { watchEffect, onUnmounted } from 'vue'

const defaults = {
  title: 'Lovtaro | 감정의 흐름을 읽는 타로',
  description: '눈에 보이지 않는 의미를 천천히 비춥니다. 관계의 결을 깊고 조용하게 해석하는 프리미엄 타로 리딩, Lovtaro.',
}

export function useHead({ title, description }) {
  watchEffect(() => {
    const t = typeof title === 'function' ? title() : title
    const d = typeof description === 'function' ? description() : description

    document.title = t || defaults.title

    setMeta('description', d || defaults.description)
    setMeta('og:title', t || defaults.title, 'property')
    setMeta('og:description', d || defaults.description, 'property')
  })

  onUnmounted(() => {
    document.title = defaults.title
    setMeta('description', defaults.description)
    setMeta('og:title', defaults.title, 'property')
    setMeta('og:description', defaults.description, 'property')
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
