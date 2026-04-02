/**
 * Canvas-based share card generator for tarot reading results.
 * Creates a premium portrait-oriented image suitable for Instagram sharing.
 */

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1920
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
export function generateSingleCardShareImage({ readingType, cardName, cardNameEn, summary, emotionTags = [] }) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = CARD_WIDTH * DPR
    canvas.height = CARD_HEIGHT * DPR
    const ctx = canvas.getContext('2d')
    ctx.scale(DPR, DPR)

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT)
    bgGrad.addColorStop(0, '#05070D')
    bgGrad.addColorStop(0.4, '#0A1020')
    bgGrad.addColorStop(1, '#05070D')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

    // Ambient glow
    const glowGrad = ctx.createRadialGradient(CARD_WIDTH / 2, CARD_HEIGHT * 0.35, 0, CARD_WIDTH / 2, CARD_HEIGHT * 0.35, 400)
    glowGrad.addColorStop(0, 'rgba(45, 108, 223, 0.08)')
    glowGrad.addColorStop(0.5, 'rgba(77, 163, 255, 0.03)')
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

    // Inner border frame
    ctx.strokeStyle = 'rgba(199, 215, 248, 0.08)'
    ctx.lineWidth = 1
    roundRect(ctx, 60, 60, CARD_WIDTH - 120, CARD_HEIGHT - 120, 20)
    ctx.stroke()

    // Decorative line top
    const lineGrad = ctx.createLinearGradient(200, 0, CARD_WIDTH - 200, 0)
    lineGrad.addColorStop(0, 'transparent')
    lineGrad.addColorStop(0.5, 'rgba(77, 163, 255, 0.3)')
    lineGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 280)
    ctx.lineTo(CARD_WIDTH - 200, 280)
    ctx.stroke()

    // Reading type label
    ctx.font = '300 28px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '4px'
    ctx.fillText(readingType.toUpperCase(), CARD_WIDTH / 2, 240)

    // Card name (large)
    ctx.font = '300 96px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText(cardName, CARD_WIDTH / 2, 440)

    // Card English name
    if (cardNameEn) {
      ctx.font = 'italic 300 36px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.8)'
      ctx.fillText(cardNameEn, CARD_WIDTH / 2, 500)
    }

    // Card visual placeholder (elegant frame)
    const cardX = (CARD_WIDTH - 280) / 2
    const cardY = 560
    const cardW = 280
    const cardH = 460

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 10

    const cardBgGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH)
    cardBgGrad.addColorStop(0, '#101A31')
    cardBgGrad.addColorStop(1, '#0A1020')
    ctx.fillStyle = cardBgGrad
    roundRect(ctx, cardX, cardY, cardW, cardH, 16)
    ctx.fill()

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // Card border
    ctx.strokeStyle = 'rgba(77, 163, 255, 0.2)'
    ctx.lineWidth = 1
    roundRect(ctx, cardX, cardY, cardW, cardH, 16)
    ctx.stroke()

    // Card inner frame
    ctx.strokeStyle = 'rgba(199, 215, 248, 0.08)'
    roundRect(ctx, cardX + 12, cardY + 12, cardW - 24, cardH - 24, 10)
    ctx.stroke()

    // Card name inside frame
    ctx.font = '300 44px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText(cardName, CARD_WIDTH / 2, cardY + cardH / 2 - 10)

    if (cardNameEn) {
      ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.7)'
      ctx.fillText(cardNameEn, CARD_WIDTH / 2, cardY + cardH / 2 + 30)
    }

    // Decorative line after card
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, cardY + cardH + 60)
    ctx.lineTo(CARD_WIDTH - 200, cardY + cardH + 60)
    ctx.stroke()

    // Emotion tags
    if (emotionTags.length > 0) {
      const tagY = cardY + cardH + 110
      ctx.font = '400 28px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(167, 183, 214, 0.7)'
      const tagStr = emotionTags.join('  ·  ')
      ctx.fillText(tagStr, CARD_WIDTH / 2, tagY)
    }

    // Summary text
    if (summary) {
      const summaryY = cardY + cardH + 180
      ctx.font = '400 34px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.9)'
      ctx.textAlign = 'center'
      const lines = wrapText(ctx, summary, CARD_WIDTH - 200)
      lines.forEach((line, i) => {
        ctx.fillText(line, CARD_WIDTH / 2, summaryY + i * 54)
      })
    }

    // Bottom branding
    ctx.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.4)'
    ctx.textAlign = 'center'
    ctx.fillText('Lovtaro', CARD_WIDTH / 2, CARD_HEIGHT - 120)

    // Bottom decorative line
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(CARD_WIDTH / 2 - 40, CARD_HEIGHT - 90)
    ctx.lineTo(CARD_WIDTH / 2 + 40, CARD_HEIGHT - 90)
    ctx.stroke()

    resolve(canvas.toDataURL('image/png'))
  })
}

/**
 * Generate share card for three-card reading
 * @param {Object} options
 * @param {string} options.readingType - e.g. "3장 리딩" or "러브 타로"
 * @param {Array} options.cards - [{name, position}]
 * @param {string} options.summary - Overall summary
 * @returns {Promise<string>} Data URL of the generated image
 */
export function generateThreeCardShareImage({ readingType, cards, summary }) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = CARD_WIDTH * DPR
    canvas.height = CARD_HEIGHT * DPR
    const ctx = canvas.getContext('2d')
    ctx.scale(DPR, DPR)

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT)
    bgGrad.addColorStop(0, '#05070D')
    bgGrad.addColorStop(0.4, '#0A1020')
    bgGrad.addColorStop(1, '#05070D')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

    // Ambient glow
    const glowGrad = ctx.createRadialGradient(CARD_WIDTH / 2, CARD_HEIGHT * 0.3, 0, CARD_WIDTH / 2, CARD_HEIGHT * 0.3, 400)
    glowGrad.addColorStop(0, 'rgba(45, 108, 223, 0.08)')
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

    // Inner border frame
    ctx.strokeStyle = 'rgba(199, 215, 248, 0.08)'
    ctx.lineWidth = 1
    roundRect(ctx, 60, 60, CARD_WIDTH - 120, CARD_HEIGHT - 120, 20)
    ctx.stroke()

    // Decorative line top
    const lineGrad = ctx.createLinearGradient(200, 0, CARD_WIDTH - 200, 0)
    lineGrad.addColorStop(0, 'transparent')
    lineGrad.addColorStop(0.5, 'rgba(77, 163, 255, 0.3)')
    lineGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 260)
    ctx.lineTo(CARD_WIDTH - 200, 260)
    ctx.stroke()

    // Reading type
    ctx.font = '300 28px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
    ctx.textAlign = 'center'
    ctx.fillText(readingType, CARD_WIDTH / 2, 220)

    // Title
    ctx.font = '300 64px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText('세 장의 이야기', CARD_WIDTH / 2, 380)

    // Three card frames
    const cardW = 220
    const cardH = 360
    const gap = 40
    const totalW = cardW * 3 + gap * 2
    const startX = (CARD_WIDTH - totalW) / 2
    const cardY = 460

    cards.slice(0, 3).forEach((card, i) => {
      const x = startX + i * (cardW + gap)

      // Card shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      ctx.shadowBlur = 30
      ctx.shadowOffsetY = 8

      const cardBgGrad = ctx.createLinearGradient(x, cardY, x, cardY + cardH)
      cardBgGrad.addColorStop(0, '#101A31')
      cardBgGrad.addColorStop(1, '#0A1020')
      ctx.fillStyle = cardBgGrad
      roundRect(ctx, x, cardY, cardW, cardH, 14)
      ctx.fill()

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Border
      ctx.strokeStyle = 'rgba(77, 163, 255, 0.18)'
      ctx.lineWidth = 1
      roundRect(ctx, x, cardY, cardW, cardH, 14)
      ctx.stroke()

      // Inner frame
      ctx.strokeStyle = 'rgba(199, 215, 248, 0.06)'
      roundRect(ctx, x + 10, cardY + 10, cardW - 20, cardH - 20, 8)
      ctx.stroke()

      // Card name
      ctx.font = '300 34px "Noto Sans KR", sans-serif'
      ctx.fillStyle = '#F4F8FF'
      ctx.textAlign = 'center'
      ctx.fillText(card.name, x + cardW / 2, cardY + cardH / 2)

      // Position label below card
      ctx.font = '400 24px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(77, 163, 255, 0.6)'
      ctx.fillText(card.position, x + cardW / 2, cardY + cardH + 44)
    })

    // Decorative line after cards
    const afterCardsY = cardY + cardH + 100
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, afterCardsY)
    ctx.lineTo(CARD_WIDTH - 200, afterCardsY)
    ctx.stroke()

    // Summary
    if (summary) {
      const summaryY = afterCardsY + 80
      ctx.font = '400 34px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.9)'
      ctx.textAlign = 'center'
      const lines = wrapText(ctx, summary, CARD_WIDTH - 200)
      lines.forEach((line, i) => {
        ctx.fillText(line, CARD_WIDTH / 2, summaryY + i * 54)
      })
    }

    // Branding
    ctx.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.4)'
    ctx.textAlign = 'center'
    ctx.fillText('Lovtaro', CARD_WIDTH / 2, CARD_HEIGHT - 120)

    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(CARD_WIDTH / 2 - 40, CARD_HEIGHT - 90)
    ctx.lineTo(CARD_WIDTH / 2 + 40, CARD_HEIGHT - 90)
    ctx.stroke()

    resolve(canvas.toDataURL('image/png'))
  })
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
