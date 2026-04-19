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
export async function generateSingleCardShareImage({ readingType, cardName, cardNameEn, summary, emotionTags = [], cardImage = '', reversed = false, format = 'story', answerLabel = '', answerDesc = '', emotionHook = '' }) {
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
    // ── Feed/Square 레이아웃 - 개선: 타이포 위계 + 공감 훅 ──
    const cardW = isSquare ? 300 : 380
    const cardH = isSquare ? 500 : 630
    const cardX = isSquare ? 80 : 100
    const cardY = (H - cardH) / 2

    // 카드 그리기
    _drawCardFrame(ctx, img, cardX, cardY, cardW, cardH, reversed)

    // 우측 텍스트 영역 - 간격 넓힘
    const textX = cardX + cardW + 70
    const textW = W - textX - 100
    ctx.textAlign = 'left'

    ctx.font = '300 22px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
    ctx.fillText(readingType, textX, cardY + 36)

    // Yes/No 답변 (Feed/Square)
    let feedTextOffset = 0
    if (answerLabel) {
      const answerColors = { Yes: '#D4B87A', No: 'rgba(167, 183, 214, 0.8)', Maybe: '#B8A0D4' }
      ctx.font = '400 52px "Cinzel", Georgia, serif'
      ctx.fillStyle = answerColors[answerLabel] || answerColors.Yes
      ctx.fillText(answerLabel, textX, cardY + 100)
      feedTextOffset = 70
    }

    // 카드 이름 - 크게 (64→76px)
    ctx.font = '300 76px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText(cardName, textX, cardY + 130 + feedTextOffset)

    if (cardNameEn) {
      ctx.font = 'italic 300 26px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.7)'
      ctx.fillText(cardNameEn, textX, cardY + 168 + feedTextOffset)
    }

    // 구분선
    ctx.strokeStyle = 'rgba(77, 163, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(textX, cardY + 196 + feedTextOffset)
    ctx.lineTo(textX + textW, cardY + 196 + feedTextOffset)
    ctx.stroke()

    // 공감 훅 (emotionHook)
    let feedNextY = cardY + 236 + feedTextOffset
    if (emotionHook) {
      ctx.font = 'italic 400 24px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(200, 169, 110, 0.9)'
      const hookParts = emotionHook.split('\n')
      hookParts.forEach((part, i) => {
        ctx.fillText(part, textX, feedNextY + i * 38)
      })
      feedNextY += hookParts.length * 38 + 24
    }

    // 요약
    if (summary) {
      const sumFontSize = answerLabel ? 22 : 24
      const sumLineH = answerLabel ? 36 : 38
      const sumMaxLines = emotionHook ? 3 : (answerLabel ? 3 : 5)
      ctx.font = `400 ${sumFontSize}px "Noto Sans KR", sans-serif`
      ctx.fillStyle = 'rgba(220, 232, 255, 0.85)'
      const lines = wrapText(ctx, summary, textW)
      lines.slice(0, sumMaxLines).forEach((line, i) => {
        ctx.fillText(line, textX, feedNextY + i * sumLineH)
      })
    }

    // 하단 CTA
    ctx.textAlign = 'left'
    ctx.font = '400 24px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.7)'
    ctx.fillText('나도 뽑아보기', textX, cardY + cardH - 84)

    ctx.font = '300 20px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.5)'
    ctx.fillText('lovtaro.kr', textX, cardY + cardH - 54)

    ctx.font = '300 18px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.45)'
    ctx.fillText('@lovtarot_', textX, cardY + cardH - 30)
  } else {
    // ── Story 레이아웃 (9:16) - 개선: 카드 크게, 타이포 위계 강화, 공감 훅 ──
    ctx.textAlign = 'center'

    // 상단 리딩 타입 라벨
    ctx.font = '300 26px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
    ctx.fillText(readingType, W / 2, 200)

    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 230)
    ctx.lineTo(W - 200, 230)
    ctx.stroke()

    // Yes/No 답변 뱃지 (있을 때만)
    let contentOffsetY = 0
    if (answerLabel) {
      const answerColors = {
        Yes: { text: '#D4B87A', glow: 'rgba(212, 184, 122, 0.15)' },
        No: { text: 'rgba(167, 183, 214, 0.8)', glow: 'rgba(120, 140, 180, 0.1)' },
        Maybe: { text: '#B8A0D4', glow: 'rgba(160, 130, 200, 0.12)' },
      }
      const color = answerColors[answerLabel] || answerColors.Yes

      const answerGlow = ctx.createRadialGradient(W / 2, 320, 0, W / 2, 320, 200)
      answerGlow.addColorStop(0, color.glow)
      answerGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = answerGlow
      ctx.fillRect(0, 220, W, 200)

      ctx.font = '400 120px "Cinzel", Georgia, serif'
      ctx.fillStyle = color.text
      ctx.fillText(answerLabel, W / 2, 360)

      if (answerDesc) {
        ctx.font = '400 28px "Noto Sans KR", sans-serif'
        ctx.fillStyle = 'rgba(167, 183, 214, 0.75)'
        ctx.fillText(answerDesc, W / 2, 410)
      }

      contentOffsetY = 150
    }

    // 카드 이름 - 크게 (96→110px)
    ctx.font = '300 110px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText(cardName, W / 2, 380 + contentOffsetY)

    if (cardNameEn) {
      ctx.font = 'italic 300 34px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.8)'
      ctx.fillText(cardNameEn, W / 2, 430 + contentOffsetY)
    }

    // 카드 이미지 - 크게 (320x530→380x630)
    const cardW = answerLabel ? 300 : 380
    const cardH = answerLabel ? 500 : 630
    const cardX = (W - cardW) / 2
    const cardY = 460 + contentOffsetY

    _drawCardFrame(ctx, img, cardX, cardY, cardW, cardH, reversed)

    // 카드 아래 감정 태그
    const afterCardY = cardY + cardH + 50
    if (emotionTags.length > 0) {
      ctx.font = '400 26px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(167, 183, 214, 0.65)'
      ctx.textAlign = 'center'
      ctx.fillText(emotionTags.join('  ·  '), W / 2, afterCardY)
    }

    // 구분선
    const dividerY = afterCardY + 30
    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(200, dividerY)
    ctx.lineTo(W - 200, dividerY)
    ctx.stroke()

    // 공감 훅 (emotionHook) - "이거 내 얘기잖아" 유도 문구
    let nextY = dividerY + 50
    if (emotionHook) {
      ctx.font = 'italic 400 32px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(200, 169, 110, 0.9)'
      ctx.textAlign = 'center'
      const hookParts = emotionHook.split('\n')
      hookParts.forEach((part, i) => {
        ctx.fillText(part, W / 2, nextY + i * 50)
      })
      nextY += hookParts.length * 50 + 16
    }

    // 요약 텍스트
    if (summary) {
      ctx.font = '400 30px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.85)'
      ctx.textAlign = 'center'
      const lines = wrapText(ctx, summary, W - 200)
      const sumLines = lines.slice(0, 3)
      sumLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, nextY + i * 48)
      })
      nextY += sumLines.length * 48 + 40
    } else {
      nextY += 20
    }

    // CTA - 콘텐츠 바로 아래에 배치 (고정 위치 대신 흐름 따라감)
    // 단, 최소 위치는 H - 200 이하로 내려가지 않도록
    const ctaY = Math.min(nextY, H - 200)

    ctx.strokeStyle = lineGrad
    ctx.beginPath()
    ctx.moveTo(200, ctaY)
    ctx.lineTo(W - 200, ctaY)
    ctx.stroke()

    ctx.font = '400 28px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.8)'
    ctx.textAlign = 'center'
    ctx.fillText('나도 뽑아보기', W / 2, ctaY + 44)

    ctx.font = '300 24px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.55)'
    ctx.fillText('lovtaro.kr', W / 2, ctaY + 76)

    ctx.font = '300 22px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.4)'
    ctx.fillText('@lovtarot_', W / 2, ctaY + 104)
  }

  return canvas.toDataURL('image/png')
}

/**
 * Generate share card for compatibility reading (2 cards + score)
 */
export async function generateCompatibilityShareImage({ card1Name, card1NameEn, card1Image, card1Reversed, card2Name, card2NameEn, card2Image, card2Reversed, score, scoreLabel, summary, format = 'story' }) {
  const W = format === 'square' ? SQUARE_WIDTH : format === 'feed' ? FEED_WIDTH : STORY_WIDTH
  const H = format === 'square' ? SQUARE_HEIGHT : format === 'feed' ? FEED_HEIGHT : STORY_HEIGHT

  const [img1, img2] = await Promise.all([card1Image, card2Image].map(src =>
    src
      ? new Promise(resolve => {
          const i = new Image()
          i.crossOrigin = 'anonymous'
          i.onload = () => resolve(i)
          i.onerror = () => resolve(null)
          i.src = src
        })
      : Promise.resolve(null)
  ))

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

  // Ambient glow (gold for compatibility)
  const glowGrad = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, 420)
  glowGrad.addColorStop(0, 'rgba(212, 184, 122, 0.1)')
  glowGrad.addColorStop(0.5, 'rgba(200, 169, 110, 0.04)')
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
  lineGrad.addColorStop(0.5, 'rgba(200, 169, 110, 0.3)')
  lineGrad.addColorStop(1, 'transparent')

  const isFeed = format === 'feed' || format === 'square'
  const isSquare = format === 'square'

  if (isFeed) {
    // ── Feed/Square ──
    ctx.textAlign = 'center'

    if (isSquare) {
      // ═══ SQUARE 1080x1080 전용 레이아웃 ═══
      // 궁합 타로 라벨
      ctx.font = '300 22px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
      ctx.fillText('궁합 타로', W / 2, 96)

      // 점수 (골드)
      const sGlow = ctx.createRadialGradient(W / 2, 170, 0, W / 2, 170, 180)
      sGlow.addColorStop(0, 'rgba(212, 184, 122, 0.12)')
      sGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = sGlow
      ctx.fillRect(0, 60, W, 220)

      ctx.font = '400 100px "Cinzel", Georgia, serif'
      const sGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0)
      sGrad.addColorStop(0, '#D4B87A')
      sGrad.addColorStop(0.4, '#E8D09A')
      sGrad.addColorStop(0.7, '#C8A96E')
      sGrad.addColorStop(1, '#D4B87A')
      ctx.fillStyle = sGrad
      ctx.fillText(`${score}%`, W / 2, 176)

      // 등급
      ctx.font = '300 24px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.75)'
      ctx.fillText(scoreLabel, W / 2, 212)

      // 카드 2장 (넉넉한 크기)
      const cW = 250, cH = 416, cGap = 28
      const cTotalW = cW * 2 + cGap
      const cStartX = (W - cTotalW) / 2
      const cY = 240

      _drawCardFrame(ctx, img1, cStartX, cY, cW, cH, card1Reversed)
      _drawCardFrame(ctx, img2, cStartX + cW + cGap, cY, cW, cH, card2Reversed)

      // 카드 이름
      ctx.font = '300 26px "Noto Sans KR", sans-serif'
      ctx.fillStyle = '#F4F8FF'
      ctx.fillText(card1Name, cStartX + cW / 2, cY + cH + 34)
      ctx.fillText(card2Name, cStartX + cW + cGap + cW / 2, cY + cH + 34)

      // 영문
      ctx.font = 'italic 300 18px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.7)'
      ctx.fillText(card1NameEn, cStartX + cW / 2, cY + cH + 58)
      ctx.fillText(card2NameEn, cStartX + cW + cGap + cW / 2, cY + cH + 58)

      // 구분선
      const lineY2 = cY + cH + 80
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(200, lineY2)
      ctx.lineTo(W - 200, lineY2)
      ctx.stroke()

      // 요약
      if (summary) {
        ctx.font = '400 24px "Noto Sans KR", sans-serif'
        ctx.fillStyle = 'rgba(220, 232, 255, 0.85)'
        const lines = wrapText(ctx, summary, W - 240)
        lines.slice(0, 2).forEach((line, i) => {
          ctx.fillText(line, W / 2, lineY2 + 38 + i * 38)
        })
      }

      // CTA
      ctx.font = '400 22px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(143, 211, 255, 0.7)'
      ctx.fillText('나도 궁합 보기  ·  lovtaro.kr', W / 2, H - 80)
      ctx.font = '300 18px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(143, 211, 255, 0.45)'
      ctx.fillText('@lovtarot_', W / 2, H - 56)

    } else {
      // ═══ FEED 1080x1350 - 세로 여유있게 배치 ═══
      // 라벨 y=130
      ctx.font = '300 24px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
      ctx.fillText('궁합 타로', W / 2, 130)

      // 점수 글로우 (강하게)
      const scoreY = 270
      const scoreGlow = ctx.createRadialGradient(W / 2, scoreY - 10, 0, W / 2, scoreY - 10, 250)
      scoreGlow.addColorStop(0, 'rgba(212, 184, 122, 0.2)')
      scoreGlow.addColorStop(0.4, 'rgba(200, 169, 110, 0.08)')
      scoreGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = scoreGlow
      ctx.fillRect(0, scoreY - 150, W, 300)

      // 점수 130px
      ctx.font = '400 130px "Cinzel", Georgia, serif'
      const scoreTextGrad = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0)
      scoreTextGrad.addColorStop(0, '#D4B87A')
      scoreTextGrad.addColorStop(0.4, '#E8D09A')
      scoreTextGrad.addColorStop(0.7, '#C8A96E')
      scoreTextGrad.addColorStop(1, '#D4B87A')
      ctx.fillStyle = scoreTextGrad
      ctx.fillText(`${score}%`, W / 2, scoreY)

      // 등급 y=320
      ctx.font = '300 30px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.8)'
      ctx.fillText(scoreLabel, W / 2, scoreY + 50)

      // 구분선 y=360
      const line1Y = scoreY + 86
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(200, line1Y)
      ctx.lineTo(W - 200, line1Y)
      ctx.stroke()

      // 카드 2장 y=390~850
      const cardW = 280, cardH = 466, gap = 30
      const totalCardW = cardW * 2 + gap
      const startX = (W - totalCardW) / 2
      const cardY = line1Y + 30

      _drawCardFrame(ctx, img1, startX, cardY, cardW, cardH, card1Reversed)
      _drawCardFrame(ctx, img2, startX + cardW + gap, cardY, cardW, cardH, card2Reversed)

      // 카드 이름 y=896
      ctx.font = '300 28px "Noto Sans KR", sans-serif'
      ctx.fillStyle = '#F4F8FF'
      ctx.fillText(card1Name, startX + cardW / 2, cardY + cardH + 36)
      ctx.fillText(card2Name, startX + cardW + gap + cardW / 2, cardY + cardH + 36)

      // 영문 y=922
      ctx.font = 'italic 300 20px "Cormorant Garamond", Georgia, serif'
      ctx.fillStyle = 'rgba(126, 138, 168, 0.7)'
      ctx.fillText(card1NameEn, startX + cardW / 2, cardY + cardH + 62)
      ctx.fillText(card2NameEn, startX + cardW + gap + cardW / 2, cardY + cardH + 62)

      // 구분선 y=952
      const line2Y = cardY + cardH + 86
      ctx.strokeStyle = lineGrad
      ctx.beginPath()
      ctx.moveTo(200, line2Y)
      ctx.lineTo(W - 200, line2Y)
      ctx.stroke()

      // 요약 y=998~
      let nextY = line2Y + 46
      if (summary) {
        ctx.font = '400 28px "Noto Sans KR", sans-serif'
        ctx.fillStyle = 'rgba(220, 232, 255, 0.85)'
        const lines = wrapText(ctx, summary, W - 220)
        const maxL = Math.min(lines.length, 3)
        lines.slice(0, maxL).forEach((line, i) => {
          ctx.fillText(line, W / 2, nextY + i * 44)
        })
        nextY = nextY + maxL * 44 + 30
      }

      // 구분선 + CTA (요약 바로 아래)
      ctx.strokeStyle = lineGrad
      ctx.beginPath()
      ctx.moveTo(200, nextY)
      ctx.lineTo(W - 200, nextY)
      ctx.stroke()

      ctx.font = '400 28px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(143, 211, 255, 0.8)'
      ctx.fillText('나도 궁합 보기', W / 2, nextY + 44)

      ctx.font = '300 22px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(167, 183, 214, 0.6)'
      ctx.fillText('lovtaro.kr', W / 2, nextY + 76)

      ctx.font = '300 20px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(143, 211, 255, 0.45)'
      ctx.fillText('@lovtarot_', W / 2, nextY + 102)
    }

  } else {
    // ── Story (9:16) ──
    ctx.textAlign = 'center'

    // Reading type
    ctx.font = '300 28px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(77, 163, 255, 0.7)'
    ctx.fillText('궁합 타로', W / 2, 240)

    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 270)
    ctx.lineTo(W - 200, 270)
    ctx.stroke()

    // Score - large gold
    const scoreY = 440
    const scoreGlow = ctx.createRadialGradient(W / 2, scoreY - 30, 0, W / 2, scoreY - 30, 280)
    scoreGlow.addColorStop(0, 'rgba(212, 184, 122, 0.15)')
    scoreGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = scoreGlow
    ctx.fillRect(0, scoreY - 160, W, 320)

    ctx.font = '400 130px "Cinzel", Georgia, serif'
    const scoreTextGrad = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0)
    scoreTextGrad.addColorStop(0, '#D4B87A')
    scoreTextGrad.addColorStop(0.4, '#E8D09A')
    scoreTextGrad.addColorStop(0.7, '#C8A96E')
    scoreTextGrad.addColorStop(1, '#D4B87A')
    ctx.fillStyle = scoreTextGrad
    ctx.fillText(`${score}%`, W / 2, scoreY)

    // Score label
    ctx.font = '300 36px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(220, 232, 255, 0.8)'
    ctx.fillText(scoreLabel, W / 2, scoreY + 56)

    // Two cards
    const cardW = 300
    const cardH = 500
    const gap = 36
    const totalCardW = cardW * 2 + gap
    const startX = (W - totalCardW) / 2
    const cardY = 560

    _drawCardFrame(ctx, img1, startX, cardY, cardW, cardH, card1Reversed)
    _drawCardFrame(ctx, img2, startX + cardW + gap, cardY, cardW, cardH, card2Reversed)

    // Card names
    ctx.font = '300 34px "Noto Sans KR", sans-serif'
    ctx.fillStyle = '#F4F8FF'
    ctx.fillText(card1Name, startX + cardW / 2, cardY + cardH + 44)
    ctx.fillText(card2Name, startX + cardW + gap + cardW / 2, cardY + cardH + 44)

    // English names
    ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.7)'
    ctx.fillText(card1NameEn, startX + cardW / 2, cardY + cardH + 76)
    ctx.fillText(card2NameEn, startX + cardW + gap + cardW / 2, cardY + cardH + 76)

    // Decorative line after cards
    const afterY = cardY + cardH + 110
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, afterY)
    ctx.lineTo(W - 200, afterY)
    ctx.stroke()

    // Summary + CTA (요약 바로 아래 이어서)
    let storyNextY = afterY + 56
    if (summary) {
      ctx.font = '400 32px "Noto Sans KR", sans-serif'
      ctx.fillStyle = 'rgba(220, 232, 255, 0.9)'
      const lines = wrapText(ctx, summary, W - 200)
      const maxL = Math.min(lines.length, 3)
      lines.slice(0, maxL).forEach((line, i) => {
        ctx.fillText(line, W / 2, storyNextY + i * 50)
      })
      storyNextY = storyNextY + maxL * 50 + 40
    }

    // CTA 구분선
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, storyNextY)
    ctx.lineTo(W - 200, storyNextY)
    ctx.stroke()

    ctx.font = '400 30px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.8)'
    ctx.fillText('나도 궁합 보기', W / 2, storyNextY + 48)

    ctx.font = '300 26px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(167, 183, 214, 0.6)'
    ctx.fillText('lovtaro.kr', W / 2, storyNextY + 82)

    ctx.font = '300 24px "Noto Sans KR", sans-serif'
    ctx.fillStyle = 'rgba(143, 211, 255, 0.45)'
    ctx.fillText('@lovtarot_', W / 2, storyNextY + 114)

    ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = 'rgba(126, 138, 168, 0.35)'
    ctx.fillText('Lovtaro', W / 2, storyNextY + 160)
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
