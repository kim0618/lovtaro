/**
 * 에너지 아키타입 scene01 테스트
 * 얼음불꽃(블루) / 달빛(바이올렛) / 앰버불꽃(오렌지) 3색 극명 대비
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const outputPath = resolve(rootDir, 'content-output/2026-04-19_sun/scene01-energy-test.png')
const W = 1080, H = 1920

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function genStars(count, seed, xMin, xMax, yMin, yMax, bright = false) {
  const rand = mulberry32(seed)
  const colors = bright
    ? ['#ffe9b3', '#f4d99f', '#e8d48b', '#ffffff', '#fff5d4']
    : ['#e8d48b', '#c9a84c', '#d4b85c', '#b89858', '#8f7a4a']
  let stars = ''
  for (let i = 0; i < count; i++) {
    const x = xMin + rand() * (xMax - xMin)
    const y = yMin + rand() * (yMax - yMin)
    const s = bright ? (1 + rand() * 2.5) : (0.5 + rand() * 1.8)
    const op = bright ? (0.5 + rand() * 0.5) : (0.25 + rand() * 0.55)
    const color = colors[Math.floor(rand() * colors.length)]
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="${color}" opacity="${op.toFixed(2)}"/>`
  }
  return stars
}

// 에너지별 팔레트
const ENERGY = {
  ice: {
    bgTop: '#0b1f52',
    bgBot: '#050d22',
    glow: 'rgba(100,200,255,0.9)',
    borderGlow: 'rgba(140,210,255,0.85)',
    moonFill: '#050d22',
    numColor: '#9de4ff',
    // 눈결정 (6방향 라인)
    symbol: (cx, cy, sc) => {
      const x = cx + 60 * sc, y = cy - 99 * sc + 57 * sc
      const r = 5 * sc, op = 0.72, sw = 0.7 * sc, col = '#9de4ff'
      const pts = [0, 60, 120].map(a => {
        const rad = a * Math.PI / 180
        return `<line x1="${(x + Math.cos(rad) * r).toFixed(1)}" y1="${(y + Math.sin(rad) * r).toFixed(1)}"
                      x2="${(x - Math.cos(rad) * r).toFixed(1)}" y2="${(y - Math.sin(rad) * r).toFixed(1)}"
                      stroke="${col}" stroke-opacity="${op}" stroke-width="${sw}"/>`
      }).join('')
      const dots = [0, 60, 120, 180, 240, 300].map(a => {
        const rad = a * Math.PI / 180
        return `<circle cx="${(x + Math.cos(rad) * r).toFixed(1)}" cy="${(y + Math.sin(rad) * r).toFixed(1)}"
                        r="${(0.9 * sc).toFixed(1)}" fill="${col}" fill-opacity="${op}"/>`
      }).join('')
      return pts + dots
    },
  },
  moon: {
    bgTop: '#220a52',
    bgBot: '#0d0524',
    glow: 'rgba(180,140,255,0.9)',
    borderGlow: 'rgba(190,155,255,0.85)',
    moonFill: '#0d0524',
    numColor: '#c9b0ff',
    // 초승달
    symbol: (cx, cy, sc) => {
      const x = cx + 60 * sc, y = cy - 99 * sc + 57 * sc
      const r = 5 * sc, col = '#c9b0ff', mf = '#0d0524'
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"
                      stroke="${col}" stroke-opacity="0.7" stroke-width="${(0.7*sc).toFixed(1)}" fill="none"/>
              <circle cx="${(x + r*0.55).toFixed(1)}" cy="${(y - r*0.2).toFixed(1)}" r="${(r*0.85).toFixed(1)}"
                      fill="${mf}"/>`
    },
  },
  amber: {
    bgTop: '#6b2800',   // 밝힘
    bgBot: '#320e00',
    glow: 'rgba(255,140,40,0.9)',
    borderGlow: 'rgba(255,165,60,0.85)',
    moonFill: '#320e00',
    numColor: '#ffb870',
    // 삼각 불꽃
    symbol: (cx, cy, sc) => {
      const x = cx + 60 * sc, y = cy - 99 * sc + 57 * sc
      const h = 6 * sc, hw = 5 * sc, col = '#ffb870'
      return `<path d="M${x.toFixed(1)} ${(y - h).toFixed(1)} L${(x + hw).toFixed(1)} ${(y + h * 0.6).toFixed(1)} L${(x - hw).toFixed(1)} ${(y + h * 0.6).toFixed(1)} Z"
                    stroke="${col}" stroke-opacity="0.75" stroke-width="${(0.75*sc).toFixed(1)}"
                    fill="${col}" fill-opacity="0.12"/>
              <line x1="${x.toFixed(1)}" y1="${(y - h * 0.3).toFixed(1)}"
                    x2="${x.toFixed(1)}" y2="${(y + h * 0.55).toFixed(1)}"
                    stroke="${col}" stroke-opacity="0.45" stroke-width="${(0.5*sc).toFixed(1)}"/>`
    },
  },
}

function energyCardDefs() {
  return Object.entries(ENERGY).map(([key, e]) => `
    <linearGradient id="eBg_${key}" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%"   stop-color="${e.bgTop}"/>
      <stop offset="100%" stop-color="${e.bgBot}"/>
    </linearGradient>
    <radialGradient id="eGlow_${key}" cx="50%" cy="50%" r="55%">
      <stop offset="0%"   stop-color="${e.borderGlow}"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>`).join('')
}

function energyCardSvg(cx, cy, scale, scheme) {
  const e = ENERGY[scheme]
  const halfW = 60 * scale
  const halfH = 99 * scale
  const x = cx - halfW
  const y = cy - halfH
  const mf = e.moonFill

  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <!-- 배경 -->
      <rect x="0" y="0" width="120" height="198" rx="8" ry="8" fill="url(#eBg_${scheme})"/>
      <!-- 어둠 오버레이 (신비감) -->
      <rect x="0" y="0" width="120" height="198" rx="8" ry="8" fill="rgba(0,0,0,0.32)"/>
      <!-- 골드 테두리 -->
      <rect x="0" y="0" width="120" height="198" rx="8" ry="8" fill="none" stroke="rgba(200,169,110,0.85)" stroke-width="1.5"/>
      <!-- 에너지 글로우 테두리 -->
      <rect x="-2" y="-2" width="124" height="202" rx="10" ry="10" fill="none" stroke="${e.borderGlow}" stroke-width="2.5" opacity="0.7"/>

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
      <line x1="60" y1="42" x2="60" y2="156" stroke="#C8A96E" stroke-opacity="0.08" stroke-width="0.4"/>

      <!-- 상단 달 위상 -->
      <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="42.5" cy="30.5" r="4" fill="${mf}"/>
      <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
      <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
      <circle cx="77.5" cy="30.5" r="4" fill="${mf}"/>

      <!-- 연결선 -->
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
    </g>
    <!-- 에너지 심볼 -->
    ${e.symbol(cx, cy, scale)}
  `
}

function defs() {
  const stars1 = genStars(260, 5, 0, W, 0, H, false)
  const stars2 = genStars(70, 16, 0, W, 0, H, true)

  return { stars1, stars2 }
}

async function generate() {
  const cardScale = 2.5
  const CARD_W = 120, CARD_H = 198
  const cardPixelW = CARD_W * cardScale
  const cardPixelH = CARD_H * cardScale
  const cardGap = 50
  const totalWidth = cardPixelW * 3 + cardGap * 2
  const startCX = (W - totalWidth) / 2 + cardPixelW / 2
  const cardY = 980
  const numberY = cardY + cardPixelH / 2 + 58

  const cx1 = startCX
  const cx2 = startCX + cardPixelW + cardGap
  const cx3 = startCX + (cardPixelW + cardGap) * 2

  const { stars1, stars2 } = defs()

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="cosmicBg" cx="50%" cy="45%" r="85%">
        <stop offset="0%"   stop-color="#1a0f38"/>
        <stop offset="35%"  stop-color="#140b2c"/>
        <stop offset="75%"  stop-color="#0c0820"/>
        <stop offset="100%" stop-color="#06040f"/>
      </radialGradient>
      <radialGradient id="neb2" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="rgba(140,70,130,0.18)"/>
        <stop offset="100%" stop-color="rgba(130,60,120,0)"/>
      </radialGradient>
      <radialGradient id="neb3" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="rgba(210,150,90,0.14)"/>
        <stop offset="100%" stop-color="rgba(200,140,80,0)"/>
      </radialGradient>
      <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="rgba(255,235,180,0.18)"/>
        <stop offset="100%" stop-color="rgba(255,235,180,0)"/>
      </radialGradient>
      <mask id="moonMaskSmall">
        <rect x="0" y="0" width="${W}" height="${H}" fill="black"/>
        <circle cx="115" cy="200" r="34" fill="white"/>
        <circle cx="138" cy="192" r="34" fill="black"/>
      </mask>
      <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="numGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="18" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
      <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="55"/>
      </filter>
      ${energyCardDefs()}
    </defs>

    <!-- 배경 -->
    <rect width="${W}" height="${H}" fill="url(#cosmicBg)"/>
    <ellipse cx="900" cy="1700" rx="500" ry="350" fill="url(#neb3)"/>
    <ellipse cx="180" cy="1550" rx="400" ry="300" fill="url(#neb2)"/>
    ${stars1}
    ${stars2}
    <circle cx="125" cy="205" r="80" fill="url(#moonGlow)"/>
    <rect x="70" y="150" width="120" height="120" fill="rgba(248,230,185,0.9)" mask="url(#moonMaskSmall)"/>

    <!-- 훅 텍스트 -->
    <g filter="url(#softGlow)">
      <text x="540" y="380" text-anchor="middle"
            font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif"
            font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">그 사람 마음 속에서</text>
      <text x="540" y="455" text-anchor="middle"
            font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif"
            font-size="48" fill="#F4F8FF" letter-spacing="3" font-weight="300">나는 어떤 존재일까?</text>
    </g>

    <!-- 에너지 글로우 (카드 뒤 배경 번짐) -->
    <ellipse cx="${cx1}" cy="${cardY}" rx="${cardPixelW * 0.85}" ry="${cardPixelH * 0.55}"
             fill="url(#eGlow_ice)"   filter="url(#glowBlur)" opacity="0.8"/>
    <ellipse cx="${cx2}" cy="${cardY}" rx="${cardPixelW * 0.85}" ry="${cardPixelH * 0.55}"
             fill="url(#eGlow_moon)"  filter="url(#glowBlur)" opacity="0.8"/>
    <ellipse cx="${cx3}" cy="${cardY}" rx="${cardPixelW * 0.85}" ry="${cardPixelH * 0.55}"
             fill="url(#eGlow_amber)" filter="url(#glowBlur)" opacity="0.8"/>

    <!-- 3장 에너지 카드 -->
    <g filter="url(#cardShadow)">
      ${energyCardSvg(cx1, cardY, cardScale, 'ice')}
      ${energyCardSvg(cx2, cardY, cardScale, 'moon')}
      ${energyCardSvg(cx3, cardY, cardScale, 'amber')}
    </g>

    <!-- 번호 (에너지 색상 매칭) -->
    <g filter="url(#numGlow)">
      <text x="${cx1}" y="${numberY}" text-anchor="middle"
            font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif"
            font-size="42" fill="${ENERGY.ice.numColor}" font-weight="600">1번</text>
      <text x="${cx2}" y="${numberY}" text-anchor="middle"
            font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif"
            font-size="42" fill="${ENERGY.moon.numColor}" font-weight="600">2번</text>
      <text x="${cx3}" y="${numberY}" text-anchor="middle"
            font-family="'Noto Sans KR','Apple SD Gothic Neo',NanumSquare,sans-serif"
            font-size="42" fill="${ENERGY.amber.numColor}" font-weight="600">3번</text>
    </g>

    <text x="540" y="1640" text-anchor="middle"
          font-family="sans-serif" font-size="30" fill="rgba(244,248,255,0.6)"
          letter-spacing="5" font-weight="300">직감으로 골라보세요</text>

    <text x="540" y="1860" text-anchor="middle"
          font-family="sans-serif" font-size="24" fill="rgba(232,212,139,0.45)"
          letter-spacing="4">@lovtarot_</text>
  </svg>`

  const buf = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()
  writeFileSync(outputPath, buf)
  console.log(`✅ ${outputPath} (${(buf.length / 1024).toFixed(0)} KB)`)
}

generate().catch(err => { console.error('❌', err); process.exit(1) })
