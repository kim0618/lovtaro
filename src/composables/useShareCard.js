/**
 * Canvas-based share card generator for tarot reading results.
 * Creates a premium portrait-oriented image suitable for Instagram sharing.
 */

const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
const FEED_WIDTH = 1080
const FEED_HEIGHT = 1350
const SQUARE_WIDTH = 1080
const SQUARE_HEIGHT = 1080
const DPR = 1

/**
 * Draw a rounded rectangle path (does not fill or stroke)
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Wrap text to fit within maxWidth, returning lines array
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split('')
  const lines = []
  let line = ''

  for (const char of words) {
    const testLine = line + char
    const { width } = ctx.measureText(testLine)
    if (width > maxWidth && line.length > 0) {
      lines.push(line)
      line = char
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * Generate share card for single-card reading
 * @param {Object} options
 * @param {string} options.readingType - e.g. "오늘의 연애 카드"
 * @param {string} options.cardName - Korean card name
 * @param {string} options.cardNameEn - English card name
 * @param {string} options.summary - Reading summary text
 * @param {string[]} options.emotionTags - Keyword tags
 * @returns {Promise<string>} Data URL of the generated image
 */
export async function generateSingleCardShareImage({ readingType, cardName, cardNameEn, summary, emotionTags = [], cardImage = '', reversed = false, format = 'story' }) {
  const W = format === 'square' ? SQUARE_WIDTH : format === 'feed' ? FEED_WIDTH : STORY_WIDTH
  const H = format === 'square' ? SQUARE_HEIGHT : format === 'feed' ? FEED_HEIGHT : STORY_HEIGHT
  // 카드 이미지 로드
  const img = cardImage
    ? await new Promise((resolve) => {
        const i = new Image()
        i.crossOrigin = 'anonymous'
        i.onload = () => resolve(i)
        i.onerror = () => resolve(null)
        i.src = cardImage
      })
    : null

  const canvas = document.createElement('canvas')
  canvas.width = W * DPR
  canvas.height = H * DPR
  const ctx = canvas.getContext('2d')
  ctx.scale(DPR, DPR)

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
  bgGrad.addColorStop(0, '#05070D')
  bgGrad.addColorStop(0.4, '#0A1020')
  bgGrad.addColorStop(1, '#05070D')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Ambient glow
  const glowGrad = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 400)
  glowGrad.addColorStop(0, 'rgba(45, 108, 223, 0.08)')
  glowGrad.addColorStop(0.5, 'rgba(77, 163, 255, 0.03)')
  glowGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 0, W, H)

  // Inner border frame
  ctx.strokeStyle = 'rgba(199, 215, 248, 0.08)'
  ctx.lineWidth = 1
  roundRect(ctx, 60, 60, W - 120, H - 120, 20)
  ctx.stroke()

  const lineGrad = ctx.createLinearGradient(200, 0, W - 200, 0)
  lineGrad.addColorStop(0, 'transparent')
  lineGrad.addColorStop(0.5, 'rgba(77, 163, 255, 0.3)')
  lineGrad.addColorStop(1, 'transparent')

  // Feed/Square: 좌측 카드 + 우측 텍스트 / Story: 위 텍스트 + 아래 카드
  const isFeed = format === 'feed' || format === 'square'
  const isSquare = format === 'square'

  if (isFeed) {
    // ── Feed/Square 레이아웃 ──
    const cardW = isSquare ? 300 : 380
    const cardH = isSquare ? 500 : 630
    const cardX = isSquare ? 80 : 100
    const cardY = (H - cardH) / 2

    // 카드 그리기
    _drawCardFrame(ctx, img, cardX, cardY, cardW, cardH, reversed)

    // 우측 텍스트 영역
    const textX = cardX + cardW + 60
    const textW = W - textX - 100
    ctx.textAlign = 'left'

    ctx.font = '300 24px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
    ctx.fillText(readingType, textX, cardY + 40)

    ctx.font = '300 64px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText(cardName, textX, cardY + 120)

    if (cardNameEn) {
      ctx.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.7)'
      ctx.fillText(cardNameEn, textX, cardY + 160)
    }

    // 구분선
    ctx.strokeStyle = 'rgba(77, 163, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(textX, cardY + 190)
    ctx.lineTo(textX + textW, cardY + 190)
    ctx.stroke()

    // 요약
    if (summary) {
      ctx.font = '400 28px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.85)'
      const lines = wrapText(ctx, summary, textW)
      lines.slice(0, 5).forEach((line, i) => {
        ctx.fillText(line, textX, cardY + 230 + i * 44)
      })
    }

    // 하단 CTA
    ctx.textAlign = 'left'
    ctx.font = '400 26px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.7)'
    ctx.fillText('나도 뽑아보기', textX, cardY + cardH - 90)

    ctx.font = '300 22px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.5)'
    ctx.fillText('lovtaro.kr', textX, cardY + cardH - 56)

    ctx.font = '300 20px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.45)'
    ctx.fillText('@lovtarot_', textX, cardY + cardH - 28)
  } else {
    // ── Story 레이아웃 (9:16) ──
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 280)
    ctx.lineTo(W - 200, 280)
    ctx.stroke()

    ctx.font = '300 28px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
    ctx.textAlign = 'center'
    ctx.fillText(readingType, W / 2, 240)

    ctx.font = '300 96px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText(cardName, W / 2, 440)

    if (cardNameEn) {
      ctx.font = 'italic 300 36px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.8)'
      ctx.fillText(cardNameEn, W / 2, 500)
    }

    const cardW = 320
    const cardH = 530
    const cardX = (W - cardW) / 2
    const cardY = 540

    _drawCardFrame(ctx, img, cardX, cardY, cardW, cardH, reversed)

    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(200, cardY + cardH + 60)
    ctx.lineTo(W - 200, cardY + cardH + 60)
    ctx.stroke()

    if (emotionTags.length > 0) {
      ctx.font = '400 28px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(167, 183, 214, 0.7)'
      ctx.textAlign = 'center'
      ctx.fillText(emotionTags.join('  ·  '), W / 2, cardY + cardH + 110)
    }

    if (summary) {
      const summaryY = cardY + cardH + 170
      ctx.font = '400 34px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.9)'
      ctx.textAlign = 'center'
      const lines = wrapText(ctx, summary, W - 200)
      lines.forEach((line, i) => {
        ctx.fillText(line, W / 2, summaryY + i * 54)
      })
    }

    // Bottom CTA
    const bottomLineY = H - 260
    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(200, bottomLineY)
    ctx.lineTo(W - 200, bottomLineY)
    ctx.stroke()

    ctx.font = '400 30px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.8)'
    ctx.textAlign = 'center'
    ctx.fillText('나도 뽑아보기', W / 2, bottomLineY + 48)

    ctx.font = '300 26px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.6)'
    ctx.fillText('lovtaro.kr', W / 2, bottomLineY + 82)

    ctx.font = '300 24px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.45)'
    ctx.fillText('@lovtarot_', W / 2, bottomLineY + 114)

    ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.35)'
    ctx.fillText('Lovtaro', W / 2, H - 80)
  }

  return canvas.toDataURL('image/png')
}

/** 카드 프레임 + 이미지 공통 헬퍼 */
function _drawCardFrame(ctx, img, x, y, w, h, reversed) {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 10

  const bgGrad = ctx.createLinearGradient(x, y, x, y + h)
  bgGrad.addColorStop(0, '#101A31')
  bgGrad.addColorStop(1, '#0A1020')
  ctx.fillStyle = bgGrad
  roundRect(ctx, x, y, w, h, 16)
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  if (img) {
    ctx.save()
    roundRect(ctx, x, y, w, h, 16)
    ctx.clip()
    if (reversed) {
      ctx.translate(x + w / 2, y + h / 2)
      ctx.rotate(Math.PI)
      ctx.drawImage(img, -w / 2, -h / 2, w, h)
    } else {
      ctx.drawImage(img, x, y, w, h)
    }
    ctx.restore()
  }

  ctx.strokeStyle = 'rgba(200, 169, 110, 0.3)'
  ctx.lineWidth = 1.5
  roundRect(ctx, x, y, w, h, 16)
  ctx.stroke()
}

/**
 * Generate share card for three-card reading
 * @param {Object} options
 * @param {string} options.readingType - e.g. "3장 리딩" or "러브타로"
 * @param {Array} options.cards - [{name, position}]
 * @param {string} options.summary - Overall summary
 * @returns {Promise<string>} Data URL of the generated image
 */
export async function generateThreeCardShareImage({ readingType, cards, summary, format = 'story' }) {
  const W = format === 'square' ? SQUARE_WIDTH : format === 'feed' ? FEED_WIDTH : STORY_WIDTH
  const H = format === 'square' ? SQUARE_HEIGHT : format === 'feed' ? FEED_HEIGHT : STORY_HEIGHT

  // 카드 이미지 로드
  const cardImages = await Promise.all(
    cards.slice(0, 3).map(card =>
      card.image
        ? new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null)
            img.src = card.image
          })
        : Promise.resolve(null)
    )
  )

  const canvas = document.createElement('canvas')
  canvas.width = W * DPR
  canvas.height = H * DPR
  const ctx = canvas.getContext('2d')
  ctx.scale(DPR, DPR)

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
  bgGrad.addColorStop(0, '#05070D')
  bgGrad.addColorStop(0.4, '#0A1020')
  bgGrad.addColorStop(1, '#05070D')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Ambient glow
  const glowGrad = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, 400)
  glowGrad.addColorStop(0, 'rgba(45, 108, 223, 0.08)')
  glowGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 0, W, H)

  // Inner border frame
  ctx.strokeStyle = 'rgba(199, 215, 248, 0.08)'
  ctx.lineWidth = 1
  roundRect(ctx, 60, 60, W - 120, H - 120, 20)
  ctx.stroke()

  const lineGrad = ctx.createLinearGradient(200, 0, W - 200, 0)
  lineGrad.addColorStop(0, 'transparent')
  lineGrad.addColorStop(0.5, 'rgba(77, 163, 255, 0.3)')
  lineGrad.addColorStop(1, 'transparent')

  const isFeed = format === 'feed' || format === 'square'
  const isSquare = format === 'square'
  const headerLineY = isSquare ? 100 : isFeed ? 200 : 260
  const titleY = isSquare ? 200 : isFeed ? 310 : 380
  const cardW = isSquare ? 200 : isFeed ? 280 : 240
  const cardH = isSquare ? 320 : isFeed ? 460 : 400
  const gap = isSquare ? 16 : isFeed ? 24 : 36
  const totalW = cardW * 3 + gap * 2
  const startX = (W - totalW) / 2
  const cardY = isSquare ? 200 : isFeed ? 360 : 440

  // Decorative line top
  ctx.strokeStyle = lineGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(200, headerLineY)
  ctx.lineTo(W - 200, headerLineY)
  ctx.stroke()

  // Reading type
  ctx.font = '300 28px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
  ctx.textAlign = 'center'
  ctx.fillText(readingType, W / 2, headerLineY - 40)

  // Title (story only)
  if (!isFeed) {
    ctx.font = '300 64px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText('세 장의 이야기', W / 2, titleY)
  }

  // Three card frames
  cards.slice(0, 3).forEach((card, i) => {
    const x = startX + i * (cardW + gap)
    const img = cardImages[i]

    _drawCardFrame(ctx, img, x, cardY, cardW, cardH, card.reversed)

    if (!img) {
      ctx.font = '300 34px "Noto Sans KR", sans-serif'
      ctx.fillStyle = '#F4F8FF'
      ctx.textAlign = 'center'
      ctx.fillText(card.name, x + cardW / 2, cardY + cardH / 2)
    }

    // Card name below
    ctx.font = isFeed ? '300 24px "Noto Sans KR", sans-serif' : '300 28px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.textAlign = 'center'
    ctx.fillText(card.name, x + cardW / 2, cardY + cardH + 34)

    // Position label
    ctx.font = isFeed ? '400 20px "Noto Sans KR", sans-serif' : '400 22px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.6)'
    ctx.fillText(card.position, x + cardW / 2, cardY + cardH + 60)
  })

  // After cards content
  const afterCardsY = cardY + cardH + (isFeed ? 90 : 110)
  ctx.strokeStyle = lineGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(200, afterCardsY)
  ctx.lineTo(W - 200, afterCardsY)
  ctx.stroke()

  // Summary
  if (summary) {
    const summaryY = afterCardsY + (isFeed ? 50 : 70)
    const fontSize = isFeed ? 28 : 34
    ctx.font = `400 ${fontSize}px "Noto Sans KR", sans-serif`
    ctx.fillStyle = 'rgba(220, 232, 255, 0.9)'
    ctx.textAlign = 'center'
    const lines = wrapText(ctx, summary, W - 200)
    const maxLines = isFeed ? 3 : 5
    lines.slice(0, maxLines).forEach((line, i) => {
      ctx.fillText(line, W / 2, summaryY + i * (isFeed ? 44 : 54))
    })
  }

  // ── Bottom CTA + Branding ──
  const bottomLineY = H - (isSquare ? 180 : isFeed ? 140 : 260)
  ctx.strokeStyle = lineGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(200, bottomLineY)
  ctx.lineTo(W - 200, bottomLineY)
  ctx.stroke()

  ctx.font = isFeed ? '400 26px "Noto Sans KR", sans-serif' : '400 30px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(143, 211, 255, 0.8)'
  ctx.textAlign = 'center'
  ctx.fillText('나도 뽑아보기', W / 2, bottomLineY + (isFeed ? 36 : 44))

  ctx.font = isFeed ? '300 22px "Noto Sans KR", sans-serif' : '300 26px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(167, 183, 214, 0.6)'
  ctx.fillText('lovtaro.kr', W / 2, bottomLineY + (isFeed ? 64 : 78))

  ctx.font = isFeed ? '300 20px "Noto Sans KR", sans-serif' : '300 24px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(143, 211, 255, 0.45)'
  ctx.fillText('@lovtarot_', W / 2, bottomLineY + (isFeed ? 90 : 110))

  if (!isFeed) {
    ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.35)'
    ctx.fillText('Lovtaro', W / 2, H - 80)
  }

  return canvas.toDataURL('image/png')
}

/**
 * Generate streak badge image (1080x1080)
 * @param {Object} options
 * @param {number} options.streakCount - consecutive days
 * @param {string} options.cardName - today's card name (optional)
 * @returns {Promise<string>} Data URL
 */
export async function generateStreakBadgeImage({ streakCount, cardName = '' }) {
  const W = 1080
  const H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const isGold = streakCount >= 7
  const accentR = isGold ? 200 : 77
  const accentG = isGold ? 169 : 163
  const accentB = isGold ? 110 : 255
  const accent = `rgba(${accentR}, ${accentG}, ${accentB}`

  // ── Background ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
  bgGrad.addColorStop(0, '#03050A')
  bgGrad.addColorStop(0.35, '#0A1020')
  bgGrad.addColorStop(0.65, '#0A1020')
  bgGrad.addColorStop(1, '#03050A')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // ── Star particles ──
  const starSeed = [
    [0.12, 0.08], [0.88, 0.12], [0.06, 0.35], [0.94, 0.28],
    [0.15, 0.62], [0.85, 0.55], [0.08, 0.85], [0.92, 0.82],
    [0.25, 0.15], [0.75, 0.18], [0.3, 0.88], [0.7, 0.92],
    [0.18, 0.45], [0.82, 0.42], [0.22, 0.72], [0.78, 0.68],
    [0.35, 0.05], [0.65, 0.95], [0.45, 0.1], [0.55, 0.9],
  ]
  starSeed.forEach(([px, py], i) => {
    const x = px * W
    const y = py * H
    const r = 0.8 + (i % 3) * 0.5
    const alpha = 0.15 + (i % 4) * 0.08
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `${accent}, ${alpha})`
    ctx.fill()
  })

  // ── Center glow (large, soft) ──
  const glow1 = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, 320)
  glow1.addColorStop(0, `${accent}, 0.12)`)
  glow1.addColorStop(0.4, `${accent}, 0.04)`)
  glow1.addColorStop(1, 'transparent')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, W, H)

  // ── Decorative circle ring ──
  const cx = W / 2
  const cy = 400
  const ringRadius = 185
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2)
  ctx.strokeStyle = `${accent}, 0.12)`
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, ringRadius + 12, 0, Math.PI * 2)
  ctx.strokeStyle = `${accent}, 0.06)`
  ctx.lineWidth = 0.5
  ctx.stroke()

  // Arc highlight (partial arc glow)
  ctx.beginPath()
  ctx.arc(cx, cy, ringRadius, -Math.PI * 0.7, -Math.PI * 0.3)
  ctx.strokeStyle = `${accent}, 0.35)`
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, ringRadius, Math.PI * 0.3, Math.PI * 0.7)
  ctx.strokeStyle = `${accent}, 0.25)`
  ctx.lineWidth = 2
  ctx.stroke()

  // Small diamond ornaments on ring (4 compass points)
  const diamondPositions = [0, Math.PI / 2, Math.PI, Math.PI * 1.5]
  diamondPositions.forEach(angle => {
    const dx = cx + Math.cos(angle) * ringRadius
    const dy = cy + Math.sin(angle) * ringRadius
    ctx.save()
    ctx.translate(dx, dy)
    ctx.rotate(angle + Math.PI / 4)
    ctx.fillStyle = `${accent}, 0.5)`
    ctx.fillRect(-4, -4, 8, 8)
    ctx.restore()
  })
  ctx.restore()

  // ── Inner border frame ──
  ctx.strokeStyle = `${accent}, 0.1)`
  ctx.lineWidth = 1
  roundRect(ctx, 50, 50, W - 100, H - 100, 24)
  ctx.stroke()

  // Corner accents
  const cornerLen = 30
  const cornerOff = 50
  const corners = [
    [cornerOff, cornerOff, 1, 1],
    [W - cornerOff, cornerOff, -1, 1],
    [cornerOff, H - cornerOff, 1, -1],
    [W - cornerOff, H - cornerOff, -1, -1],
  ]
  ctx.strokeStyle = `${accent}, 0.3)`
  ctx.lineWidth = 1.5
  corners.forEach(([x, y, dirX, dirY]) => {
    ctx.beginPath()
    ctx.moveTo(x, y + dirY * cornerLen)
    ctx.lineTo(x, y)
    ctx.lineTo(x + dirX * cornerLen, y)
    ctx.stroke()
  })

  // ── Top label ──
  ctx.textAlign = 'center'
  ctx.font = '300 24px "Noto Sans KR", sans-serif'
  ctx.fillStyle = `${accent}, 0.6)`
  ctx.letterSpacing = '4px'
  ctx.fillText('연속 타로 리딩', W / 2, 140)

  // Top decorative line
  const lineGrad = ctx.createLinearGradient(250, 0, W - 250, 0)
  lineGrad.addColorStop(0, 'transparent')
  lineGrad.addColorStop(0.5, `${accent}, 0.35)`)
  lineGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = lineGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 165)
  ctx.lineTo(W - 300, 165)
  ctx.stroke()

  // ── Streak number with glow ──
  const numStr = `${streakCount}`

  // Number glow effect
  ctx.save()
  ctx.font = '100 200px "Noto Sans KR", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Outer glow layer
  ctx.shadowColor = `${accent}, 0.4)`
  ctx.shadowBlur = 60
  ctx.fillStyle = 'transparent'
  ctx.fillText(numStr, cx, cy - 10)

  // Mid glow
  ctx.shadowColor = `${accent}, 0.3)`
  ctx.shadowBlur = 30
  ctx.fillStyle = 'transparent'
  ctx.fillText(numStr, cx, cy - 10)
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  // Number gradient fill
  const numGrad = ctx.createLinearGradient(cx - 80, cy - 100, cx + 80, cy + 80)
  if (isGold) {
    numGrad.addColorStop(0, '#F0E0B0')
    numGrad.addColorStop(0.3, '#E8D09A')
    numGrad.addColorStop(0.5, '#D4B87A')
    numGrad.addColorStop(0.7, '#E8D09A')
    numGrad.addColorStop(1, '#C8A96E')
  } else {
    numGrad.addColorStop(0, '#E8F0FF')
    numGrad.addColorStop(0.5, '#C8DCFF')
    numGrad.addColorStop(1, '#A0C4FF')
  }
  ctx.fillStyle = numGrad
  ctx.fillText(numStr, cx, cy - 10)
  ctx.restore()

  // ── "일 연속" label ──
  ctx.textAlign = 'center'
  ctx.font = '300 32px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(220, 232, 255, 0.75)'
  ctx.fillText('일 연속', cx, cy + 120)

  // ── Badge tier text ──
  let tierText = ''
  let tierColor = `${accent}, 0.7)`
  if (streakCount >= 30) {
    tierText = 'Master Reader'
    tierColor = 'rgba(240, 220, 170, 0.85)'
  } else if (streakCount >= 14) {
    tierText = 'Devoted Reader'
    tierColor = 'rgba(220, 200, 150, 0.75)'
  } else if (streakCount >= 7) {
    tierText = 'Faithful Reader'
    tierColor = 'rgba(200, 180, 130, 0.7)'
  } else if (streakCount >= 3) {
    tierText = 'Rising Reader'
    tierColor = 'rgba(100, 220, 180, 0.7)'
  }

  const tierY = cy + 170
  if (tierText) {
    ctx.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = tierColor
    ctx.fillText(tierText, cx, tierY)
  }

  // ── Progress bar to next tier ──
  const tiers = [3, 7, 14, 30]
  const currentTierIdx = tiers.filter(t => streakCount >= t).length
  const nextTier = tiers[currentTierIdx] || null
  const prevTier = currentTierIdx > 0 ? tiers[currentTierIdx - 1] : 0

  if (nextTier) {
    const barW = 280
    const barH = 4
    const barX = cx - barW / 2
    const barY = tierY + 28
    const progress = Math.min((streakCount - prevTier) / (nextTier - prevTier), 1)

    // Bar background
    roundRect(ctx, barX, barY, barW, barH, 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.fill()

    // Bar fill
    if (progress > 0) {
      const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0)
      fillGrad.addColorStop(0, `${accent}, 0.5)`)
      fillGrad.addColorStop(1, `${accent}, 0.8)`)
      roundRect(ctx, barX, barY, barW * progress, barH, 2)
      ctx.fillStyle = fillGrad
      ctx.fill()
    }

    // Next tier label
    const nextLabels = { 3: 'Rising Reader', 7: 'Faithful Reader', 14: 'Devoted Reader', 30: 'Master Reader' }
    ctx.font = '300 18px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.4)'
    ctx.fillText(`${nextTier}일 달성 시 ${nextLabels[nextTier]}`, cx, barY + 28)
  }

  // ── Today's card ──
  const cardY = nextTier ? tierY + 90 : tierY + 40
  if (cardName) {
    // Decorative dots
    ctx.fillStyle = `${accent}, 0.25)`
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(cx - 16 + i * 16, cardY, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '400 26px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.55)'
    ctx.fillText(`오늘의 카드: ${cardName}`, cx, cardY + 40)
  }

  // ── Bottom section ──
  const bottomLineY = H - 200
  ctx.strokeStyle = lineGrad
  ctx.beginPath()
  ctx.moveTo(280, bottomLineY)
  ctx.lineTo(W - 280, bottomLineY)
  ctx.stroke()

  ctx.font = '400 26px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(143, 211, 255, 0.75)'
  ctx.fillText('나도 매일 뽑아보기', cx, bottomLineY + 42)

  ctx.font = '300 22px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(167, 183, 214, 0.5)'
  ctx.fillText('lovtaro.kr', cx, bottomLineY + 72)

  ctx.font = '300 20px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(143, 211, 255, 0.4)'
  ctx.fillText('@lovtarot_', cx, bottomLineY + 100)

  ctx.font = 'italic 300 20px "Cormorant Garamond", Georgia, serif'
  ctx.fillStyle = 'rgba(126, 138, 168, 0.3)'
  ctx.fillText('Lovtaro', cx, H - 65)

  return canvas.toDataURL('image/png')
}

/**
 * Download a data URL as a file
 */
export function downloadImage(dataUrl, filename = 'lovtaro-reading.png') {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
