/**
 * 궁합 타로 - 카드 속성, 점수 계산, 해석 생성
 */

// ── 22장 연애 속성 (1~10) ──
const CARD_ATTRS = {
  fool:       { passion: 8, stability: 3, communication: 6, growth: 9 },
  magician:   { passion: 7, stability: 5, communication: 9, growth: 8 },
  priestess:  { passion: 4, stability: 6, communication: 5, growth: 7 },
  empress:    { passion: 8, stability: 8, communication: 7, growth: 9 },
  emperor:    { passion: 5, stability: 10, communication: 6, growth: 6 },
  hierophant: { passion: 4, stability: 9, communication: 7, growth: 5 },
  lovers:     { passion: 10, stability: 7, communication: 9, growth: 8 },
  chariot:    { passion: 9, stability: 6, communication: 5, growth: 8 },
  strength:   { passion: 7, stability: 8, communication: 7, growth: 8 },
  hermit:     { passion: 3, stability: 7, communication: 3, growth: 9 },
  wheel:      { passion: 7, stability: 4, communication: 6, growth: 8 },
  justice:    { passion: 4, stability: 9, communication: 8, growth: 6 },
  hanged:     { passion: 5, stability: 5, communication: 4, growth: 8 },
  death:      { passion: 6, stability: 3, communication: 4, growth: 10 },
  temperance: { passion: 6, stability: 9, communication: 8, growth: 7 },
  devil:      { passion: 10, stability: 3, communication: 4, growth: 3 },
  tower:      { passion: 8, stability: 2, communication: 3, growth: 7 },
  star:       { passion: 7, stability: 7, communication: 8, growth: 9 },
  moon:       { passion: 8, stability: 3, communication: 4, growth: 6 },
  sun:        { passion: 9, stability: 8, communication: 9, growth: 9 },
  judgement:  { passion: 6, stability: 6, communication: 7, growth: 10 },
  world:      { passion: 8, stability: 9, communication: 8, growth: 9 },
}

// ── 특별 조합 보너스/감점 ──
const SPECIAL_COMBOS = {
  'lovers+sun':       { bonus: 15, label: '빛나는 사랑', desc: '서로를 가장 밝게 비추는 최고의 조합이에요.' },
  'lovers+star':      { bonus: 12, label: '운명적 끌림', desc: '이 만남에는 특별한 별의 인도가 있어요.' },
  'empress+emperor':  { bonus: 14, label: '완벽한 균형', desc: '서로에게 없는 것을 채워주는 이상적인 관계예요.' },
  'sun+star':         { bonus: 12, label: '눈부신 조화', desc: '함께 있으면 모든 것이 더 환하게 빛나요.' },
  'sun+world':        { bonus: 13, label: '축복받은 인연', desc: '만남 자체가 하나의 축복이에요.' },
  'lovers+empress':   { bonus: 11, label: '깊은 사랑', desc: '진심과 헌신이 자연스럽게 흐르는 관계예요.' },
  'strength+star':    { bonus: 10, label: '서로의 빛', desc: '힘든 순간에도 서로를 밝혀주는 관계예요.' },
  'world+empress':    { bonus: 10, label: '성숙한 사랑', desc: '서로를 깊이 이해하고 존중하는 관계예요.' },
  'temperance+lovers':{ bonus: 10, label: '조화로운 사랑', desc: '감정의 균형이 아름답게 맞아요.' },
  'devil+tower':      { bonus: -12, label: '위험한 끌림', desc: '강하게 끌리지만 서로를 태울 수 있는 관계예요.' },
  'devil+moon':       { bonus: -8,  label: '안개 속 유혹', desc: '진심인지 집착인지 구분이 어려운 흐름이에요.' },
  'tower+death':      { bonus: -10, label: '격동의 만남', desc: '함께하면 큰 변화를 겪게 되는 관계예요.' },
  'hermit+chariot':   { bonus: -6,  label: '엇갈린 속도', desc: '원하는 템포가 달라 맞추기 어려울 수 있어요.' },
  'moon+hermit':      { bonus: -5,  label: '서로를 읽기 어려움', desc: '마음을 열기까지 시간이 오래 걸리는 조합이에요.' },
}

// ── 점수 등급별 해석 ──
const SCORE_TIERS = [
  { min: 90, label: '운명적 인연', summary: '두 사람 사이에 특별한 끌림이 흐르고 있어요. 서로에게 빠져드는 것이 자연스러운 관계예요.' },
  { min: 80, label: '강한 케미', summary: '서로를 끌어당기는 에너지가 강해요. 함께하면 좋은 일이 많아질 관계예요.' },
  { min: 70, label: '좋은 흐름', summary: '서로에게 긍정적인 영향을 주고받을 수 있는 관계예요. 자연스럽게 가까워질 수 있어요.' },
  { min: 60, label: '가능성이 있는 관계', summary: '서로 다른 점이 있지만, 그것이 오히려 매력이 될 수 있어요. 노력하면 좋은 관계로 발전할 수 있어요.' },
  { min: 50, label: '조율이 필요한 관계', summary: '서로를 이해하기 위한 시간과 노력이 필요해요. 하지만 그 과정에서 더 깊어질 수 있어요.' },
  { min: 40, label: '쉽지 않은 흐름', summary: '서로 다른 파장을 가지고 있어요. 맞춰가려는 의지가 있다면 불가능하지 않아요.' },
  { min: 0,  label: '도전적인 관계', summary: '지금은 에너지가 잘 맞지 않는 흐름이에요. 서로를 이해하려는 깊은 노력이 필요해요.' },
]

// ── 카드별 에너지 한줄 해석 (궁합 맥락) ──
const CARD_ENERGY_DESC = {
  fool:       '자유롭고 열린 마음으로 관계에 다가가요.',
  magician:   '관계를 원하는 방향으로 이끌어갈 힘이 있어요.',
  priestess:  '깊은 내면에서 상대를 느끼고 읽어내요.',
  empress:    '따뜻하고 풍요로운 사랑의 에너지를 가지고 있어요.',
  emperor:    '안정적이고 책임감 있는 태도로 관계를 지켜요.',
  hierophant: '진지하고 성실한 마음으로 관계에 임해요.',
  lovers:     '진심 어린 감정과 깊은 연결을 추구해요.',
  chariot:    '관계를 향해 적극적으로 달려가는 에너지예요.',
  strength:   '인내와 부드러운 강함으로 관계를 지탱해요.',
  hermit:     '혼자만의 세계가 깊어 마음을 여는 데 시간이 걸려요.',
  wheel:      '변화무쌍한 에너지로 관계에 새로움을 불어넣어요.',
  justice:    '공정하고 균형 잡힌 관계를 중요하게 생각해요.',
  hanged:     '기다릴 줄 아는 깊은 마음을 가지고 있어요.',
  death:      '관계를 통해 깊은 변화와 성장을 경험해요.',
  temperance: '조화롭고 안정된 사랑을 추구하는 에너지예요.',
  devil:      '강렬하고 본능적인 끌림의 에너지를 가지고 있어요.',
  tower:      '관계에 강한 충격과 전환점을 가져올 수 있어요.',
  star:       '희망적이고 치유하는 사랑의 에너지예요.',
  moon:       '감성적이고 신비로운 매력을 가지고 있어요.',
  sun:        '밝고 따뜻한 에너지로 관계를 환하게 비춰요.',
  judgement:  '과거를 돌아보고 새로운 사랑을 시작하는 에너지예요.',
  world:      '성숙하고 완성된 사랑의 에너지를 가지고 있어요.',
}

// ── 역방향 에너지 한줄 해석 ──
const CARD_ENERGY_REVERSED = {
  fool:       '관계에 대한 불안정함과 방향 없는 설렘이 섞여 있어요.',
  magician:   '마음은 있지만 방향을 잃고 헤매는 에너지예요.',
  priestess:  '직관을 무시하고 상대의 진심을 외면하고 있어요.',
  empress:    '과한 기대나 집착이 관계를 무겁게 만들 수 있어요.',
  emperor:    '통제하려는 마음이 관계를 경직되게 해요.',
  hierophant: '형식에 갇혀 진짜 마음을 표현하지 못하고 있어요.',
  lovers:     '마음은 있지만 갈등과 망설임이 앞서는 에너지예요.',
  chariot:    '관계에서 혼자만 달리고 있을 수 있어요.',
  strength:   '자신감을 잃고 관계에서 위축되어 있어요.',
  hermit:     '지나친 고립으로 상대와의 거리가 멀어지고 있어요.',
  wheel:      '변화에 저항하며 관계의 흐름을 막고 있어요.',
  justice:    '자기 잣대로만 상대를 평가하고 있을 수 있어요.',
  hanged:     '기다림이 무기력으로 변해 관계가 정체되어 있어요.',
  death:      '끝나야 할 것을 놓지 못하고 있는 에너지예요.',
  temperance: '균형을 잃고 감정이 극단으로 흐르고 있어요.',
  devil:      '건강하지 못한 집착이 관계를 지배하고 있어요.',
  tower:      '내면의 불안이 관계를 흔들고 있어요.',
  star:       '희망을 잃고 사랑에 대한 믿음이 약해져 있어요.',
  moon:       '불안과 의심이 관계를 흐리게 만들고 있어요.',
  sun:        '겉으로는 밝지만 진짜 감정을 숨기고 있어요.',
  judgement:  '과거의 상처에서 벗어나지 못하고 있어요.',
  world:      '거의 다 왔지만 마지막 한 걸음을 내딛지 못하고 있어요.',
}

// ── 케미 해석 생성 ──
const CHEMISTRY_TEMPLATES = {
  highPassion: [
    '두 사람 사이에 강렬한 끌림이 흐르고 있어요. 서로에게 빠져드는 속도가 빠를 수 있어요.',
    '만나면 심장이 뛰는 관계예요. 이 열기를 오래 유지하는 것이 관건이에요.',
  ],
  highStability: [
    '함께 있으면 편안하고 안정감을 느끼는 관계예요. 오래 갈 수 있는 기반이 있어요.',
    '서로에게 안식처가 될 수 있는 관계예요. 신뢰가 이 관계의 핵심이에요.',
  ],
  highCommunication: [
    '서로의 마음을 읽는 능력이 뛰어난 조합이에요. 말하지 않아도 통하는 순간이 많을 거예요.',
    '대화가 잘 통하고 서로를 이해하는 속도가 빠른 관계예요.',
  ],
  highGrowth: [
    '함께하면 서로가 더 나은 사람이 되는 관계예요. 성장을 촉진하는 아름다운 만남이에요.',
    '이 관계를 통해 두 사람 모두 한 단계 성장할 수 있어요.',
  ],
  balanced: [
    '열정, 안정, 소통, 성장이 고르게 어우러진 관계예요. 균형 잡힌 사랑이 가능해요.',
    '어느 하나에 치우치지 않은 건강한 에너지가 흐르고 있어요.',
  ],
  lowMatch: [
    '서로 다른 파장을 가지고 있어요. 하지만 다름이 반드시 나쁜 것은 아니에요.',
    '맞춰가는 과정이 필요하지만, 그 과정 자체가 관계를 깊게 만들 수 있어요.',
  ],
}

/**
 * 궁합 점수 계산
 */
export function calculateCompatibility(card1Id, card1Reversed, card2Id, card2Reversed) {
  const a1 = CARD_ATTRS[card1Id]
  const a2 = CARD_ATTRS[card2Id]
  if (!a1 || !a2) return null

  // 1) 속성 보완도 계산 (높을수록 좋은 조합)
  const keys = ['passion', 'stability', 'communication', 'growth']
  let complementScore = 0
  let totalScore = 0

  for (const k of keys) {
    const v1 = a1[k]
    const v2 = a2[k]
    // 둘 다 높으면 시너지, 한쪽이 보완하면 보너스
    const synergy = (v1 + v2) / 2  // 평균 높을수록 좋음
    const diff = Math.abs(v1 - v2)
    const complement = diff <= 3 ? 2 : diff <= 5 ? 1 : 0  // 적당한 차이는 보완
    complementScore += complement
    totalScore += synergy
  }

  // 기본 점수 (0~100 범위로 정규화)
  let score = Math.round((totalScore / 40) * 60 + (complementScore / 8) * 25 + 15)

  // 2) 특별 조합 보너스
  const comboKey1 = `${card1Id}+${card2Id}`
  const comboKey2 = `${card2Id}+${card1Id}`
  const specialCombo = SPECIAL_COMBOS[comboKey1] || SPECIAL_COMBOS[comboKey2] || null
  if (specialCombo) {
    score += specialCombo.bonus
  }

  // 3) 같은 카드 보너스
  const isSameCard = card1Id === card2Id
  if (isSameCard) {
    score += 5
  }

  // 4) 역방향 감점 (카드 ID 기반 결정론적 값)
  if (card1Reversed) score -= (card1Id.charCodeAt(0) % 8) + 8   // -8 ~ -15
  if (card2Reversed) score -= (card2Id.charCodeAt(0) % 8) + 8

  // 5) 범위 제한
  score = Math.max(35, Math.min(97, score))

  return score
}

/**
 * 궁합 결과 생성
 */
export function generateCompatibilityResult(card1, card2, score) {
  const a1 = CARD_ATTRS[card1.id]
  const a2 = CARD_ATTRS[card2.id]

  // 점수 등급
  const tier = SCORE_TIERS.find(t => score >= t.min) || SCORE_TIERS[SCORE_TIERS.length - 1]

  // 에너지 해석
  const energy1 = card1.reversed
    ? CARD_ENERGY_REVERSED[card1.id]
    : CARD_ENERGY_DESC[card1.id]
  const energy2 = card2.reversed
    ? CARD_ENERGY_REVERSED[card2.id]
    : CARD_ENERGY_DESC[card2.id]

  // 특별 조합
  const comboKey1 = `${card1.id}+${card2.id}`
  const comboKey2 = `${card2.id}+${card1.id}`
  const specialCombo = SPECIAL_COMBOS[comboKey1] || SPECIAL_COMBOS[comboKey2] || null

  // 같은 카드
  const isSameCard = card1.id === card2.id

  // 케미 분석 - 가장 높은 합산 속성 기반
  const combined = {
    passion: a1.passion + a2.passion,
    stability: a1.stability + a2.stability,
    communication: a1.communication + a2.communication,
    growth: a1.growth + a2.growth,
  }
  const maxKey = Object.entries(combined).sort((a, b) => b[1] - a[1])[0][0]
  const minKey = Object.entries(combined).sort((a, b) => a[1] - b[1])[0][0]
  const range = combined[maxKey] - combined[minKey]

  let chemistryType = 'balanced'
  if (range <= 4) chemistryType = 'balanced'
  else if (maxKey === 'passion') chemistryType = 'highPassion'
  else if (maxKey === 'stability') chemistryType = 'highStability'
  else if (maxKey === 'communication') chemistryType = 'highCommunication'
  else if (maxKey === 'growth') chemistryType = 'highGrowth'

  if (score < 50) chemistryType = 'lowMatch'

  const chemistryLines = CHEMISTRY_TEMPLATES[chemistryType]
  const chemistry = chemistryLines[(card1.id.charCodeAt(0) + card2.id.charCodeAt(0)) % chemistryLines.length]

  // 조언 생성
  const advice = []
  const caution = []

  if (score >= 70) {
    advice.push('좋은 에너지를 유지하기 위해 서로에게 감사하는 마음을 표현하세요.')
    advice.push('자연스러운 흐름을 믿되, 당연하게 여기지 않는 것이 중요해요.')
    caution.push('좋은 관계도 노력 없이 유지되지는 않아요. 소통을 게을리하지 마세요.')
    caution.push('서로에 대한 기대가 높아질 수 있어요. 상대를 있는 그대로 바라보세요.')
  } else if (score >= 50) {
    advice.push('서로의 다름을 인정하는 것이 첫 번째 단계예요.')
    advice.push('작은 것부터 맞춰가보세요. 작은 성공이 큰 변화를 만들어요.')
    caution.push('상대를 바꾸려 하기보다 이해하려는 자세가 필요해요.')
    caution.push('기대와 현실의 차이에 실망하지 마세요. 모든 관계는 시간이 필요해요.')
  } else {
    advice.push('지금은 서로를 이해하는 데 집중하세요. 결과를 서두르지 마세요.')
    advice.push('이 관계에서 배울 수 있는 것에 집중하면 더 나은 방향을 찾을 수 있어요.')
    caution.push('억지로 맞추려 하면 서로 지칠 수 있어요. 자연스러운 흐름도 중요해요.')
    caution.push('상대의 입장에서 한 번 더 생각해보세요. 다른 시각이 열릴 수 있어요.')
  }

  // 감정 흐름
  const emotionFlow = []
  if (specialCombo) {
    emotionFlow.push(`"${specialCombo.label}" - ${specialCombo.desc}`)
  }
  if (isSameCard) {
    emotionFlow.push('같은 카드가 나왔어요. 거울처럼 서로를 비추는 관계예요. 공감은 깊지만, 같은 약점도 공유할 수 있어요.')
  }
  emotionFlow.push(chemistry)

  const attrLabels = { passion: '열정', stability: '안정', communication: '소통', growth: '성장' }
  emotionFlow.push(`두 사람의 가장 강한 에너지는 "${attrLabels[maxKey]}"이에요. 이것이 관계의 중심축이 될 거예요.`)

  if (score >= 70) {
    emotionFlow.push('전체적으로 서로를 끌어당기는 좋은 기류가 흐르고 있어요.')
  } else if (score >= 50) {
    emotionFlow.push('서로 다른 부분이 있지만, 그만큼 서로에게 배울 것도 많은 관계예요.')
  } else {
    emotionFlow.push('지금은 에너지가 엇갈리는 흐름이지만, 이해의 폭을 넓히면 달라질 수 있어요.')
  }

  return {
    score,
    scoreLabel: tier.label,
    scoreSummary: tier.summary,
    energy1,
    energy2,
    emotionFlow,
    advice,
    caution,
    specialCombo,
    isSameCard,
    chemistryType,
  }
}
