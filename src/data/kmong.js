/**
 * 크몽 판매 채널 단일 소스.
 *
 * 프리미엄 리딩의 결제·전달은 크몽에서 이뤄진다. 사이트는 세일즈 페이지 역할만 하고
 * 실제 주문은 아래 URL로 넘긴다. 가격을 여기서만 관리해 페이지별 표기가 어긋나지 않게 한다.
 *
 * active: 크몽 심사를 통과해 실제로 열려 있는 서비스만 true.
 *   심사 대기 중인 서비스를 true로 두면 사이트에서 죽은 링크로 나간다.
 */

export const KMONG_SERVICES = [
  {
    id: 'love',
    label: '연애 타로 편지 리딩',
    tagline: '짝사랑 · 썸 · 연애 중의 고민까지',
    ctaLabel: '연애 리딩 신청하기',
    url: 'https://kmong.com/gig/796050',
    active: true,
    packages: [
      { name: '미니 3장 리딩', price: 9000, spec: '3페이지 요약' },
      { name: '정밀 편지 리딩', price: 29000, spec: '5페이지 편지', featured: true },
      { name: '정밀 편지 + 심층', price: 39000, spec: '6페이지 + 추가 질문 3개' },
    ],
  },
  {
    id: 'reunion',
    label: '재회 전문 타로',
    tagline: '이별 원인부터 재연락 타이밍까지',
    ctaLabel: '재회 리딩 신청하기',
    url: 'https://kmong.com/gig/796377',
    // 2026-07-29 재제출, 심사 통과 후 true로 변경
    active: false,
    packages: [
      { name: '재회 가능성 진단', price: 24000, spec: '3페이지 진단' },
      { name: '재회 로드맵 편지', price: 34000, spec: '5페이지 편지', featured: true },
      { name: '로드맵 + 심층 3문', price: 44000, spec: '6페이지 + 추가 질문 3개' },
    ],
  },
]

export const activeServices = KMONG_SERVICES.filter((s) => s.active)

const allPrices = activeServices.flatMap((s) => s.packages.map((p) => p.price))

export const LOW_PRICE = allPrices.length ? Math.min(...allPrices) : 0
export const HIGH_PRICE = allPrices.length ? Math.max(...allPrices) : 0
export const OFFER_COUNT = allPrices.length

export function formatPrice(won) {
  return `${won.toLocaleString('ko-KR')}원`
}

/** 홈·링크페이지의 짧은 안내 문구. "9,000원부터" */
export const PRICE_FROM = `${LOW_PRICE.toLocaleString('ko-KR')}원부터`
