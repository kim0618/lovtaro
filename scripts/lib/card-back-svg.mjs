/**
 * 러브타로 사이트 실사용 카드 뒷면 SVG
 *
 * 소스: src/components/draw/TarotCard.vue (lines 69-166)
 * 배경: CSS .tarot-card__back (line 299)
 *
 * 이 모듈은 사이트에서 실제 카드 뽑기 시 보이는 카드 뒷면 디자인을
 * 콘텐츠 생성 스크립트에서 동일하게 사용하기 위한 공유 모듈이다.
 *
 * 절대 수정 금지:
 * - SVG 내부 요소를 변경하지 마라
 * - 색상, 문양, 비율을 바꾸지 마라
 * - 사이트 원본과 다른 디자인으로 대체하지 마라
 */

/**
 * 사이트 실사용 카드 뒷면 SVG defs (gradient 정의)
 * SVG <defs> 안에 한 번만 포함해야 한다.
 */
export function siteCardBackDefs() {
  return `
    <linearGradient id="siteCardBg" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#162444"/>
      <stop offset="50%" stop-color="#101A32"/>
      <stop offset="100%" stop-color="#0A1024"/>
    </linearGradient>`
}

/**
 * 사이트 실사용 카드 뒷면 SVG를 지정된 위치와 크기로 렌더링
 *
 * 원본 viewBox: 0 0 120 198
 * 카드 비율: 120:198 = 1:1.65
 *
 * @param {number} cx - 카드 중심 X 좌표
 * @param {number} cy - 카드 중심 Y 좌표
 * @param {number} scale - 배율 (1 = 120x198px)
 */
export function siteCardBackSvg(cx, cy, scale = 1) {
  const halfW = 60 * scale
  const halfH = 99 * scale
  const x = cx - halfW
  const y = cy - halfH

  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <!-- 카드 배경 (TarotCard.vue CSS .tarot-card__back) -->
      <rect x="0" y="0" width="120" height="198" rx="8" ry="8"
            fill="url(#siteCardBg)" stroke="rgba(200,169,110,0.35)" stroke-width="1"/>

      <!-- ═══ 사이트 실사용 카드 뒷면 SVG (TarotCard.vue lines 69-166) ═══ -->

      <!-- 외곽 장식 테두리 -->
      <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
      <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>

      <!-- 코너 장식 (4모서리) -->
      <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
      <path d="M13 27 Q13 13 27 13" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>
      <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
      <path d="M107 27 Q107 13 93 13" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>
      <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
      <path d="M13 171 Q13 185 27 185" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>
      <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
      <path d="M107 171 Q107 185 93 185" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.4" fill="none"/>

      <!-- 수직 중심축 -->
      <line x1="60" y1="42" x2="60" y2="156" stroke="#C8A96E" stroke-opacity="0.06" stroke-width="0.4"/>

      <!-- 상단 달 위상: ☽ ● ☾ -->
      <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="42.5" cy="30.5" r="4" fill="#0A1020"/>
      <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
      <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="77.5" cy="30.5" r="4" fill="#0A1020"/>

      <!-- 상단에서 중심으로 연결선 -->
      <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
      <path d="M60 50 L62 53 L60 56 L58 53Z" fill="#C8A96E" fill-opacity="0.3"/>
      <path d="M60 60 L61 62 L60 64 L59 62Z" fill="#C8A96E" fill-opacity="0.2"/>

      <!-- 중심 만다라: 외부 원 -->
      <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>

      <!-- 방사형 눈금 (8방향) -->
      <line x1="60" y1="70" x2="60" y2="74" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="60" y1="124" x2="60" y2="128" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="31" y1="99" x2="35" y2="99" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="85" y1="99" x2="89" y2="99" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="39.5" y1="78.5" x2="42.3" y2="81.3" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
      <line x1="80.5" y1="78.5" x2="77.7" y2="81.3" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
      <line x1="39.5" y1="119.5" x2="42.3" y2="116.7" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
      <line x1="80.5" y1="119.5" x2="77.7" y2="116.7" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>

      <!-- 다이아몬드 (마름모) -->
      <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>

      <!-- 내부 원 -->
      <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>

      <!-- 다이아몬드-원 교차점 장식 -->
      <circle cx="60" cy="70" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
      <circle cx="89" cy="99" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
      <circle cx="60" cy="128" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
      <circle cx="31" cy="99" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>

      <!-- ═══ 중심: 올-시잉 아이 ═══ -->
      <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z"
            stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
      <!-- 눈 위 장식선 -->
      <path d="M45 92 C50 86 55 83 60 83" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.4" fill="none"/>
      <path d="M75 92 C70 86 65 83 60 83" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.4" fill="none"/>
      <!-- 홍채 -->
      <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
      <!-- 동공 -->
      <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
      <!-- 동공 하이라이트 -->
      <circle cx="58.5" cy="97.5" r="1" fill="#0A1020" fill-opacity="0.35"/>

      <!-- 중심에서 하단으로 연결선 -->
      <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
      <path d="M60 134 L61 136 L60 138 L59 136Z" fill="#C8A96E" fill-opacity="0.2"/>
      <path d="M60 144 L62 147 L60 150 L58 147Z" fill="#C8A96E" fill-opacity="0.3"/>

      <!-- 하단 달 위상 (상단 반전): ☾ ● ☽ -->
      <circle cx="40" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="37.5" cy="167.5" r="4" fill="#0A1020"/>
      <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
      <circle cx="80" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="82.5" cy="167.5" r="4" fill="#0A1020"/>

      <!-- 좌우 장식 점 -->
      <circle cx="21" cy="58" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="21" cy="99" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="21" cy="140" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="99" cy="58" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="99" cy="99" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="99" cy="140" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>

      <!-- 흩뿌린 별 -->
      <circle cx="28" cy="46" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="92" cy="46" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="25" cy="78" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="95" cy="120" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="28" cy="152" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="92" cy="152" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="35" cy="70" r="0.4" fill="#C8A96E" fill-opacity="0.15"/>
      <circle cx="85" cy="128" r="0.4" fill="#C8A96E" fill-opacity="0.15"/>
    </g>`
}

/**
 * 카드 원본 크기 정보 (비율 계산용)
 * 원본: 120 x 198 (1:1.65)
 */
export const CARD_WIDTH = 120
export const CARD_HEIGHT = 198
export const CARD_RATIO = CARD_HEIGHT / CARD_WIDTH  // 1.65
