/**
 * 꿈해몽 사전 데이터 배열 - 단일 소스
 * 새 글 추가 시: 1) 개별 파일 src/data/dreams/{slug}.js 생성 (가이드와 동일 스키마)
 *               2) 이 배열에 import + 등록
 *               3) public/sitemap.xml에 /dream/{slug}/ URL 추가
 * prerender.mjs는 이 배열을 직접 import해 /dream/{slug} 라우트를 자동 생성한다.
 *
 * 포지셔닝: 범용 꿈해몽이 아니라 "연애+꿈 롱테일" 니치.
 * 전통 해몽(근거) 위에 러브타로의 연애 각도(브랜드)를 얹고, 가능성의 언어로 쓴다.
 */

import haircutDream from './haircut-dream.js'
import seaDream from './sea-dream.js'
import flowerDream from './flower-dream.js'
import fireDream from './fire-dream.js'
import travelDream from './travel-dream.js'
import houseDream from './house-dream.js'
import reconcileDream from './reconcile-dream.js'
import chaseDream from './chase-dream.js'
import rejectionDream from './rejection-dream.js'
import catDream from './cat-dream.js'
import rainDream from './rain-dream.js'
import flyingDream from './flying-dream.js'
import dogDream from './dog-dream.js'
import proposalDream from './proposal-dream.js'
import dateDream from './date-dream.js'
import giftDream from './gift-dream.js'
import jealousyDream from './jealousy-dream.js'
import messageDream from './message-dream.js'
import movingDream from './moving-dream.js'
import holdingHandsDream from './holding-hands-dream.js'
import strangerDream from './stranger-dream.js'
import hugDream from './hug-dream.js'
import confessionDream from './confession-dream.js'
import reunionDream from './reunion-dream.js'
import fightDream from './fight-dream.js'
import cheatingDream from './cheating-dream.js'
import water from './water.js'
import teethFalling from './teeth-falling.js'
import feces from './feces.js'
import celebrity from './celebrity.js'
import snake from './snake.js'
import deathDream from './death-dream.js'
import oldFriend from './old-friend.js'
import breakup from './breakup.js'
import crying from './crying.js'
import wedding from './wedding.js'
import pregnancy from './pregnancy.js'
import exLover from './ex-lover.js'
import crush from './crush.js'
import kiss from './kiss.js'
import moonDream from './moon-dream.js'
import ringDream from './ring-dream.js'
import firstLoveDream from './first-love-dream.js'
import letterDream from './letter-dream.js'
import divorceDream from './divorce-dream.js'
import spiderDream from './spider-dream.js'
import mirrorDream from './mirror-dream.js'
import mealDream from './meal-dream.js'
import fishDream from './fish-dream.js'
import blindDateDream from './blind-date-dream.js'
import umbrellaDream from './umbrella-dream.js'
import butterflyDream from './butterfly-dream.js'
import rainbowDream from './rainbow-dream.js'
import nameCallDream from './name-call-dream.js'

const dreams = [
  nameCallDream,
  rainbowDream,
  butterflyDream,
  umbrellaDream,
  blindDateDream,
  fishDream,
  mealDream,
  mirrorDream,
  spiderDream,
  divorceDream,
  letterDream,
  firstLoveDream,
  ringDream,
  haircutDream,
  seaDream,
  flowerDream,
  moonDream,
  fireDream,
  travelDream,
  houseDream,
  reconcileDream,
  chaseDream,
  rejectionDream,
  catDream,
  rainDream,
  flyingDream,
  dogDream,
  proposalDream,
  dateDream,
  giftDream,
  jealousyDream,
  messageDream,
  movingDream,
  holdingHandsDream,
  strangerDream,
  hugDream,
  confessionDream,
  reunionDream,
  fightDream,
  cheatingDream,
  water,
  teethFalling,
  feces,
  celebrity,
  snake,
  deathDream,
  oldFriend,
  breakup,
  crying,
  wedding,
  pregnancy,
  exLover,
  crush,
  kiss,
]

export default dreams

export function getDream(slug) {
  return dreams.find(d => d.slug === slug) || null
}

export function getDreamsByCategory(category) {
  return dreams.filter(d => d.category === category)
}

export function getAllDreams() {
  return dreams
}

/**
 * 카테고리 정의
 * person: 인물 꿈 (전 애인, 좋아하는 사람, 옛 친구 등)
 * situation: 상황·행동 꿈 (키스, 결혼, 이별, 우는 꿈 등)
 * symbol: 상징 꿈 (뱀, 물, 이빨 등 - 연애 각도로 풀이)
 */
export const DREAM_CATEGORIES = [
  { key: 'person', label: '인물' },
  { key: 'situation', label: '상황·행동' },
  { key: 'symbol', label: '상징' },
]
