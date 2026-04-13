/**
 * 오늘의 카드 에너지에 따른 내일 힌트 문구
 * 오늘 뽑은 카드의 energy 값 기준으로 내일에 대한 기대감을 줌
 */

const TEASERS = {
  positive: [
    '이 따뜻한 기류, 내일은 어떤 모습으로 이어질까요',
    '오늘의 빛이 내일에도 닿을지 모릅니다',
    '좋은 에너지는 하루로 끝나지 않아요',
    '내일은 또 다른 카드가 기다리고 있어요',
    '이 흐름의 다음 장이 궁금하지 않나요',
  ],
  neutral: [
    '내일은 흐름이 조금 달라질 수도 있어요',
    '오늘의 고요함 뒤에 어떤 파동이 올까요',
    '같은 하늘 아래, 내일의 카드는 다른 이야기를 할지도',
    '내일의 기류가 어떤 색일지 궁금하지 않나요',
    '흐름은 늘 움직이고 있어요 - 내일 다시 읽어봐요',
  ],
  challenging: [
    '내일은 분명 다른 에너지가 찾아올 거예요',
    '어려운 카드 뒤에는 늘 전환이 따라옵니다',
    '오늘의 메시지를 안고, 내일 새 카드를 만나봐요',
    '지금의 흐름이 내일 어떻게 바뀔지 확인해보세요',
    '내일의 카드가 위로가 되어줄지도 몰라요',
  ],
}

/**
 * 오늘 카드의 에너지를 기반으로 내일 힌트 문구 반환
 * 같은 날에는 같은 문구가 나오도록 날짜 기반 인덱스 사용
 */
export function getTomorrowTeaser(energy) {
  const pool = TEASERS[energy] || TEASERS.neutral
  const d = new Date()
  const dayIndex = (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate())
  return pool[dayIndex % pool.length]
}
