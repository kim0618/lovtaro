export const TAROT_CARDS = [
  { id: 'fool',       name: '바보',         nameEn: 'The Fool',          keywords: ['새로운 시작', '가능성', '순수함'],     energy: 'positive' },
  { id: 'lovers',     name: '연인',         nameEn: 'The Lovers',        keywords: ['선택', '관계', '조화'],               energy: 'positive' },
  { id: 'star',       name: '별',           nameEn: 'The Star',          keywords: ['희망', '치유', '믿음'],               energy: 'positive' },
  { id: 'world',      name: '세계',         nameEn: 'The World',         keywords: ['완성', '성취', '순환'],               energy: 'positive' },
  { id: 'strength',   name: '힘',           nameEn: 'Strength',          keywords: ['용기', '인내', '내면의 힘'],           energy: 'positive' },
  { id: 'temperance', name: '절제',         nameEn: 'Temperance',        keywords: ['조화', '균형', '인내'],               energy: 'positive' },
  { id: 'moon',       name: '달',           nameEn: 'The Moon',          keywords: ['불확실', '감정', '직관'],             energy: 'neutral'  },
  { id: 'hermit',     name: '은둔자',       nameEn: 'The Hermit',        keywords: ['내면', '거리', '성찰'],               energy: 'neutral'  },
  { id: 'wheel',      name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', keywords: ['변화', '흐름', '전환'],             energy: 'neutral'  },
  { id: 'hanged',     name: '매달린 사람',   nameEn: 'The Hanged Man',   keywords: ['기다림', '정지', '관점'],             energy: 'neutral'  },
  { id: 'justice',    name: '정의',         nameEn: 'Justice',           keywords: ['균형', '진실', '결과'],               energy: 'neutral'  },
  { id: 'tower',      name: '탑',           nameEn: 'The Tower',         keywords: ['변동', '붕괴', '전환점'],             energy: 'challenging' },
]

/**
 * Fisher-Yates shuffle with upright/reversed assignment.
 * Each card has ~30% chance of being reversed.
 */
export function shuffleCards(cards) {
  const arr = cards.map(card => ({
    ...card,
    reversed: Math.random() < 0.3,
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
