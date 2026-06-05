/**
 * 짝사랑 심리테스트 설정 ("짝사랑할 때 나는?").
 *
 * love-style.js와 같은 엔진/채점(argmax). 결과는 짝사랑할 때의 나(유형)를
 * 메이저 아르카나에 매핑. 네이버 검색 2위 키워드 "짝사랑 테스트" 수요 흡수.
 */
export default {
  slug: 'crush',
  title: '짝사랑할 때 나는?',
  subtitle: '8개의 질문으로 알아보는 나의 짝사랑 유형',
  metaTitle: '짝사랑 테스트 - 짝사랑할 때 나는? | Lovtaro',
  metaDescription: '8개의 질문으로 알아보는 나의 짝사랑 유형. 끌리는 답을 고르면 짝사랑할 때의 나와 닮은 타로 카드를 풀어드려요. 무료 짝사랑 심리테스트, Lovtaro.',
  shareLabel: '짝사랑',
  readings: ['mind', 'yesno'],
  intro: {
    lead: '짝사랑할 때 당신은 어떤 사람인가요? 끌리는 답을 직감으로 골라보세요. 8개의 질문이 끝나면 짝사랑하는 당신과 닮은 타로 카드를 풀어드릴게요.',
    points: [
      { label: '8개 질문', text: '맞고 틀린 답은 없어요. 더 끌리는 쪽을 고르면 돼요.' },
      { label: '내 짝사랑 유형', text: '6가지 유형 중 짝사랑할 때의 나를 만나요.' },
      { label: '공유하기', text: '결과를 친구와 나누고, 서로의 짝사랑을 알아보세요.' },
    ],
    startLabel: '시작하기',
    startNote: '그 사람을 떠올리며, 마음 가는 대로 골라보세요.',
  },

  questions: [
    {
      id: 'q1',
      text: '짝사랑이 시작되면 나는?',
      answers: [
        { text: '혼자 마음을 키우며 애틋하게 앓아요', type: 'pining' },
        { text: '어떻게든 먼저 다가가려 해요', type: 'bold' },
        { text: '둘의 미래를 상상하며 설레요', type: 'dreamer' },
        { text: '일단 멀리서 차분히 지켜봐요', type: 'observer' },
        { text: '티 안 나게 평소처럼 행동해요', type: 'cool' },
        { text: '자연스럽게 호감을 표현해요', type: 'honest' },
      ],
    },
    {
      id: 'q2',
      text: '그 사람을 마주 보면?',
      answers: [
        { text: '가슴이 아릿하고 애틋해져요', type: 'pining' },
        { text: '먼저 말을 걸고 싶어요', type: 'bold' },
        { text: '머릿속에 온갖 장면이 떠올라요', type: 'dreamer' },
        { text: '표정 하나하나를 살피게 돼요', type: 'observer' },
        { text: '괜히 더 무심한 척해요', type: 'cool' },
        { text: '밝게 웃으며 다가가요', type: 'honest' },
      ],
    },
    {
      id: 'q3',
      text: '그 사람의 SNS를 보면?',
      answers: [
        { text: '좋아요도 못 누르고 한참 봐요', type: 'pining' },
        { text: '댓글이나 메시지를 남겨요', type: 'bold' },
        { text: '게시물로 상상의 나래를 펴요', type: 'dreamer' },
        { text: '조용히 동향만 살펴요', type: 'observer' },
        { text: '본 티 안 내려 빠르게 넘겨요', type: 'cool' },
        { text: '자연스럽게 반응을 남겨요', type: 'honest' },
      ],
    },
    {
      id: 'q4',
      text: '둘이 우연히 마주치면?',
      answers: [
        { text: '심장이 터질 것 같아 말을 못 해요', type: 'pining' },
        { text: '이때다 싶어 말을 걸어요', type: 'bold' },
        { text: '이 순간을 오래 곱씹어요', type: 'dreamer' },
        { text: '어색하지 않게 적당히 인사해요', type: 'observer' },
        { text: '아무렇지 않은 척해요', type: 'cool' },
        { text: '반갑게 먼저 인사해요', type: 'honest' },
      ],
    },
    {
      id: 'q5',
      text: '친구가 "너 그 사람 좋아하지?" 물으면?',
      answers: [
        { text: '부정하지만 얼굴이 빨개져요', type: 'pining' },
        { text: '인정하고 조언을 구해요', type: 'bold' },
        { text: '"그냥 상상만 해" 하고 웃어요', type: 'dreamer' },
        { text: '"글쎄, 두고 봐야지" 해요', type: 'observer' },
        { text: '"아니야" 단호하게 부정해요', type: 'cool' },
        { text: '"응 맞아!" 솔직하게 말해요', type: 'honest' },
      ],
    },
    {
      id: 'q6',
      text: '고백을 떠올리면?',
      answers: [
        { text: '상상만 해도 가슴이 벅차요', type: 'pining' },
        { text: '타이밍만 보고 있어요', type: 'bold' },
        { text: '완벽한 고백 장면을 그려요', type: 'dreamer' },
        { text: '확신이 설 때까지 미뤄요', type: 'observer' },
        { text: '굳이 안 해도 된다고 생각해요', type: 'cool' },
        { text: '기회가 되면 바로 할 거예요', type: 'honest' },
      ],
    },
    {
      id: 'q7',
      text: '그 사람과 더 가까워지려면?',
      answers: [
        { text: '마음이 닿길 조용히 바라요', type: 'pining' },
        { text: '적극적으로 약속을 잡아요', type: 'bold' },
        { text: '운명처럼 이어지길 꿈꿔요', type: 'dreamer' },
        { text: '천천히 신뢰를 쌓아가요', type: 'observer' },
        { text: '티 안 나게 곁에 머물러요', type: 'cool' },
        { text: '솔직하게 호감을 보여요', type: 'honest' },
      ],
    },
    {
      id: 'q8',
      text: '내 짝사랑을 한 단어로 표현한다면?',
      answers: [
        { text: '그리움', type: 'pining' },
        { text: '돌진', type: 'bold' },
        { text: '설렘', type: 'dreamer' },
        { text: '기다림', type: 'observer' },
        { text: '비밀', type: 'cool' },
        { text: '햇살', type: 'honest' },
      ],
    },
  ],

  // 짝사랑 유형 6가지 (선언 순서 = 동점 시 우선순위)
  results: {
    pining: {
      label: '가슴앓이 순정파',
      cardId: 'moon',
      tagline: '혼자 마음을 키우며 애틋하게 앓는 당신',
      emotionTags: ['애틋함', '순정', '깊은 마음'],
      body: '당신은 짝사랑할 때 그 마음을 가슴 깊이 품고 혼자 애틋하게 앓는 사람이에요. 티 내지 않아도 누구보다 깊고 진한 감정을 느끼죠. 달 카드처럼, 당신의 짝사랑은 조용하지만 깊은 감정의 결을 따라 흘러요.',
      advice: '깊은 마음을 가끔은 작은 신호로 내비쳐보세요. 마음은 표현될 때 닿을 가능성이 생겨요.',
    },
    bold: {
      label: '직진 고백파',
      cardId: 'chariot',
      tagline: '망설임 없이 마음을 향해 나아가는 당신',
      emotionTags: ['적극성', '솔직함', '추진력'],
      body: '당신은 짝사랑이 시작되면 주저 없이 다가가 마음을 표현하는 사람이에요. 기다리기보다 직접 기회를 만들고 관계를 이끌어가죠. 전차 카드처럼, 당신의 짝사랑은 원하는 방향으로 힘차게 나아가요.',
      advice: '직진하는 만큼, 상대의 속도도 한 번씩 살펴주세요. 함께 맞추는 박자가 마음을 더 가깝게 해요.',
    },
    dreamer: {
      label: '설레는 상상파',
      cardId: 'star',
      tagline: '둘의 미래를 그리며 설레는 당신',
      emotionTags: ['낭만', '설렘', '희망'],
      body: '당신은 짝사랑할 때 그 사람과의 장면을 그리며 설렘으로 가득 차는 사람이에요. 작은 순간도 특별하게 느끼고, 희망찬 상상으로 마음을 키우죠. 별 카드처럼, 당신의 짝사랑은 반짝이는 설렘과 희망으로 빛나요.',
      advice: '상상이 풍부한 만큼, 가끔은 현실의 한 걸음도 내디뎌보세요. 설렘이 진짜가 되는 순간이 와요.',
    },
    observer: {
      label: '신중 관찰파',
      cardId: 'hermit',
      tagline: '천천히 지켜보며 마음을 다지는 당신',
      emotionTags: ['신중함', '관찰', '진중함'],
      body: '당신은 짝사랑할 때 서두르지 않고 그 사람을 차분히 알아가는 사람이에요. 확신이 설 때까지 신중하게 마음을 다지며 천천히 다가가죠. 은둔자 카드처럼, 당신의 짝사랑은 깊고 진중하게 무르익어요.',
      advice: '신중함은 큰 강점이에요. 다만 마음이 확인됐다면, 한 걸음은 조금 더 일찍 내디뎌도 좋아요.',
    },
    cool: {
      label: '쿨한 척 무심파',
      cardId: 'temperance',
      tagline: '티 안 내고 속으로만 마음을 품는 당신',
      emotionTags: ['절제', '은근함', '내유외강'],
      body: '당신은 짝사랑할 때 겉으로는 무심한 척하지만 속으로는 깊이 마음을 품는 사람이에요. 감정을 차분하게 다스리며 티 나지 않게 곁을 지키죠. 절제 카드처럼, 당신의 짝사랑은 고요한 겉모습 아래 단단한 마음을 품고 있어요.',
      advice: '감추는 만큼, 가끔은 작은 진심을 흘려보세요. 무심함만 보이면 상대는 마음을 모를 수 있어요.',
    },
    honest: {
      label: '솔직 표현파',
      cardId: 'sun',
      tagline: '밝고 솔직하게 호감을 보이는 당신',
      emotionTags: ['솔직함', '밝음', '다정'],
      body: '당신은 짝사랑할 때 마음을 숨기기보다 밝고 자연스럽게 호감을 드러내는 사람이에요. 함께 있으면 그 사람도 기분이 좋아지는 따뜻한 에너지를 주죠. 태양 카드처럼, 당신의 짝사랑은 환하고 솔직하게 빛나요.',
      advice: '솔직한 매력이 큰 무기예요. 그 밝음으로 다가가면 상대도 마음을 열기 쉬워요.',
    },
  },
}
