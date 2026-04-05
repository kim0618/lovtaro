/**
 * Canvas-based share card generator for tarot reading results.
 * Creates a premium portrait-oriented image suitable for Instagram sharing.
 */

const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
const FEED_WIDTH = 1080
const FEED_HEIGHT = 1350
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
  const W = format === 'feed' ? FEED_WIDTH : STORY_WIDTH
  const H = format === 'feed' ? FEED_HEIGHT : STORY_HEIGHT
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

  // Feed: 좌측 카드 + 우측 텍스트 / Story: 위 텍스트 + 아래 카드
  const isFeed = format === 'feed'

  if (isFeed) {
    // ── Feed 레이아웃 (4:5) ──
    const cardW = 380
    const cardH = 630
    const cardX = 100
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
    ctx.fillText('나도 뽑아보기', textX, cardY + cardH - 70)

    ctx.font = '300 22px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.5)'
    ctx.fillText('lovtaro.pages.dev', textX, cardY + cardH - 36)
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
    const bottomLineY = H - 200
    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(200, bottomLineY)
    ctx.lineTo(W - 200, bottomLineY)
    ctx.stroke()

    ctx.font = '400 30px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.8)'
    ctx.textAlign = 'center'
    ctx.fillText('나도 뽑아보기', W / 2, bottomLineY + 52)

    ctx.font = '300 26px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.6)'
    ctx.fillText('lovtaro.pages.dev', W / 2, bottomLineY + 92)

    ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.35)'
    ctx.fillText('Lovtaro', W / 2, H - 60)
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
  const W = format === 'feed' ? FEED_WIDTH : STORY_WIDTH
  const H = format === 'feed' ? FEED_HEIGHT : STORY_HEIGHT

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

  const isFeed = format === 'feed'
  const headerLineY = isFeed ? 200 : 260
  const titleY = isFeed ? 310 : 380
  const cardW = isFeed ? 280 : 240
  const cardH = isFeed ? 460 : 400
  const gap = isFeed ? 24 : 36
  const totalW = cardW * 3 + gap * 2
  const startX = (W - totalW) / 2
  const cardY = isFeed ? 360 : 440

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
  const bottomLineY = H - (isFeed ? 140 : 200)
  ctx.strokeStyle = lineGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(200, bottomLineY)
  ctx.lineTo(W - 200, bottomLineY)
  ctx.stroke()

  ctx.font = isFeed ? '400 26px "Noto Sans KR", sans-serif' : '400 30px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(143, 211, 255, 0.8)'
  ctx.textAlign = 'center'
  ctx.fillText('나도 뽑아보기', W / 2, bottomLineY + (isFeed ? 40 : 52))

  ctx.font = isFeed ? '300 22px "Noto Sans KR", sans-serif' : '300 26px "Noto Sans KR", sans-serif'
  ctx.fillStyle = 'rgba(167, 183, 214, 0.6)'
  ctx.fillText('lovtaro.pages.dev', W / 2, bottomLineY + (isFeed ? 72 : 92))

  if (!isFeed) {
    ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.35)'
    ctx.fillText('Lovtaro', W / 2, H - 60)
  }

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
