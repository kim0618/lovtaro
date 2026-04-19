/**
 * 가이드 글 배열 - 단일 소스
 * 새 글 추가 시: 1) 개별 파일 src/data/guides/{slug}.js 생성
 *               2) 이 배열에 import + 등록
 *               3) scripts/prerender.mjs GUIDES 배열에도 등록
 *               4) public/sitemap.xml에 URL 추가
 */

import moonLoveMeaning from './moon-love-meaning.js'

const guides = [
  moonLoveMeaning,
]

export default guides

export function getGuide(slug) {
  return guides.find(g => g.slug === slug) || null
}

export function getGuidesByCategory(category) {
  return guides.filter(g => g.category === category)
}

export function getAllGuides() {
  return guides
}

/**
 * 카테고리 정의
 * card-interpretation: 카드별 연애 심화 해석
 * situation: 상황별 가이드
 * method: 타로 방법론·입문
 * faq: FAQ·신뢰 콘텐츠
 */
export const GUIDE_CATEGORIES = [
  { key: 'card-interpretation', label: '카드 해석' },
  { key: 'situation', label: '상황별 가이드' },
  { key: 'method', label: '타로 기초' },
  { key: 'faq', label: '자주 묻는 질문' },
]
