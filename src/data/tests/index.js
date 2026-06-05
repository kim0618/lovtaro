/**
 * 심리테스트 레지스트리 (단일 소스).
 *
 * 새 테스트 추가 절차:
 *   1) src/data/tests/<slug>.js 작성 (love-style.js 스키마 참고)
 *   2) 아래 TESTS 배열에 import 등록
 *   3) 라우트 메타는 scripts/prerender.mjs의 TEST_ROUTES + public/sitemap.xml에도 등록
 *
 * 허브 페이지(/test)와 엔진 페이지(/test/:slug)가 이 배열을 공유한다.
 */
import loveStyle from './love-style.js'
import mbtiLove from './mbti-love.js'
import idealType from './ideal-type.js'
import pastLife from './past-life.js'
import crush from './crush.js'

// 허브 노출 순서 = 검색 수요 + 후킹 강한 순 (상위가 클릭 많음)
export const TESTS = [idealType, pastLife, mbtiLove, crush, loveStyle]

export function getTest(slug) {
  return TESTS.find(t => t.slug === slug) ?? null
}
