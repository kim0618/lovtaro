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
    '첫 만남부터 뭔가 달랐던 느낌, 이 카드 조합이 그걸 말해주고 있어요.',
  ],
  highStability: [
    '함께 있으면 편안하고 안정감을 느끼는 관계예요. 오래 갈 수 있는 기반이 있어요.',
    '서로에게 안식처가 될 수 있는 관계예요. 신뢰가 이 관계의 핵심이에요.',
    '흔들리는 날에도 옆에 있으면 괜찮아지는 에너지예요. 그게 이 조합의 힘이에요.',
  ],
  highCommunication: [
    '서로의 마음을 읽는 능력이 뛰어난 조합이에요. 말하지 않아도 통하는 순간이 많을 거예요.',
    '대화가 잘 통하고 서로를 이해하는 속도가 빠른 관계예요.',
    '같은 것을 보고 같은 걸 느끼는 순간이 많을 조합이에요. 그 교감이 이 관계를 특별하게 만들어요.',
  ],
  highGrowth: [
    '함께하면 서로가 더 나은 사람이 되는 관계예요. 성장을 촉진하는 아름다운 만남이에요.',
    '이 관계를 통해 두 사람 모두 한 단계 성장할 수 있어요.',
    '서로가 서로의 거울이 되는 조합이에요. 불편할 수도 있지만, 그만큼 깊이가 생겨요.',
  ],
  balanced: [
    '열정, 안정, 소통, 성장이 고르게 어우러진 관계예요. 균형 잡힌 사랑이 가능해요.',
    '어느 하나에 치우치지 않은 건강한 에너지가 흐르고 있어요.',
    '극단적이지 않아서 오히려 오래가는 조합이에요. 일상 속에서 자연스럽게 깊어지는 관계예요.',
  ],
  lowMatch: [
    '서로 다른 파장을 가지고 있어요. 하지만 다름이 반드시 나쁜 것은 아니에요.',
    '맞춰가는 과정이 필요하지만, 그 과정 자체가 관계를 깊게 만들 수 있어요.',
    '지금은 템포가 잘 맞지 않는 흐름이에요. 서두르기보다 상대의 리듬을 먼저 느껴보세요.',
  ],
}

// ── 카드 조합 서사 (두 카드가 만날 때 만들어지는 이야기) ──
const NARRATIVE_BY_CATEGORY = {
  // 열정 강한 조합
  highPassion_high: '두 사람이 만나면 공기가 달라지는 느낌이에요. 강렬한 끌림 뒤에는 서로를 향한 진짜 감정이 있어요. 이 에너지를 조급하게 소진하지 않는 것이 중요해요. 불꽃은 오래 타오를수록 아름다운 법이니까요.',
  highPassion_mid: '열정적인 끌림이 있지만, 그 온도 차이가 때로 상처가 될 수 있어요. 한쪽이 더 뜨겁게 타오를 때, 상대가 그 열기를 받아낼 준비가 되어 있는지 확인하는 것이 필요해요.',
  highPassion_low: '서로에게 끌리는 마음은 분명히 있어요. 하지만 지금 그 에너지를 어떻게 다루느냐가 이 관계의 방향을 결정할 거예요. 열정만으로는 관계를 유지하기 어려워요.',
  // 안정 강한 조합
  highStability_high: '함께 있는 것이 자연스럽고, 억지로 맞추지 않아도 편안한 관계예요. 이런 안정감은 쉽게 얻어지는 것이 아니에요. 지금 이 관계가 얼마나 소중한지 기억하세요.',
  highStability_mid: '안정을 원하는 마음은 같지만, 그 방식이 조금 다를 수 있어요. 한 사람의 안정이 다른 사람에게는 답답함으로 느껴질 수도 있어요. 서로의 기준을 이야기해 보세요.',
  highStability_low: '안정적인 기반을 만들고 싶지만 지금은 아직 그 토대가 약한 흐름이에요. 조급하지 않게, 한 발씩 신뢰를 쌓아가는 것이 이 관계를 위한 가장 현명한 방법이에요.',
  // 소통 강한 조합
  highCommunication_high: '말하지 않아도 통하고, 말했을 때 더 깊어지는 관계예요. 이 조합에서 소통은 단순한 대화가 아니라 서로를 알아가는 방식이에요. 이 연결을 소중히 다루세요.',
  highCommunication_mid: '소통하려는 마음은 있지만, 타이밍이나 방식이 엇갈릴 수 있어요. 말하고 싶은 것보다 듣고 싶은 것이 무엇인지 먼저 생각해 보면 더 가까워질 수 있어요.',
  highCommunication_low: '서로의 언어가 달라서 오해가 생기기 쉬운 흐름이에요. 틀린 게 아니라 다른 거예요. 상대의 표현 방식을 이해하려는 노력이 이 관계의 가장 큰 열쇠예요.',
  // 성장 강한 조합
  highGrowth_high: '이 만남은 단순한 연애가 아니라 서로를 더 나은 사람으로 만드는 여정이에요. 때로는 불편하고 도전적인 순간이 있겠지만, 그게 바로 이 관계가 특별한 이유예요.',
  highGrowth_mid: '함께하면 성장할 수 있지만, 그 과정이 항상 편하지는 않을 수 있어요. 서로를 자극하는 에너지가 때로는 마찰로 느껴질 수 있어요. 그 불편함이 성장의 신호임을 기억하세요.',
  highGrowth_low: '이 관계에서 배울 수 있는 것이 분명히 있어요. 지금 당장은 힘들게 느껴지더라도, 이 만남이 당신에게 무엇을 가르쳐주려 하는지 생각해 보세요.',
  // 균형 조합
  balanced_high: '화려하지 않아도 든든하고, 뜨겁지 않아도 따뜻한 관계예요. 이런 균형 잡힌 에너지가 흐르는 관계는 오래 갈 수 있는 힘이 있어요. 일상 속에서 천천히 깊어지는 사랑이에요.',
  balanced_mid: '어느 한쪽으로 치우치지 않는 에너지가 흐르고 있어요. 지금은 방향을 정하는 시간이에요. 서로가 이 관계에서 원하는 것이 무엇인지 솔직하게 나눠보세요.',
  balanced_low: '지금 두 사람 사이에는 균형을 찾으려는 시도가 필요한 시기예요. 어느 한쪽이 더 많이 애쓰고 있다면, 그 불균형을 먼저 알아차리는 것이 중요해요.',
  // 저조합
  lowMatch_any: '지금 이 순간 두 사람의 에너지가 잘 맞지 않는 흐름이에요. 하지만 타로는 현재의 흐름을 읽는 것이지, 미래를 단정하지 않아요. 지금 이 관계에서 할 수 있는 가장 작은 한 가지를 생각해 보세요.',
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

  if (score >= 80) {
    advice.push('좋은 에너지를 유지하기 위해 서로에게 감사하는 마음을 표현하세요.')
    advice.push('자연스러운 흐름을 믿되, 당연하게 여기지 않는 것이 중요해요.')
    advice.push('지금 이 설렘을 기억해 두세요. 나중에 관계가 익숙해질 때 꺼내볼 수 있어요.')
    caution.push('좋은 관계도 노력 없이 유지되지는 않아요. 소통을 게을리하지 마세요.')
    caution.push('서로에 대한 기대가 높아질 수 있어요. 상대를 있는 그대로 바라보세요.')
    caution.push('너무 빠르게 가까워지려 하면 오히려 부담이 될 수 있어요. 적당한 거리도 관계를 지켜주는 힘이에요.')
  } else if (score >= 60) {
    advice.push('서로의 다름을 인정하는 것이 첫 번째 단계예요.')
    advice.push('작은 것부터 맞춰가보세요. 작은 성공이 큰 변화를 만들어요.')
    advice.push('상대가 편하게 느끼는 방식으로 마음을 표현해 보세요. 진심은 방식에 따라 더 잘 전달돼요.')
    caution.push('상대를 바꾸려 하기보다 이해하려는 자세가 필요해요.')
    caution.push('기대와 현실의 차이에 실망하지 마세요. 모든 관계는 시간이 필요해요.')
    caution.push('감정을 참고 혼자 해결하려 하면 상대는 알 수 없어요. 표현하는 연습이 필요해요.')
  } else {
    advice.push('지금은 서로를 이해하는 데 집중하세요. 결과를 서두르지 마세요.')
    advice.push('이 관계에서 배울 수 있는 것에 집중하면 더 나은 방향을 찾을 수 있어요.')
    advice.push('지금 당장 결론을 내리지 않아도 돼요. 조금 더 지켜보는 시간이 필요할 수 있어요.')
    caution.push('억지로 맞추려 하면 서로 지칠 수 있어요. 자연스러운 흐름도 중요해요.')
    caution.push('상대의 입장에서 한 번 더 생각해보세요. 다른 시각이 열릴 수 있어요.')
    caution.push('지금의 어려움이 이 관계의 전부가 아니에요. 한 단면만 보고 판단하지 마세요.')
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
  const minAttrLabels = { passion: '열정', stability: '안정감', communication: '소통', growth: '성장' }
  emotionFlow.push(`두 사람의 가장 강한 에너지는 "${attrLabels[maxKey]}"이에요. 이것이 관계의 중심축이 될 거예요.`)
  if (maxKey !== minKey && combined[minKey] < 12) {
    emotionFlow.push(`반면 "${minAttrLabels[minKey]}" 부분은 조금 더 의식적으로 채워가면 좋아요. 약점을 알고 있다는 것 자체가 이미 강점이에요.`)
  }

  if (score >= 70) {
    emotionFlow.push('전체적으로 서로를 끌어당기는 좋은 기류가 흐르고 있어요.')
  } else if (score >= 50) {
    emotionFlow.push('서로 다른 부분이 있지만, 그만큼 서로에게 배울 것도 많은 관계예요.')
  } else {
    emotionFlow.push('지금은 에너지가 엇갈리는 흐름이지만, 이해의 폭을 넓히면 달라질 수 있어요.')
  }

  // 두 카드가 함께 만들어내는 서사
  let narrativeKey
  if (score < 50) {
    narrativeKey = 'lowMatch_any'
  } else {
    const tier2 = score >= 70 ? 'high' : score >= 60 ? 'mid' : 'low'
    narrativeKey = `${chemistryType}_${tier2}`
  }
  const spreadNarrative = NARRATIVE_BY_CATEGORY[narrativeKey] || NARRATIVE_BY_CATEGORY['balanced_mid']

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
    spreadNarrative,
  }
}
