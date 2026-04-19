/**
 * 참여형 릴스 scene01 전용 컬러 variant 카드 뒷면
 *
 * card-back-svg.mjs(사이트 정본)와 별개로 참여형 3장 선택지 연출을 위한 카드 배경 변형 버전.
 * 장식 패턴/비율/골드 디테일은 정본과 동일. 카드 내부 배경(채도 있는 다크톤) + 별빛 팔레트만 scheme별로 다르게.
 *
 * 현재 스킴 7종: navy / indigo / plum / teal / rose / emerald / amber
 * 참여형 생성 시 pickRandomSchemes(3)로 랜덤 3개 픽
 */

const SCHEMES = {
  navy: {
    bgTop: '#0e2060', bgBot: '#050d30',
    darkOverlay: 'rgba(0,5,15,0.25)',
    border: 'rgba(200,169,110,0.85)',
    borderGlow: 'rgba(130,180,255,0.85)',
    moonFill: '#050d30',
    stars: ['#ffe8b0', '#d8d4f0', '#ffffff', '#e8e0f8'],
    accent: '#e8d48b',
    starSeed: 42,
  },
  indigo: {
    bgTop: '#24148a', bgBot: '#100a48',
    darkOverlay: 'rgba(5,3,20,0.25)',
    border: 'rgba(200,169,110,0.85)',
    borderGlow: 'rgba(180,160,255,0.85)',
    moonFill: '#100a48',
    stars: ['#c0b8f8', '#a0a8ff', '#b8c0ff', '#ffffff', '#d8d4ff'],
    accent: '#b8b0f0',
    starSeed: 55,
  },
  plum: {
    bgTop: '#4e0a68', bgBot: '#260532',
    darkOverlay: 'rgba(10,3,10,0.25)',
    border: 'rgba(200,169,110,0.85)',
    borderGlow: 'rgba(230,155,240,0.85)',
    moonFill: '#260532',
    stars: ['#ffd4b0', '#f0c0d8', '#ffc8d8', '#ffffff', '#ffe4c8'],
    accent: '#e0a8c8',
    starSeed: 88,
  },
  teal: {
    bgTop: '#0a4a5a', bgBot: '#042228',
    darkOverlay: 'rgba(0,10,12,0.25)',
    border: 'rgba(200,169,110,0.85)',
    borderGlow: 'rgba(110,220,220,0.85)',
    moonFill: '#042228',
    stars: ['#b8f0f0', '#a0e0e8', '#ffffff', '#d4f4f4'],
    accent: '#a8e0d8',
    starSeed: 103,
  },
  rose: {
    bgTop: '#701a40', bgBot: '#34081c',
    darkOverlay: 'rgba(15,3,8,0.25)',
    border: 'rgba(200,169,110,0.85)',
    borderGlow: 'rgba(255,170,190,0.85)',
    moonFill: '#34081c',
    stars: ['#ffd0d8', '#ffc0c8', '#ffffff', '#ffe4dc'],
    accent: '#f4a8b8',
    starSeed: 127,
  },
  emerald: {
    bgTop: '#0a5a38', bgBot: '#042a1a',
    darkOverlay: 'rgba(0,12,6,0.25)',
    border: 'rgba(200,169,110,0.85)',
    borderGlow: 'rgba(120,220,160,0.85)',
    moonFill: '#042a1a',
    stars: ['#c0ffd8', '#a0f0c0', '#ffffff', '#d4f4e0'],
    accent: '#a0e0b8',
    starSeed: 149,
  },
  amber: {
    bgTop: '#5a3008', bgBot: '#2a1604',
    darkOverlay: 'rgba(10,6,0,0.25)',
    border: 'rgba(200,169,110,0.85)',
    borderGlow: 'rgba(255,200,110,0.85)',
    moonFill: '#2a1604',
    stars: ['#ffe0a0', '#ffd088', '#ffffff', '#ffebc4'],
    accent: '#f0c070',
    starSeed: 163,
  },
}

export const SCHEME_KEYS = Object.keys(SCHEMES)

/** 중복 없이 랜덤 3개 (Fisher-Yates) */
export function pickRandomSchemes(count = 3) {
  const keys = [...SCHEME_KEYS]
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[keys[i], keys[j]] = [keys[j], keys[i]]
  }
  return keys.slice(0, count)
}

/** 숫자 라벨 색상 */
export function getSchemeAccent(scheme) {
  return SCHEMES[scheme]?.accent || '#e8d48b'
}

// 결정론적 별 위치 생성용 LCG 시드 랜덤
function cardRand(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

// 120×198 카드 좌표계 내 별 점들 (colors 배열로 색상 팔레트 지정)
function cardStarField(seed, count, colors) {
  const r = cardRand(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = r() * 120
    const y = r() * 198
    const sz = 0.2 + r() * 0.95
    const op = 0.35 + r() * 0.65
    const col = colors[Math.floor(r() * colors.length)]
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz.toFixed(2)}" fill="${col}" opacity="${op.toFixed(2)}"/>`
  }
  return out
}

// scheme별 카드 내부 배경 씬 — 모두 별밭, 팔레트만 다르게
function cardSceneContent(scheme) {
  const s = SCHEMES[scheme]
  if (!s) return ''
  return cardStarField(s.starSeed, 92, s.stars)
}

/**
 * SVG <defs> 안에 한 번만 포함
 */
export function colorCardBackDefs() {
  return Object.entries(SCHEMES).map(([key, s]) => `
    <linearGradient id="colorCardBg_${key}" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%"   stop-color="${s.bgTop}"/>
      <stop offset="100%" stop-color="${s.bgBot}"/>
    </linearGradient>
    <radialGradient id="colorCardGlow_${key}" cx="50%" cy="50%" r="55%">
      <stop offset="0%"   stop-color="${s.borderGlow}"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>`).join('')
}

/**
 * 컬러 variant 카드 뒷면 SVG
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} scale - 배율 (1 = 120x198px)
 * @param {'navy'|'indigo'|'plum'} scheme - 컬러 스킴
 */
export function colorCardBackSvg(cx, cy, scale = 1, scheme = 'navy') {
  const s = SCHEMES[scheme]
  const halfW = 60 * scale
  const halfH = 99 * scale
  const x = cx - halfW
  const y = cy - halfH
  const mf = s.moonFill  // 달 위상 마스킹용 fill (배경색과 동일해야 크레센트 효과)
  const bd = s.border

  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <!-- 어두운 베이스 배경 -->
      <rect x="0" y="0" width="120" height="198" rx="8" ry="8"
            fill="url(#colorCardBg_${scheme})"/>
      <!-- 카드 배경 씬 (별밭 / 성운 / 은하) -->
      ${cardSceneContent(scheme)}
      <!-- 신비감 복원 다크 오버레이 -->
      <rect x="0" y="0" width="120" height="198" rx="8" ry="8"
            fill="${s.darkOverlay}"/>
      <!-- 골드 테두리 -->
      <rect x="0" y="0" width="120" height="198" rx="8" ry="8"
            fill="none" stroke="${bd}" stroke-width="1.5"/>
      <!-- 컬러 글로우 테두리 (카드 외곽 발광) -->
      <rect x="-1.5" y="-1.5" width="123" height="201" rx="9.5" ry="9.5"
            fill="none" stroke="${s.borderGlow}" stroke-width="2" opacity="0.65"/>

      <!-- 외곽 장식 테두리 -->
      <rect x="4" y="4" width="112" height="190" rx="6" fill="none" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
      <rect x="9" y="9" width="102" height="180" rx="4" fill="none" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>

      <!-- 코너 장식 -->
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

      <!-- 상단 달 위상 -->
      <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="42.5" cy="30.5" r="4" fill="${mf}"/>
      <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
      <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="77.5" cy="30.5" r="4" fill="${mf}"/>

      <!-- 상단 연결선 -->
      <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
      <path d="M60 50 L62 53 L60 56 L58 53Z" fill="#C8A96E" fill-opacity="0.3"/>
      <path d="M60 60 L61 62 L60 64 L59 62Z" fill="#C8A96E" fill-opacity="0.2"/>

      <!-- 중심 만다라 -->
      <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
      <line x1="60" y1="70" x2="60" y2="74" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="60" y1="124" x2="60" y2="128" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="31" y1="99" x2="35" y2="99" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="85" y1="99" x2="89" y2="99" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
      <line x1="39.5" y1="78.5" x2="42.3" y2="81.3" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
      <line x1="80.5" y1="78.5" x2="77.7" y2="81.3" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
      <line x1="39.5" y1="119.5" x2="42.3" y2="116.7" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
      <line x1="80.5" y1="119.5" x2="77.7" y2="116.7" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>

      <!-- 다이아몬드 -->
      <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
      <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>
      <circle cx="60" cy="70" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
      <circle cx="89" cy="99" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
      <circle cx="60" cy="128" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
      <circle cx="31" cy="99" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>

      <!-- 올-시잉 아이 -->
      <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z"
            stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
      <path d="M45 92 C50 86 55 83 60 83" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.4" fill="none"/>
      <path d="M75 92 C70 86 65 83 60 83" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.4" fill="none"/>
      <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
      <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
      <circle cx="58.5" cy="97.5" r="1" fill="${mf}" fill-opacity="0.35"/>

      <!-- 하단 연결선 -->
      <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
      <path d="M60 134 L61 136 L60 138 L59 136Z" fill="#C8A96E" fill-opacity="0.2"/>
      <path d="M60 144 L62 147 L60 150 L58 147Z" fill="#C8A96E" fill-opacity="0.3"/>

      <!-- 하단 달 위상 -->
      <circle cx="40" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="37.5" cy="167.5" r="4" fill="${mf}"/>
      <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
      <circle cx="80" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="82.5" cy="167.5" r="4" fill="${mf}"/>

      <!-- 좌우 장식 점 -->
      <circle cx="21" cy="58"  r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="21" cy="99"  r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="21" cy="140" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="99" cy="58"  r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="99" cy="99"  r="0.8" fill="#C8A96E" fill-opacity="0.25"/>
      <circle cx="99" cy="140" r="0.8" fill="#C8A96E" fill-opacity="0.25"/>

      <!-- 흩뿌린 별 -->
      <circle cx="28" cy="46"  r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="92" cy="46"  r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="25" cy="78"  r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="95" cy="120" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="28" cy="152" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="92" cy="152" r="0.5" fill="#C8A96E" fill-opacity="0.2"/>
      <circle cx="35" cy="70"  r="0.4" fill="#C8A96E" fill-opacity="0.15"/>
      <circle cx="85" cy="128" r="0.4" fill="#C8A96E" fill-opacity="0.15"/>
    </g>`
}

export const CARD_WIDTH = 120
export const CARD_HEIGHT = 198
