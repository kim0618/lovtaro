/**
 * 이상형 타로 심리테스트 설정 ("내 운명의 상대는?").
 *
 * love-style.js와 같은 엔진/채점 방식(argmax). 단, 결과는 "나"가 아니라
 * "나에게 어울리는 운명의 상대(이상형)"를 가리킨다. matches는 없음(결과 자체가 상대형).
 */
export default {
  slug: 'ideal-type',
  title: '내 운명의 상대는?',
  subtitle: '8개의 질문으로 알아보는 나의 이상형 타로',
  metaTitle: '이상형 타로 - 내 운명의 상대는? | Lovtaro',
  metaDescription: '8개의 질문으로 알아보는 나의 운명의 상대. 끌리는 답을 고르면 당신에게 어울리는 이상형과 그를 닮은 타로 카드를 풀어드려요. 무료 이상형 타로 테스트, Lovtaro.',
  shareLabel: '이상형 타로',
  readings: ['mind', 'contact'],
  intro: {
    lead: '당신에게 운명처럼 다가올 사람은 어떤 모습일까요? 끌리는 답을 직감으로 골라보세요. 8개의 질문이 끝나면 당신의 이상형과 그를 닮은 타로 카드를 풀어드릴게요.',
    points: [
      { label: '8개 질문', text: '맞고 틀린 답은 없어요. 더 끌리는 쪽을 고르면 돼요.' },
      { label: '내 운명의 상대', text: '6가지 이상형 중 당신에게 어울리는 사람을 만나요.' },
      { label: '공유하기', text: '결과를 친구와 나누고, 서로의 이상형을 맞혀보세요.' },
    ],
    startLabel: '시작하기',
    startNote: '마음 가는 대로 편하게 골라보세요.',
  },

  questions: [
    {
      id: 'q1',
      text: '마음이 가는 사람의 첫인상은?',
      answers: [
        { text: '환하게 잘 웃는 사람', type: 'sunny' },
        { text: '듬직하고 안정감 있는 사람', type: 'pillar' },
        { text: '어디에도 얽매이지 않는 자유로운 사람', type: 'adventurer' },
        { text: '조용하고 생각이 깊어 보이는 사람', type: 'thinker' },
        { text: '눈빛에 열정이 느껴지는 사람', type: 'passionate' },
        { text: '쉽게 파악되지 않는 신비로운 사람', type: 'mystic' },
      ],
    },
    {
      id: 'q2',
      text: '데이트 중 가장 설레는 순간은?',
      answers: [
        { text: '나를 보며 다정하게 웃어줄 때', type: 'sunny' },
        { text: '든든하게 챙겨주고 이끌어줄 때', type: 'pillar' },
        { text: '즉흥적으로 멋진 곳에 데려갈 때', type: 'adventurer' },
        { text: '깊은 대화가 잘 통할 때', type: 'thinker' },
        { text: '나에게 적극적으로 다가올 때', type: 'passionate' },
        { text: '알 수 없는 매력에 빠져들 때', type: 'mystic' },
      ],
    },
    {
      id: 'q3',
      text: '연인에게 가장 듣고 싶은 말은?',
      answers: [
        { text: '"너랑 있으면 정말 행복해"', type: 'sunny' },
        { text: '"내가 늘 곁에 있을게"', type: 'pillar' },
        { text: '"우리 새로운 거 해보자"', type: 'adventurer' },
        { text: '"너의 생각이 궁금해"', type: 'thinker' },
        { text: '"지금 너밖에 안 보여"', type: 'passionate' },
        { text: '"넌 정말 특별한 사람이야"', type: 'mystic' },
      ],
    },
    {
      id: 'q4',
      text: '이런 데이트가 더 좋아요',
      answers: [
        { text: '햇살 좋은 날 공원 산책', type: 'sunny' },
        { text: '분위기 좋은 곳에서 안정적인 저녁', type: 'pillar' },
        { text: '계획 없이 떠나는 즉흥 여행', type: 'adventurer' },
        { text: '조용한 카페에서 나누는 깊은 대화', type: 'thinker' },
        { text: '둘만의 뜨겁고 진한 시간', type: 'passionate' },
        { text: '색다르고 묘한 분위기의 장소', type: 'mystic' },
      ],
    },
    {
      id: 'q5',
      text: '상대의 어떤 모습에 반하나요?',
      answers: [
        { text: '늘 밝고 긍정적인 에너지', type: 'sunny' },
        { text: '흔들리지 않는 책임감', type: 'pillar' },
        { text: '틀에 박히지 않은 자유로움', type: 'adventurer' },
        { text: '사려 깊고 통찰력 있는 면', type: 'thinker' },
        { text: '솔직하고 적극적인 표현', type: 'passionate' },
        { text: '쉽게 보이지 않는 깊이', type: 'mystic' },
      ],
    },
    {
      id: 'q6',
      text: '힘들 때 곁에 있어줬으면 하는 사람은?',
      answers: [
        { text: '환하게 웃으며 기운을 주는 사람', type: 'sunny' },
        { text: '묵묵히 곁을 지켜주는 사람', type: 'pillar' },
        { text: '훌쩍 기분전환 시켜주는 사람', type: 'adventurer' },
        { text: '차분히 이야기 들어주는 사람', type: 'thinker' },
        { text: '말없이 꼭 안아주는 사람', type: 'passionate' },
        { text: '깊이 이해해주는 사람', type: 'mystic' },
      ],
    },
    {
      id: 'q7',
      text: '어떤 연애를 하고 싶나요?',
      answers: [
        { text: '매일이 따뜻하고 즐거운 연애', type: 'sunny' },
        { text: '믿음직하고 안정적인 연애', type: 'pillar' },
        { text: '늘 새롭고 설레는 연애', type: 'adventurer' },
        { text: '서로를 깊이 알아가는 연애', type: 'thinker' },
        { text: '불꽃처럼 뜨거운 연애', type: 'passionate' },
        { text: '신비롭고 강렬하게 빠져드는 연애', type: 'mystic' },
      ],
    },
    {
      id: 'q8',
      text: '운명의 상대를 한 단어로 표현한다면?',
      answers: [
        { text: '햇살', type: 'sunny' },
        { text: '바위', type: 'pillar' },
        { text: '바람', type: 'adventurer' },
        { text: '호수', type: 'thinker' },
        { text: '불꽃', type: 'passionate' },
        { text: '달빛', type: 'mystic' },
      ],
    },
  ],

  // 운명의 상대 6유형 (선언 순서 = 동점 시 우선순위)
  results: {
    sunny: {
      label: '다정한 햇살형',
      cardId: 'sun',
      tagline: '곁에 있으면 마음이 환해지는 사람',
      emotionTags: ['따뜻함', '긍정', '다정'],
      body: '당신의 운명의 상대는 햇살 같은 사람이에요. 밝은 에너지로 당신의 하루를 환하게 밝혀주고, 다정함으로 마음을 포근하게 채워주죠. 함께 있는 것만으로 웃음이 많아지는, 태양 카드처럼 따뜻한 사랑을 줄 사람이에요.',
      advice: '이런 사람은 솔직하게 마음을 표현하는 당신에게 더 활짝 다가와요. 먼저 웃어주세요.',
    },
    pillar: {
      label: '듬직한 기둥형',
      cardId: 'emperor',
      tagline: '흔들릴 때 기댈 수 있는 단단한 사람',
      emotionTags: ['안정감', '책임감', '신뢰'],
      body: '당신의 운명의 상대는 든든한 기둥 같은 사람이에요. 어떤 상황에서도 흔들리지 않고 당신을 지켜주며, 말보다 행동으로 믿음을 보여주죠. 곁에 있으면 마음이 놓이는, 황제 카드처럼 단단한 사랑을 줄 사람이에요.',
      advice: '이런 사람은 진심과 꾸준함에 마음을 열어요. 조급해하지 말고 신뢰를 쌓아가세요.',
    },
    adventurer: {
      label: '자유로운 모험가형',
      cardId: 'fool',
      tagline: '매일을 설레는 모험으로 만드는 사람',
      emotionTags: ['자유', '설렘', '생기'],
      body: '당신의 운명의 상대는 바람처럼 자유로운 사람이에요. 틀에 갇히지 않고 늘 새로운 설렘을 선물하며, 함께 있으면 세상이 넓어지는 기분을 주죠. 매일이 모험 같은, 바보 카드처럼 자유롭고 순수한 사랑을 줄 사람이에요.',
      advice: '이런 사람은 같이 즐길 줄 아는 사람에게 끌려요. 함께 새로운 걸 시도해보세요.',
    },
    thinker: {
      label: '깊은 사색가형',
      cardId: 'hermit',
      tagline: '마음 깊은 곳까지 이해해주는 사람',
      emotionTags: ['깊이', '사려', '통찰'],
      body: '당신의 운명의 상대는 호수처럼 깊은 사람이에요. 말 한마디에도 당신의 마음을 헤아리고, 조용하지만 단단한 애정으로 곁을 지키죠. 서로의 내면을 천천히 알아가는, 은둔자 카드처럼 깊고 진실한 사랑을 줄 사람이에요.',
      advice: '이런 사람은 진솔한 대화에 마음을 열어요. 솔직한 이야기를 먼저 건네보세요.',
    },
    passionate: {
      label: '열정의 직진형',
      cardId: 'chariot',
      tagline: '망설임 없이 당신에게 직진하는 사람',
      emotionTags: ['열정', '솔직함', '추진력'],
      body: '당신의 운명의 상대는 불꽃처럼 뜨거운 사람이에요. 마음을 숨기지 않고 당신에게 솔직하게 다가오며, 관계를 적극적으로 이끌어가죠. 설렘이 쉽게 식지 않는, 전차 카드처럼 열정적인 사랑을 줄 사람이에요.',
      advice: '이런 사람에겐 당신의 마음도 솔직하게 보여주세요. 그 솔직함에 더 빠져들 거예요.',
    },
    mystic: {
      label: '신비로운 매력형',
      cardId: 'moon',
      tagline: '알수록 더 빠져드는 신비로운 사람',
      emotionTags: ['신비', '매력', '깊은 끌림'],
      body: '당신의 운명의 상대는 달빛처럼 신비로운 사람이에요. 쉽게 파악되지 않는 깊이로 당신을 끌어당기고, 알아갈수록 더 빠져들게 만들죠. 강렬하고 묘한 끌림으로 이어지는, 달 카드처럼 신비로운 사랑을 줄 사람이에요.',
      advice: '이런 사람은 서두르지 않는 당신에게 천천히 마음을 열어요. 분위기를 함께 즐겨보세요.',
    },
  },
}
