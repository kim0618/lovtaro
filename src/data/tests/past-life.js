/**
 * 전생 연애 타로 심리테스트 설정 ("전생에 나는?").
 *
 * love-style.js와 같은 엔진/채점(argmax). 결과는 "전생의 나"와 그 사랑을
 * 메이저 아르카나에 매핑. 네이버 검색 1위 키워드 "전생 테스트" 수요 흡수.
 */
export default {
  slug: 'past-life',
  title: '전생에 나는?',
  subtitle: '8개의 질문으로 알아보는 나의 전생 연애 타로',
  metaTitle: '전생 테스트 - 전생에 나는 어떤 사랑을 했을까 | Lovtaro',
  metaDescription: '8개의 질문으로 알아보는 나의 전생. 끌리는 답을 고르면 전생의 나와 그 사랑을 닮은 타로 카드를 풀어드려요. 무료 전생 연애 타로 테스트, Lovtaro.',
  shareLabel: '전생 연애',
  readings: ['reunion', 'love'],
  intro: {
    lead: '전생의 당신은 어떤 사랑을 했을까요? 끌리는 답을 직감으로 골라보세요. 8개의 질문이 끝나면 전생의 당신과 그 사랑을 닮은 타로 카드를 풀어드릴게요.',
    points: [
      { label: '8개 질문', text: '맞고 틀린 답은 없어요. 더 끌리는 쪽을 고르면 돼요.' },
      { label: '전생의 나', text: '6가지 전생 중 당신의 지난 생을 만나요.' },
      { label: '공유하기', text: '결과를 친구와 나누고, 서로의 전생을 맞혀보세요.' },
    ],
    startLabel: '시작하기',
    startNote: '눈을 감고, 마음 가는 대로 골라보세요.',
  },

  questions: [
    {
      id: 'q1',
      text: '사람들 사이에서 나는?',
      answers: [
        { text: '자연스럽게 주목받는 사람', type: 'royal' },
        { text: '운명 같은 인연을 믿는 사람', type: 'fated' },
        { text: '어디에도 매이지 않는 사람', type: 'wanderer' },
        { text: '소중한 사람을 끝까지 지키는 사람', type: 'guardian' },
        { text: '직감이 잘 맞는 신비로운 사람', type: 'seer' },
        { text: '깊고 애틋한 감정을 품은 사람', type: 'tragic' },
      ],
    },
    {
      id: 'q2',
      text: '사랑에 빠지면 나는?',
      answers: [
        { text: '우아하게 마음을 표현해요', type: 'royal' },
        { text: '운명이라 느끼고 확신해요', type: 'fated' },
        { text: '자유롭게 마음 가는 대로 해요', type: 'wanderer' },
        { text: '헌신적으로 다 바쳐요', type: 'guardian' },
        { text: '상대의 마음을 먼저 알아채요', type: 'seer' },
        { text: '애틋하게 오래 마음에 담아요', type: 'tragic' },
      ],
    },
    {
      id: 'q3',
      text: '왠지 끌리는 장소는?',
      answers: [
        { text: '화려한 궁전의 무도회', type: 'royal' },
        { text: '운명처럼 마주친 골목', type: 'fated' },
        { text: '정처 없는 여행길', type: 'wanderer' },
        { text: '누군가를 지키는 성벽', type: 'guardian' },
        { text: '별이 쏟아지는 신전', type: 'seer' },
        { text: '달빛 비치는 호숫가', type: 'tragic' },
      ],
    },
    {
      id: 'q4',
      text: '내 사랑의 방식에 가까운 건?',
      answers: [
        { text: '품격 있고 진중하게', type: 'royal' },
        { text: '운명에 모든 걸 걸고', type: 'fated' },
        { text: '가볍고 자유롭게', type: 'wanderer' },
        { text: '묵묵히 헌신하며', type: 'guardian' },
        { text: '신비롭고 깊게', type: 'seer' },
        { text: '애절하고 절절하게', type: 'tragic' },
      ],
    },
    {
      id: 'q5',
      text: '사람들이 나를 보면 떠올릴 말은?',
      answers: [
        { text: '"기품 있다"', type: 'royal' },
        { text: '"운명적이다"', type: 'fated' },
        { text: '"자유롭다"', type: 'wanderer' },
        { text: '"든든하다"', type: 'guardian' },
        { text: '"신비롭다"', type: 'seer' },
        { text: '"애틋하다"', type: 'tragic' },
      ],
    },
    {
      id: 'q6',
      text: '전생의 내가 남겼을 물건은?',
      answers: [
        { text: '화려한 초상화', type: 'royal' },
        { text: '운명을 약속한 반지', type: 'fated' },
        { text: '여행을 적은 시집', type: 'wanderer' },
        { text: '지켜낸 이의 편지', type: 'guardian' },
        { text: '예언이 적힌 카드', type: 'seer' },
        { text: '부치지 못한 연애편지', type: 'tragic' },
      ],
    },
    {
      id: 'q7',
      text: '가장 두려운 것은?',
      answers: [
        { text: '품위를 잃는 것', type: 'royal' },
        { text: '운명을 놓치는 것', type: 'fated' },
        { text: '자유를 빼앗기는 것', type: 'wanderer' },
        { text: '지킬 사람을 잃는 것', type: 'guardian' },
        { text: '진실이 가려지는 것', type: 'seer' },
        { text: '사랑을 이루지 못하는 것', type: 'tragic' },
      ],
    },
    {
      id: 'q8',
      text: '내 사랑을 한 단어로 표현한다면?',
      answers: [
        { text: '왕관', type: 'royal' },
        { text: '운명', type: 'fated' },
        { text: '바람', type: 'wanderer' },
        { text: '방패', type: 'guardian' },
        { text: '별빛', type: 'seer' },
        { text: '달', type: 'tragic' },
      ],
    },
  ],

  // 전생의 나 6유형 (선언 순서 = 동점 시 우선순위)
  results: {
    royal: {
      label: '궁정의 연인',
      cardId: 'empress',
      tagline: '모두의 사랑을 받던 귀한 사람',
      emotionTags: ['기품', '매력', '풍요'],
      body: '전생의 당신은 궁정에서 모두의 시선을 받던 귀한 사람이었어요. 우아한 기품과 따뜻한 마음으로 많은 이의 사랑을 받았고, 사랑마저 품격 있게 가꿀 줄 알았죠. 여황제 카드처럼, 당신의 사랑은 풍요롭고 빛나는 것이었어요.',
      advice: '그 기품은 지금의 당신에게도 흘러요. 스스로를 귀하게 여기는 사람에게 사랑도 귀하게 와요.',
    },
    fated: {
      label: '운명적 재회의 인연',
      cardId: 'lovers',
      tagline: '운명처럼 만나 다시 이어진 사람',
      emotionTags: ['운명', '인연', '진심'],
      body: '전생의 당신은 운명 같은 사랑을 믿고 끝내 그 인연을 이뤄낸 사람이었어요. 수많은 생을 건너 다시 만나는 인연, 그 한 사람을 향한 진심이 당신의 전부였죠. 연인 카드처럼, 당신의 사랑은 운명으로 이어진 것이었어요.',
      advice: '운명을 믿는 마음은 지금도 당신을 이끌어요. 진심을 알아보는 사람을 만나게 될 거예요.',
    },
    wanderer: {
      label: '자유로운 방랑 시인',
      cardId: 'fool',
      tagline: '사랑을 노래하며 떠돌던 사람',
      emotionTags: ['자유', '낭만', '순수'],
      body: '전생의 당신은 어디에도 매이지 않고 사랑을 노래하며 떠돌던 시인이었어요. 가는 곳마다 설렘을 남기고, 순수한 마음으로 사랑을 자유롭게 누렸죠. 바보 카드처럼, 당신의 사랑은 얽매이지 않는 자유로운 것이었어요.',
      advice: '그 자유로운 영혼은 지금도 당신 안에 있어요. 함께 떠날 수 있는 사람과 가장 빛나요.',
    },
    guardian: {
      label: '헌신한 수호 기사',
      cardId: 'strength',
      tagline: '한 사람을 끝까지 지킨 사람',
      emotionTags: ['헌신', '용기', '신의'],
      body: '전생의 당신은 사랑하는 한 사람을 목숨 걸고 지킨 기사였어요. 화려한 말 대신 변하지 않는 행동으로 마음을 증명했고, 끝까지 곁을 지켰죠. 힘 카드처럼, 당신의 사랑은 용기와 헌신으로 단단한 것이었어요.',
      advice: '그 신의는 지금의 당신에게도 남아 있어요. 당신의 진심을 알아주는 사람을 만나세요.',
    },
    seer: {
      label: '신비로운 예언가',
      cardId: 'priestess',
      tagline: '사랑의 운명을 읽던 신비로운 사람',
      emotionTags: ['직관', '신비', '지혜'],
      body: '전생의 당신은 별과 카드로 사람들의 운명을 읽던 신비로운 예언가였어요. 깊은 직관으로 마음을 꿰뚫어 보았고, 사랑의 흐름마저 미리 느꼈죠. 여사제 카드처럼, 당신의 사랑은 신비롭고 깊은 것이었어요.',
      advice: '그 직관은 지금도 살아 있어요. 당신의 느낌을 믿으면 좋은 인연이 보일 거예요.',
    },
    tragic: {
      label: '비운의 명연인',
      cardId: 'moon',
      tagline: '이루지 못해 더 애틋했던 사람',
      emotionTags: ['애틋함', '그리움', '깊은 사랑'],
      body: '전생의 당신은 시대를 잘못 만나 이루지 못한 사랑을 품은 사람이었어요. 끝내 닿지 못했기에 더 애틋했고, 그 깊은 그리움이 당신을 더 빛나게 했죠. 달 카드처럼, 당신의 사랑은 애절하고 깊은 것이었어요.',
      advice: '그 애틋함은 깊은 사랑의 그릇이에요. 이번 생엔 꼭 닿을 수 있는 사람과 이어지길.',
    },
  },
}
