/**
 * 카드별 SEO 메타 오버라이드
 *
 * 기본값은 prerender.mjs / CardDetailPage.vue의 공통 템플릿
 * (`{name}({nameEn}) 타로 카드 의미 - 정방향 역방향 연애 해석 | Lovtaro`).
 * 79장이 같은 패턴이라 네이버 검색결과에서 차별성이 없어 CTR이 1%대에 머물던 문제를
 * 고노출·저CTR 카드부터 개별 카피로 교체한다.
 *
 * 키가 없는 카드는 그대로 기본 템플릿을 쓴다.
 * 같은 페이지를 다시 손볼 때는 최소 4주 텀(메타 변경 쿨다운)을 둔다.
 *
 * 2026-06-01 1차: 네이버 서치어드바이저 기준 노출 300+·CTR 1~1.5% 6장.
 */
export const CARD_SEO_OVERRIDES = {
  // 노출 782 · CTR 1.3% — "타로 킹오브판타컬스의미", "킹 오브 펜타클 연애운"
  'king-of-pentacles': {
    title: '펜타클의 킹(King of Pentacles) 타로 의미 - 연애운과 상대 속마음',
    description:
      '펜타클의 킹이 연애 리딩에 나왔다면? 정방향과 역방향 의미, 든든하고 진중한 상대의 마음과 관계의 방향, 연애운 해석을 정리했어요. 무료 타로 카드 의미.',
  },
  // 노출 484 · CTR 1.2%
  empress: {
    title: '여황제(The Empress) 타로 의미 - 연애운·정방향 역방향 해석',
    description:
      '여황제 카드가 연애에서 뜻하는 것. 정방향과 역방향 의미, 사랑이 무르익는 흐름과 상대의 마음, 돌봄과 균형의 신호까지. 여황제 타로 연애운 해석을 담았어요.',
  },
  // 노출 460 · CTR 1.1%
  hierophant: {
    title: '교황(The Hierophant) 타로 의미 - 연애운과 관계의 진지함',
    description:
      '교황 카드가 연애 리딩에 나왔다면? 정방향과 역방향 의미, 진지한 관계와 약속의 신호, 상대 속마음을 읽는 법까지. 교황 타로 연애운 해석.',
  },
  // 노출 458 · CTR 1.1%
  'four-of-pentacles': {
    title: '펜타클의 4(Four of Pentacles) 타로 의미 - 연애운·속마음',
    description:
      '펜타클의 4가 연애에서 가리키는 것. 정방향과 역방향 의미, 마음을 쉽게 열지 못하는 상태와 불안·집착의 신호를 읽는 법. 무료 타로 연애 해석.',
  },
  // 노출 388 · CTR 1.3% — "완드6" 78노출
  'six-of-wands': {
    title: '완드의 6(Six of Wands) 타로 의미 - 연애운·재회 해석',
    description:
      '완드의 6이 연애와 재회 리딩에 나왔다면? 정방향과 역방향 의미, 관계에서의 인정과 자신감, 재회 흐름을 읽는 법. 완드 6 타로 연애운 해석.',
  },
  // 노출 330 · CTR 1.5% — "the high priestess 역방향"
  priestess: {
    title: '여사제(The High Priestess) 타로 의미 - 연애운·상대 속마음',
    description:
      '여사제 카드가 연애에서 뜻하는 것. 정방향과 역방향 의미, 아직 드러나지 않은 상대의 속마음과 직관이 가리키는 관계의 방향까지. 여사제 타로 연애 해석.',
  },
}

export function getCardSeoOverride(id) {
  return CARD_SEO_OVERRIDES[id] || null
}
