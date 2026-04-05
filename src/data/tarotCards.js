import { getCardImage as _getCardImage } from './cardImages.js'

export const TAROT_CARDS = [
  { id: 'fool',       name: '바보',         nameEn: 'The Fool',          keywords: ['새로운 시작', '가능성', '순수함'],     energy: 'positive' },
  { id: 'magician',   name: '마법사',       nameEn: 'The Magician',      keywords: ['의지', '창조', '실현'],               energy: 'positive' },
  { id: 'priestess',  name: '여사제',       nameEn: 'The High Priestess', keywords: ['직관', '신비', '내면의 지혜'],       energy: 'neutral'  },
  { id: 'empress',    name: '여황제',       nameEn: 'The Empress',       keywords: ['풍요', '사랑', '돌봄'],               energy: 'positive' },
  { id: 'emperor',    name: '황제',         nameEn: 'The Emperor',       keywords: ['안정', '책임', '구조'],               energy: 'neutral'  },
  { id: 'hierophant', name: '교황',         nameEn: 'The Hierophant',    keywords: ['전통', '신뢰', '가르침'],             energy: 'neutral'  },
  { id: 'lovers',     name: '연인',         nameEn: 'The Lovers',        keywords: ['선택', '관계', '조화'],               energy: 'positive' },
  { id: 'chariot',    name: '전차',         nameEn: 'The Chariot',       keywords: ['전진', '의지', '승리'],               energy: 'positive' },
  { id: 'strength',   name: '힘',           nameEn: 'Strength',          keywords: ['용기', '인내', '내면의 힘'],           energy: 'positive' },
  { id: 'hermit',     name: '은둔자',       nameEn: 'The Hermit',        keywords: ['내면', '거리', '성찰'],               energy: 'neutral'  },
  { id: 'wheel',      name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', keywords: ['변화', '흐름', '전환'],             energy: 'neutral'  },
  { id: 'justice',    name: '정의',         nameEn: 'Justice',           keywords: ['균형', '진실', '결과'],               energy: 'neutral'  },
  { id: 'hanged',     name: '매달린 사람',   nameEn: 'The Hanged Man',   keywords: ['기다림', '정지', '관점'],             energy: 'neutral'  },
  { id: 'death',      name: '죽음',         nameEn: 'Death',             keywords: ['끝', '변환', '재탄생'],               energy: 'challenging' },
  { id: 'temperance', name: '절제',         nameEn: 'Temperance',        keywords: ['조화', '균형', '인내'],               energy: 'positive' },
  { id: 'devil',      name: '악마',         nameEn: 'The Devil',         keywords: ['집착', '유혹', '속박'],               energy: 'challenging' },
  { id: 'tower',      name: '탑',           nameEn: 'The Tower',         keywords: ['변동', '붕괴', '전환점'],             energy: 'challenging' },
  { id: 'star',       name: '별',           nameEn: 'The Star',          keywords: ['희망', '치유', '믿음'],               energy: 'positive' },
  { id: 'moon',       name: '달',           nameEn: 'The Moon',          keywords: ['불확실', '감정', '직관'],             energy: 'neutral'  },
  { id: 'sun',        name: '태양',         nameEn: 'The Sun',           keywords: ['기쁨', '성공', '활력'],               energy: 'positive' },
  { id: 'judgement',  name: '심판',         nameEn: 'Judgement',         keywords: ['각성', '재평가', '부름'],             energy: 'neutral'  },
  { id: 'world',      name: '세계',         nameEn: 'The World',         keywords: ['완성', '성취', '순환'],               energy: 'positive' },
]

/**
 * Fisher-Yates shuffle with upright/reversed assignment.
 * Each card has ~30% chance of being reversed.
 */
export function shuffleCards(cards) {
  const arr = cards.map(card => ({
    ...card,
    reversed: Math.random() < 0.3,
    image: _getCardImage(card.id) || '',
  }))
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function getCardById(id) {
  return TAROT_CARDS.find(c => c.id === id) ?? null
}
