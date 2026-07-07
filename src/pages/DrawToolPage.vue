<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '../composables/useHead.js'

useHead({
  title: '카드 뽑기 (운영자 전용)',
  description: '',
})

// ── 78장 덱 (draw-cards.py 와 동일) ──────────────────
const MAJOR_CARDS = [
  ['fool', '바보', 'The Fool'],
  ['magician', '마법사', 'The Magician'],
  ['priestess', '여사제', 'The High Priestess'],
  ['empress', '여황제', 'The Empress'],
  ['emperor', '황제', 'The Emperor'],
  ['hierophant', '교황', 'The Hierophant'],
  ['lovers', '연인', 'The Lovers'],
  ['chariot', '전차', 'The Chariot'],
  ['strength', '힘', 'Strength'],
  ['hermit', '은둔자', 'The Hermit'],
  ['wheel', '운명의 수레바퀴', 'Wheel of Fortune'],
  ['justice', '정의', 'Justice'],
  ['hanged', '매달린 사람', 'The Hanged Man'],
  ['death', '죽음', 'Death'],
  ['temperance', '절제', 'Temperance'],
  ['devil', '악마', 'The Devil'],
  ['tower', '탑', 'The Tower'],
  ['star', '별', 'The Star'],
  ['moon', '달', 'The Moon'],
  ['sun', '태양', 'The Sun'],
  ['judgement', '심판', 'Judgement'],
  ['world', '세계', 'The World'],
]

const SUITS = [['cups', '컵'], ['pentacles', '펜타클'], ['swords', '소드'], ['wands', '완드']]
const RANKS = [
  ['ace', '에이스', 'Ace'], ['two', '2', 'Two'], ['three', '3', 'Three'],
  ['four', '4', 'Four'], ['five', '5', 'Five'], ['six', '6', 'Six'],
  ['seven', '7', 'Seven'], ['eight', '8', 'Eight'], ['nine', '9', 'Nine'],
  ['ten', '10', 'Ten'], ['page', '페이지', 'Page'], ['knight', '나이트', 'Knight'],
  ['queen', '여왕', 'Queen'], ['king', '킹', 'King'],
]

const MINOR_CARDS = []
for (const [suitSlug, suitKo] of SUITS) {
  for (const [rankSlug, rankKo, rankEn] of RANKS) {
    MINOR_CARDS.push([`${rankSlug}-of-${suitSlug}`, `${suitKo}의 ${rankKo}`, `${rankEn} of ${suitSlug[0].toUpperCase()}${suitSlug.slice(1)}`])
  }
}
const ALL_CARDS = [...MAJOR_CARDS, ...MINOR_CARDS]

// 도구 전용 경량 썸네일(560x840 JPEG, ~97KB). 원본 cards-png/mcards는 장당 1~2.7MB라 폰에서 느려서
// scripts로 사전 생성해둔 카드 id 기준 썸네일을 사용 (재생성: gen-draw-thumbs).
function cardImageUrl(id) {
  return `/images/cards-draw/${id}.jpg`
}

// ── 디자인 토큰 (PDF·PNG 동기) ──────────────────────
const GOLD = '212,169,94'
const GOLD_SOFT = '184,146,74'
const GOLD_DEEP = '139,107,54'
const TEXT_STRONG = '244,248,255'
const W = 1080
const H = 1080
const CARD_W = 280
const CARD_H = 420
const CARD_GAP = 26

const nickname = ref('')
const cards = ref([]) // [{id, nameKo, nameEn, reversed}]
const summary = ref('')
const canvasRef = ref(null)
const previewUrl = ref('') // 렌더 결과 dataURL (모바일 길게눌러 저장용 <img>)
const drawing = ref(false)

function drawThree() {
  const deck = [...ALL_CARDS]
  const picked = []
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * deck.length)
    picked.push(deck.splice(idx, 1)[0])
  }
  return picked.map(([id, nameKo, nameEn]) => ({
    id, nameKo, nameEn, reversed: Math.random() < 0.3,
  }))
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`))
    img.src = src
  })
}

function star(ctx, cx, cy, outer, alpha) {
  const inner = outer * 0.32
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 2 - (Math.PI / 4) * i
    const r = i % 2 === 0 ? outer : inner
    const x = cx + r * Math.cos(angle)
    const y = cy - r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = `rgba(${GOLD},${alpha})`
  ctx.fill()
}

function gradLine(ctx, y, cx, half, peak) {
  const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0)
  g.addColorStop(0, `rgba(${GOLD},0)`)
  g.addColorStop(0.5, `rgba(${GOLD},${peak})`)
  g.addColorStop(1, `rgba(${GOLD},0)`)
  ctx.fillStyle = g
  ctx.fillRect(cx - half, y, half * 2, 2)
}

async function render() {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const cx = W / 2

  // 배경 그라데이션
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, 'rgb(10,16,32)')
  bg.addColorStop(1, 'rgb(5,7,13)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 중앙 골드 글로우
  const glow = ctx.createRadialGradient(cx, H * 0.42, 0, cx, H * 0.42, W * 0.55)
  glow.addColorStop(0, `rgba(${GOLD},0.11)`)
  glow.addColorStop(0.5, `rgba(${GOLD},0.02)`)
  glow.addColorStop(1, `rgba(${GOLD},0)`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // 별
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = Math.random() < 0.75 ? 1 : 2
    const a = 0.24 + Math.random() * 0.4
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = Math.random() < 0.5 ? `rgba(${GOLD},${a})` : `rgba(143,211,255,${a})`
    ctx.fill()
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // 로고
  const logoY = 110
  ctx.font = '700 34px "Noto Sans KR","Apple SD Gothic Neo",sans-serif'
  ctx.fillStyle = `rgba(${GOLD},0.9)`
  const logo = 'L O V T A R O'
  ctx.fillText(logo, cx, logoY)
  const logoW = ctx.measureText(logo).width
  star(ctx, cx - logoW / 2 - 26, logoY + 20, 12, 0.86)
  star(ctx, cx + logoW / 2 + 26, logoY + 20, 12, 0.86)

  // 로고 아래 라인
  const lineY = 184
  gradLine(ctx, lineY, cx, 145, 0.55)
  ctx.beginPath()
  ctx.arc(cx, lineY + 1, 2, 0, Math.PI * 2)
  ctx.fillStyle = `rgb(${GOLD})`
  ctx.fill()

  // 인사말
  ctx.font = '400 22px "Noto Sans KR","Apple SD Gothic Neo",sans-serif'
  ctx.fillStyle = `rgba(${TEXT_STRONG},0.82)`
  const name = nickname.value.trim()
  const greeting = name ? `${name}님, 3장의 카드를 펼쳐드릴게요` : '사연을 토대로 뽑힌 카드 3장입니다'
  ctx.fillText(greeting, cx, lineY + 28)

  // 카드 3장
  const totalW = CARD_W * 3 + CARD_GAP * 2
  const startX = (W - totalW) / 2
  const cardY = 290
  const tilts = [-2.8, 1.6, -3.2]
  const yOff = [6, -4, 8]

  const imgs = await Promise.all(cards.value.map((c) => loadImage(cardImageUrl(c.id))))

  cards.value.forEach((c, i) => {
    const xAnchor = startX + i * (CARD_W + CARD_GAP)
    const centerX = xAnchor + CARD_W / 2
    const centerY = cardY + yOff[i] + CARD_H / 2
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((tilts[i] * Math.PI) / 180)
    // 카드 + 그림자 (역방향이면 180도)
    ctx.save()
    if (c.reversed) ctx.rotate(Math.PI)
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetX = 6
    ctx.shadowOffsetY = 14
    ctx.drawImage(imgs[i], -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H)
    ctx.restore()
    // 골드 테두리
    ctx.strokeStyle = `rgba(${GOLD},0.7)`
    ctx.lineWidth = 2
    ctx.strokeRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H)
    ctx.restore()
  })

  // 번호 + 카드 이름 (회전 없음)
  const numY = cardY + CARD_H + Math.max(...yOff) + 24
  cards.value.forEach((c, i) => {
    const xAnchor = startX + i * (CARD_W + CARD_GAP)
    const centerX = xAnchor + CARD_W / 2
    ctx.font = 'italic 600 26px Georgia, serif'
    ctx.fillStyle = `rgba(${GOLD},0.78)`
    ctx.fillText(`0${i + 1}`, centerX, numY)
    ctx.font = '400 18px "Noto Sans KR","Apple SD Gothic Neo",sans-serif'
    ctx.fillStyle = `rgba(${GOLD_SOFT},0.84)`
    ctx.fillText(c.reversed ? `${c.nameKo}  ·  역방향` : c.nameKo, centerX, numY + 44)
  })

  // 푸터
  const footY = H - 62
  gradLine(ctx, footY, cx, 110, 0.47)
  ctx.beginPath()
  ctx.arc(cx, footY + 1, 2, 0, Math.PI * 2)
  ctx.fillStyle = `rgb(${GOLD_DEEP})`
  ctx.fill()
  ctx.font = '400 14px Georgia, serif'
  ctx.fillStyle = `rgba(${GOLD_DEEP},0.75)`
  ctx.fillText('O N E   T O   O N E   R E A D I N G', cx, footY + 14)
}

async function onDraw() {
  drawing.value = true
  try {
    cards.value = drawThree()
    summary.value = cards.value
      .map((c, i) => `${i + 1}. ${c.nameKo} (${c.nameEn}) - ${c.reversed ? '역방향' : '정방향'}  [${c.id}]`)
      .join('\n')
    // 폰트 로드 후 렌더 (한글 깨짐 방지)
    if (document.fonts && document.fonts.ready) await document.fonts.ready
    await render()
    previewUrl.value = canvasRef.value.toDataURL('image/png')
  } catch (e) {
    alert('카드 이미지를 불러오지 못했어요. 다시 시도해주세요.\n' + e.message)
  } finally {
    drawing.value = false
  }
}

function fileName() {
  const name = nickname.value.trim()
  return name ? `[${name}] 카드뽑기.png` : 'card-draw.png'
}

function onSave() {
  const canvas = canvasRef.value
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(summary.value)
    alert('카드 정보 복사됨 (편지 작성 때 붙여넣기)')
  } catch {
    /* clipboard 미지원 시 무시 */
  }
}

onMounted(() => {
  // 첫 진입 시 자동 한 번 뽑기
  onDraw()
})
</script>

<template>
  <div class="draw-tool">
    <h1 class="dt-title">🔮 카드 뽑기 <span>운영자 전용</span></h1>

    <div class="dt-controls">
      <input
        v-model="nickname"
        class="dt-input"
        type="text"
        placeholder="닉네임 (선택)"
        @keyup.enter="onDraw"
      />
      <button class="dt-btn dt-btn--primary" :disabled="drawing" @click="onDraw">
        {{ drawing ? '뽑는 중…' : '카드 3장 뽑기' }}
      </button>
    </div>

    <div class="dt-canvas-wrap">
      <!-- 렌더 전용(화면 비표시). 실제 표시는 아래 <img> (모바일 길게눌러 저장 지원) -->
      <canvas ref="canvasRef" :width="W" :height="H" class="dt-canvas-hidden"></canvas>
      <img v-if="previewUrl" :src="previewUrl" class="dt-result-img" alt="뽑은 카드 3장" />
      <div v-else class="dt-placeholder">뽑는 중…</div>
    </div>

    <p class="dt-hint">💡 [이미지 다운로드]가 안 되면 위 이미지를 길게 눌러 저장하세요.</p>

    <pre v-if="summary" class="dt-summary">{{ summary }}</pre>

    <div class="dt-actions">
      <button class="dt-btn" @click="onSave">이미지 다운로드</button>
      <button class="dt-btn dt-btn--ghost" @click="copySummary">카드 정보 복사</button>
    </div>
  </div>
</template>

<style scoped>
.draw-tool {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 16px 60px;
  color: #dce8ff;
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
}
.dt-title {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 18px;
}
.dt-title span {
  font-size: 12px;
  color: #7e8aa8;
  margin-left: 6px;
}
.dt-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}
.dt-input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(199, 215, 248, 0.2);
  background: rgba(13, 21, 40, 0.6);
  color: #f4f8ff;
  font-size: 15px;
}
.dt-input::placeholder { color: #7e8aa8; }
.dt-btn {
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid rgba(212, 169, 94, 0.4);
  background: rgba(45, 108, 223, 0.12);
  color: #f4f8ff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}
.dt-btn:disabled { opacity: 0.5; }
.dt-btn--primary {
  background: linear-gradient(135deg, #2d6cdf, #4da3ff);
  border-color: transparent;
  white-space: nowrap;
}
.dt-btn--ghost { background: transparent; }
.dt-canvas-wrap {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  background: #05070d;
  aspect-ratio: 1 / 1;
}
.dt-canvas-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.dt-result-img {
  width: 100%;
  height: auto;
  display: block;
}
.dt-placeholder {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7e8aa8;
  font-size: 14px;
}
.dt-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #7e8aa8;
  text-align: center;
  line-height: 1.6;
}
.dt-summary {
  margin-top: 16px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(13, 21, 40, 0.7);
  border: 1px solid rgba(199, 215, 248, 0.12);
  color: #a7b7d6;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: keep-all;
  font-family: 'Noto Sans KR', monospace;
}
.dt-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
.dt-actions .dt-btn { flex: 1; }
</style>
