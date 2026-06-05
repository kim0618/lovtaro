/**
 * 연애 스타일 심리테스트 설정.
 *
 * 엔진(TestPage.vue)이 이 데이터를 읽어 구동한다. 새 테스트는 같은 스키마로
 * 파일 하나를 더 만들고 tests/index.js에 등록하면 된다.
 *
 * 채점 방식: 각 답변의 type에 1점씩 누적, 최고점 type이 결과(동점 시 results 선언 순서 우선).
 * 결과 카드는 메이저 아르카나에 매핑 (getCardById + getCardImage로 표시).
 */
export default {
  slug: 'love-style',
  title: '내 연애 스타일은?',
  subtitle: '8개의 질문으로 알아보는 나의 연애 타로 유형',
  // useHead / prerender 메타
  metaTitle: '연애 스타일 테스트 - 내 연애 타로 유형은? | Lovtaro',
  metaDescription: '8개의 질문으로 알아보는 나의 연애 스타일. 끌리는 답을 고르면 당신을 닮은 타로 카드와 연애 성향을 풀어드려요. 무료 연애 심리테스트, Lovtaro.',
  // trackEvent reading_type / 공유 라벨
  shareLabel: '연애 스타일',
  readings: ['love', 'today'],
  intro: {
    lead: '연애할 때 당신은 어떤 사람인가요? 끌리는 답을 직감으로 골라보세요. 8개의 질문이 끝나면 당신을 닮은 타로 카드와 연애 스타일을 풀어드릴게요.',
    points: [
      { label: '8개 질문', text: '맞고 틀린 답은 없어요. 더 끌리는 쪽을 고르면 돼요.' },
      { label: '나의 타로 유형', text: '6가지 연애 스타일 중 당신을 닮은 카드를 만나요.' },
      { label: '공유하기', text: '결과를 친구와 나누고, 우리의 스타일을 비교해보세요.' },
    ],
    startLabel: '시작하기',
    startNote: '마음이 편한 곳에서, 떠오르는 대로 골라보세요.',
  },

  questions: [
    {
      id: 'q1',
      text: '마음에 드는 사람이 생겼어요. 가장 먼저 드는 마음은?',
      answers: [
        { text: '자꾸 생각나고 마음이 빠르게 커져요', type: 'romantic' },
        { text: '망설이지 않고 먼저 다가가고 싶어요', type: 'passionate' },
        { text: '둘이 함께할 장면을 상상하며 설레요', type: 'dreamy' },
        { text: '그 사람이 뭘 좋아할지부터 떠올려요', type: 'devoted' },
        { text: '평소처럼 지내며 자연스럽게 둬요', type: 'independent' },
        { text: '정말 좋은 사람인지 천천히 지켜봐요', type: 'cautious' },
      ],
    },
    {
      id: 'q2',
      text: '좋아하는 사람에게 연락이 왔어요. 나는?',
      answers: [
        { text: '답장 내용을 몇 번이고 곱씹어 읽어요', type: 'romantic' },
        { text: '바로 답하고 다음에 만날 약속을 잡아요', type: 'passionate' },
        { text: '메시지 속 숨은 마음을 헤아려봐요', type: 'dreamy' },
        { text: '상대가 뭘 원하는지 먼저 살펴요', type: 'devoted' },
        { text: '내 리듬대로 편하게 답해요', type: 'independent' },
        { text: '괜히 들뜨지 않게 마음을 다잡아요', type: 'cautious' },
      ],
    },
    {
      id: 'q3',
      text: '함께 보낼 데이트를 정한다면?',
      answers: [
        { text: '둘만의 추억이 될 특별한 곳', type: 'romantic' },
        { text: '가보고 싶었던 곳으로 바로 출발', type: 'passionate' },
        { text: '분위기 좋고 감성이 흐르는 곳', type: 'dreamy' },
        { text: '상대가 좋아할 만한 곳으로', type: 'devoted' },
        { text: '서로 부담 없이 편한 곳', type: 'independent' },
        { text: '검증된, 실패 없는 곳으로', type: 'cautious' },
      ],
    },
    {
      id: 'q4',
      text: '상대의 사소한 변화가 느껴질 때, 나는?',
      answers: [
        { text: '무슨 일 있나 마음이 자꾸 쓰여요', type: 'romantic' },
        { text: '바로 직접 물어봐요', type: 'passionate' },
        { text: '내 직감을 믿고 가만히 살펴요', type: 'dreamy' },
        { text: '힘든 일인가 싶어 챙겨주고 싶어요', type: 'devoted' },
        { text: '내 페이스를 지키며 지켜봐요', type: 'independent' },
        { text: '섣불리 해석하지 않고 기다려요', type: 'cautious' },
      ],
    },
    {
      id: 'q5',
      text: '연애에서 가장 중요하게 생각하는 건?',
      answers: [
        { text: '서로를 향한 깊고 진한 마음', type: 'romantic' },
        { text: '솔직하고 뜨거운 표현', type: 'passionate' },
        { text: '함께일 때의 감정과 분위기', type: 'dreamy' },
        { text: '서로를 돌보고 아끼는 마음', type: 'devoted' },
        { text: '각자의 삶을 존중하는 거리', type: 'independent' },
        { text: '흔들리지 않는 안정감과 신뢰', type: 'cautious' },
      ],
    },
    {
      id: 'q6',
      text: '좋아하는 사람과 다툰 뒤, 나는?',
      answers: [
        { text: '풀릴 때까지 마음이 무거워요', type: 'romantic' },
        { text: '바로 대화로 풀려고 해요', type: 'passionate' },
        { text: '상대의 기분부터 살피게 돼요', type: 'dreamy' },
        { text: '내가 먼저 마음을 헤아려 다가가요', type: 'devoted' },
        { text: '시간을 두고 각자 정리하는 편이에요', type: 'independent' },
        { text: '감정이 가라앉은 뒤 차분히 이야기해요', type: 'cautious' },
      ],
    },
    {
      id: 'q7',
      text: '내 마음을 표현하는 방식에 가까운 건?',
      answers: [
        { text: '온 마음을 담아 진심을 전해요', type: 'romantic' },
        { text: '직접 말로, 솔직하게', type: 'passionate' },
        { text: '분위기와 작은 행동으로', type: 'dreamy' },
        { text: '상대를 위한 정성과 챙김으로', type: 'devoted' },
        { text: '담백하게, 부담스럽지 않게', type: 'independent' },
        { text: '신중하게 때를 살펴서', type: 'cautious' },
      ],
    },
    {
      id: 'q8',
      text: '좋아하는 사람과의 미래를 그릴 때, 나는?',
      answers: [
        { text: '둘이 함께하는 모든 순간을 떠올려요', type: 'romantic' },
        { text: '지금 이 설렘에 더 집중해요', type: 'passionate' },
        { text: '영화 같은 로맨틱한 장면을 그려요', type: 'dreamy' },
        { text: '서로를 보살피며 함께 나이 드는 모습', type: 'devoted' },
        { text: '내 삶도 지키며 함께하는 그림', type: 'independent' },
        { text: '현실적으로 차근차근 그려봐요', type: 'cautious' },
      ],
    },
  ],

  // "나랑 잘 맞는 유형" 매칭 (공유 이미지용)
  matches: {
    romantic: 'devoted',
    passionate: 'independent',
    dreamy: 'cautious',
    devoted: 'romantic',
    independent: 'passionate',
    cautious: 'dreamy',
  },

  // 결과 유형 (선언 순서 = 동점 시 우선순위)
  results: {
    romantic: {
      label: '몰입형 로맨티스트',
      cardId: 'lovers',
      tagline: '사랑에 빠지면 온 마음을 다하는 당신',
      emotionTags: ['깊은 몰입', '진심', '애틋함'],
      body: '한번 마음을 주면 그 사람에게 온전히 빠져드는 사람이에요. 사랑의 감정을 깊고 진하게 느끼고, 상대에게 진심을 다하는 따뜻함이 당신의 가장 큰 매력이에요. 연인 카드처럼, 당신의 연애는 두 사람이 서로를 향해 마음을 여는 순간에 가장 빛나요.',
      advice: '마음을 다하는 만큼, 그 마음을 나에게도 조금 나눠주세요. 내가 단단할 때 사랑도 더 오래 따뜻하게 머물러요.',
    },
    passionate: {
      label: '열정 직진러',
      cardId: 'chariot',
      tagline: '끌리면 망설이지 않고 다가가는 당신',
      emotionTags: ['솔직함', '추진력', '뜨거움'],
      body: '마음이 향하는 곳으로 주저 없이 나아가는 사람이에요. 감정을 숨기기보다 솔직하게 표현하고, 관계를 능동적으로 이끌어가는 힘이 있어요. 전차 카드처럼, 당신은 원하는 방향으로 관계를 움직여가는 추진력을 가졌어요.',
      advice: '앞으로 나아가는 만큼, 가끔은 상대의 속도도 살펴주세요. 함께 맞춰가는 박자가 설렘을 더 오래 이어줘요.',
    },
    dreamy: {
      label: '감성 몽상가',
      cardId: 'moon',
      tagline: '분위기와 감정으로 사랑을 느끼는 당신',
      emotionTags: ['직관', '감수성', '낭만'],
      body: '말로 다 설명되지 않는 감정과 분위기를 섬세하게 느끼는 사람이에요. 상대의 작은 표정과 공기의 결까지 읽어내는 직관이 당신의 무기예요. 달 카드처럼, 당신의 연애는 깊고 신비로운 감정의 흐름 속에서 피어나요.',
      advice: '느낌이 풍부한 만큼, 가끔은 직접 물어보세요. 상상 속 마음과 상대의 진짜 마음을 맞춰볼 때 관계가 더 선명해져요.',
    },
    devoted: {
      label: '헌신적 보살핌러',
      cardId: 'empress',
      tagline: '아낌없이 마음을 주는 따뜻한 당신',
      emotionTags: ['다정함', '배려', '돌봄'],
      body: '사랑하는 사람을 돌보고 챙기는 데서 행복을 느끼는 사람이에요. 상대가 편안하도록 먼저 마음을 쓰는 다정함이 당신을 특별하게 만들어요. 여황제 카드처럼, 당신은 관계를 풍요롭고 따뜻하게 채우는 사랑을 줘요.',
      advice: '주는 사랑이 클수록, 받는 것도 자연스럽게 허락해주세요. 사랑은 한 방향이 아니라 오갈 때 가장 깊어져요.',
    },
    independent: {
      label: '마이페이스 자유인',
      cardId: 'fool',
      tagline: '나를 지키며 사랑하는 균형 잡힌 당신',
      emotionTags: ['자유로움', '솔직함', '여유'],
      body: '사랑에 빠져도 나만의 색과 리듬을 잃지 않는 사람이에요. 서로의 공간을 존중하고, 가볍고 편안한 관계를 만들어가는 여유가 당신의 매력이에요. 바보 카드처럼, 당신은 어디에도 얽매이지 않는 자유로운 마음으로 사랑을 시작해요.',
      advice: '편안한 거리를 지키면서도, 가끔은 한 발 더 다가가 보세요. 마음을 보여주는 순간 관계가 한층 가까워져요.',
    },
    cautious: {
      label: '신중한 진심러',
      cardId: 'emperor',
      tagline: '천천히, 그러나 깊고 단단하게 사랑하는 당신',
      emotionTags: ['진중함', '신뢰', '안정감'],
      body: '쉽게 마음을 열지 않지만, 한번 열면 깊고 오래 가는 사람이에요. 충동보다 신뢰를 쌓아가며 관계를 단단하게 만드는 진중함이 당신의 힘이에요. 황제 카드처럼, 당신은 흔들리지 않는 안정감 위에 사랑을 세워가요.',
      advice: '신중함은 큰 강점이에요. 다만 마음이 확인됐다면, 그 진심을 조금 더 일찍 표현해도 괜찮아요.',
    },
  },
}
