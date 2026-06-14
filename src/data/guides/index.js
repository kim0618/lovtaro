/**
 * 가이드 글 배열 - 단일 소스
 * 새 글 추가 시: 1) 개별 파일 src/data/guides/{slug}.js 생성
 *               2) 이 배열에 import + 등록
 *               3) scripts/prerender.mjs GUIDES 배열에도 등록
 *               4) public/sitemap.xml에 URL 추가
 */

import moonLoveMeaning from './moon-love-meaning.js'
import loversLoveMeaning from './lovers-love-meaning.js'
import empressLoveMeaning from './empress-love-meaning.js'
import starLoveMeaning from './star-love-meaning.js'
import towerLoveMeaning from './tower-love-meaning.js'
import emperorLoveMeaning from './emperor-love-meaning.js'
import hermitLoveMeaning from './hermit-love-meaning.js'
import foolLoveMeaning from './fool-love-meaning.js'
import devilLoveMeaning from './devil-love-meaning.js'
import sunLoveMeaning from './sun-love-meaning.js'
import wheelLoveMeaning from './wheel-love-meaning.js'
import deathLoveMeaning from './death-love-meaning.js'
import hangedLoveMeaning from './hanged-love-meaning.js'
import aceOfCupsLoveMeaning from './ace-of-cups-love-meaning.js'
import priestessLoveMeaning from './priestess-love-meaning.js'
import twoOfCupsLoveMeaning from './two-of-cups-love-meaning.js'
import strengthLoveMeaning from './strength-love-meaning.js'
import chariotsLoveMeaning from './chariot-love-meaning.js'
import threeOfCupsLoveMeaning from './three-of-cups-love-meaning.js'
import fourOfCupsLoveMeaning from './four-of-cups-love-meaning.js'
import fiveOfCupsLoveMeaning from './five-of-cups-love-meaning.js'
import sixOfCupsLoveMeaning from './six-of-cups-love-meaning.js'
import magicianLoveMeaning from './magician-love-meaning.js'
import judgementLoveMeaning from './judgement-love-meaning.js'
import worldLoveMeaning from './world-love-meaning.js'
import sevenOfCupsLoveMeaning from './seven-of-cups-love-meaning.js'
import eightOfCupsLoveMeaning from './eight-of-cups-love-meaning.js'
import temperanceLoveMeaning from './temperance-love-meaning.js'
import hierophantLoveMeaning from './hierophant-love-meaning.js'
import justiceLoveMeaning from './justice-love-meaning.js'
import nineOfCupsLoveMeaning from './nine-of-cups-love-meaning.js'
import tenOfCupsLoveMeaning from './ten-of-cups-love-meaning.js'
import pageOfCupsLoveMeaning from './page-of-cups-love-meaning.js'
import knightOfCupsLoveMeaning from './knight-of-cups-love-meaning.js'
import queenOfCupsLoveMeaning from './queen-of-cups-love-meaning.js'
import kingOfCupsLoveMeaning from './king-of-cups-love-meaning.js'
import crushMindTarot from './crush-mind-tarot.js'
import reunionTarotCards from './reunion-tarot-cards.js'
import breakupHealingTarot from './breakup-healing-tarot.js'
import contactTimingTarot from './contact-timing-tarot.js'
import confessionTimingTarot from './confession-timing-tarot.js'
import kingOfPentaclesLoveMeaning from './king-of-pentacles-love-meaning.js'
import fourOfPentaclesLoveMeaning from './four-of-pentacles-love-meaning.js'
import eightOfSwordsLoveMeaning from './eight-of-swords-love-meaning.js'
import sixOfWandsLoveMeaning from './six-of-wands-love-meaning.js'
import pageOfSwordsLoveMeaning from './page-of-swords-love-meaning.js'
import knightOfPentaclesLoveMeaning from './knight-of-pentacles-love-meaning.js'
import kingOfWandsLoveMeaning from './king-of-wands-love-meaning.js'
import threeOfSwordsLoveMeaning from './three-of-swords-love-meaning.js'
import nineOfWandsLoveMeaning from './nine-of-wands-love-meaning.js'
import twoOfSwordsLoveMeaning from './two-of-swords-love-meaning.js'
import nineOfSwordsLoveMeaning from './nine-of-swords-love-meaning.js'
import threeOfPentaclesLoveMeaning from './three-of-pentacles-love-meaning.js'
import queenOfWandsLoveMeaning from './queen-of-wands-love-meaning.js'

const guides = [
  queenOfWandsLoveMeaning,
  threeOfPentaclesLoveMeaning,
  nineOfSwordsLoveMeaning,
  twoOfSwordsLoveMeaning,
  nineOfWandsLoveMeaning,
  threeOfSwordsLoveMeaning,
  kingOfWandsLoveMeaning,
  knightOfPentaclesLoveMeaning,
  pageOfSwordsLoveMeaning,
  sixOfWandsLoveMeaning,
  eightOfSwordsLoveMeaning,
  fourOfPentaclesLoveMeaning,
  kingOfPentaclesLoveMeaning,
  confessionTimingTarot,
  contactTimingTarot,
  breakupHealingTarot,
  reunionTarotCards,
  crushMindTarot,
  kingOfCupsLoveMeaning,
  queenOfCupsLoveMeaning,
  knightOfCupsLoveMeaning,
  pageOfCupsLoveMeaning,
  tenOfCupsLoveMeaning,
  nineOfCupsLoveMeaning,
  justiceLoveMeaning,
  hierophantLoveMeaning,
  temperanceLoveMeaning,
  eightOfCupsLoveMeaning,
  sevenOfCupsLoveMeaning,
  sixOfCupsLoveMeaning,
  fiveOfCupsLoveMeaning,
  worldLoveMeaning,
  magicianLoveMeaning,
  judgementLoveMeaning,
  fourOfCupsLoveMeaning,
  chariotsLoveMeaning,
  threeOfCupsLoveMeaning,
  strengthLoveMeaning,
  twoOfCupsLoveMeaning,
  priestessLoveMeaning,
  aceOfCupsLoveMeaning,
  hangedLoveMeaning,
  deathLoveMeaning,
  wheelLoveMeaning,
  sunLoveMeaning,
  devilLoveMeaning,
  foolLoveMeaning,
  hermitLoveMeaning,
  emperorLoveMeaning,
  towerLoveMeaning,
  starLoveMeaning,
  empressLoveMeaning,
  loversLoveMeaning,
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
