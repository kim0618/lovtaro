<script setup>
defineProps({
  imageSrc:    { type: String,  default: '' },
  cardName:    { type: String,  default: '' },
  cardNameEn:  { type: String,  default: '' },
  keywords:    { type: Array,   default: () => [] },
  energy:      { type: String,  default: 'neutral' },
  reversed:    { type: Boolean, default: false },
})
</script>

<template>
  <div class="card-image-block">

    <!-- 외부 오라 래퍼 (overflow: visible) -->
    <div
      class="card-image-block__aura-wrap"
      :class="`card-image-block__aura-wrap--${energy}`"
    >
      <!-- 외부 발광 링 -->
      <div class="card-image-block__halo" />

      <!-- 카드 프레임 -->
      <div
        class="card-image-block__frame"
        :class="[
          `card-image-block__frame--${energy}`,
          { 'card-image-block__frame--reversed': reversed }
        ]"
      >
        <!-- 이미지 있을 때 -->
        <img
          v-if="imageSrc"
          :src="imageSrc"
          :alt="cardName"
          class="card-image-block__img"
        />

        <!-- 이미지 없는 fallback: 앞면 성좌 디자인 -->
        <svg v-else class="card-image-block__fallback-svg" viewBox="0 0 130 214" fill="none">
          <!-- 외곽 테두리 -->
          <rect x="4" y="4" width="122" height="206" rx="7" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.8"/>
          <rect x="9" y="9" width="112" height="196" rx="5" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
          <!-- 코너 장식 -->
          <path d="M14 23 Q14 14 23 14" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.7" fill="none"/>
          <path d="M116 23 Q116 14 107 14" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.7" fill="none"/>
          <path d="M14 191 Q14 200 23 200" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.7" fill="none"/>
          <path d="M116 191 Q116 200 107 200" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.7" fill="none"/>
          <!-- 상단 달 위상 -->
          <circle cx="47" cy="36" r="5.5" stroke="#C8A96E" stroke-opacity="0.38" stroke-width="0.6" fill="none"/>
          <circle cx="49.5" cy="34.5" r="4.3" fill="#060A14"/>
          <circle cx="65" cy="36" r="5.5" stroke="#C8A96E" stroke-opacity="0.42" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.1"/>
          <circle cx="83" cy="36" r="5.5" stroke="#C8A96E" stroke-opacity="0.38" stroke-width="0.6" fill="none"/>
          <circle cx="80.5" cy="34.5" r="4.3" fill="#060A14"/>
          <!-- 성좌: 인연의 별자리 -->
          <!-- 주 별 (큰 별 2개) -->
          <circle cx="43" cy="72" r="3.5" fill="#C8A96E" fill-opacity="0.7"/>
          <circle cx="43" cy="72" r="7" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
          <circle cx="43" cy="72" r="10" stroke="#C8A96E" stroke-opacity="0.08" stroke-width="0.3" fill="none"/>
          <circle cx="88" cy="63" r="2.8" fill="#C8A96E" fill-opacity="0.6"/>
          <circle cx="88" cy="63" r="5.5" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5" fill="none"/>
          <!-- 주 연결선 -->
          <line x1="43" y1="72" x2="88" y2="63" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.6"/>
          <!-- 보조 별 -->
          <circle cx="30" cy="56" r="1.8" fill="#C8A96E" fill-opacity="0.45"/>
          <circle cx="65" cy="58" r="2" fill="#C8A96E" fill-opacity="0.4"/>
          <circle cx="100" cy="76" r="1.5" fill="#C8A96E" fill-opacity="0.35"/>
          <circle cx="54" cy="82" r="1.3" fill="#C8A96E" fill-opacity="0.3"/>
          <circle cx="78" cy="80" r="1.1" fill="#C8A96E" fill-opacity="0.25"/>
          <!-- 보조 연결선 -->
          <line x1="30" y1="56" x2="43" y2="72" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
          <line x1="43" y1="72" x2="65" y2="58" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
          <line x1="65" y1="58" x2="88" y2="63" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
          <line x1="88" y1="63" x2="100" y2="76" stroke="#C8A96E" stroke-opacity="0.1" stroke-width="0.3"/>
          <line x1="43" y1="72" x2="54" y2="82" stroke="#C8A96E" stroke-opacity="0.1" stroke-width="0.3"/>
          <!-- 별먼지 -->
          <circle cx="22" cy="64" r="0.7" fill="#C8A96E" fill-opacity="0.22"/>
          <circle cx="38" cy="50" r="0.6" fill="#C8A96E" fill-opacity="0.18"/>
          <circle cx="73" cy="54" r="0.8" fill="#C8A96E" fill-opacity="0.16"/>
          <circle cx="96" cy="56" r="0.5" fill="#C8A96E" fill-opacity="0.14"/>
          <circle cx="50" cy="64" r="0.5" fill="#C8A96E" fill-opacity="0.15"/>
          <circle cx="82" cy="72" r="0.6" fill="#C8A96E" fill-opacity="0.12"/>
          <circle cx="60" cy="76" r="0.5" fill="#C8A96E" fill-opacity="0.1"/>
          <circle cx="108" cy="68" r="0.5" fill="#C8A96E" fill-opacity="0.1"/>
          <circle cx="20" cy="78" r="0.4" fill="#C8A96E" fill-opacity="0.08"/>
          <circle cx="35" cy="86" r="0.5" fill="#C8A96E" fill-opacity="0.08"/>
          <!-- 카드명 -->
          <text x="65" y="120" text-anchor="middle" font-size="14" fill="#F4F8FF" fill-opacity="0.92" font-weight="300" letter-spacing="2">{{ cardName }}</text>
          <text x="65" y="136" text-anchor="middle" font-size="7.5" fill="#C8A96E" fill-opacity="0.55" font-style="italic" letter-spacing="1.5">{{ cardNameEn }}</text>
          <!-- 하단 달 위상 -->
          <circle cx="47" cy="187" r="5.5" stroke="#C8A96E" stroke-opacity="0.38" stroke-width="0.6" fill="none"/>
          <circle cx="44.5" cy="188.5" r="4.3" fill="#060A14"/>
          <circle cx="65" cy="187" r="5.5" stroke="#C8A96E" stroke-opacity="0.42" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.1"/>
          <circle cx="83" cy="187" r="5.5" stroke="#C8A96E" stroke-opacity="0.38" stroke-width="0.6" fill="none"/>
          <circle cx="85.5" cy="188.5" r="4.3" fill="#060A14"/>
          <!-- 하단 별먼지 -->
          <circle cx="30" cy="175" r="0.6" fill="#C8A96E" fill-opacity="0.15"/>
          <circle cx="100" cy="178" r="0.5" fill="#C8A96E" fill-opacity="0.12"/>
          <circle cx="55" cy="170" r="0.5" fill="#C8A96E" fill-opacity="0.1"/>
        </svg>

        <!-- 이미지 있을 때 하단 그라디언트 -->
        <div v-if="imageSrc" class="card-image-block__img-overlay" />

        <!-- 내부 테두리 -->
        <div class="card-image-block__inner-border" />

        <!-- shimmer sweep -->
        <div class="card-image-block__shimmer" />
      </div>

      <!-- 카드 하단 연기 -->
      <div class="card-image-block__mist-a" />
      <div class="card-image-block__mist-b" />

      <!-- 카드에서 뿜어지는 별 파티클 -->
      <span class="card-image-block__spark card-image-block__spark--1" />
      <span class="card-image-block__spark card-image-block__spark--2" />
      <span class="card-image-block__spark card-image-block__spark--3" />
      <span class="card-image-block__spark card-image-block__spark--4" />
      <span class="card-image-block__spark card-image-block__spark--5" />
      <span class="card-image-block__spark card-image-block__spark--6" />
      <span class="card-image-block__spark card-image-block__spark--7" />
      <span class="card-image-block__spark card-image-block__spark--8" />
    </div>

    <div class="card-image-block__name-area">
      <span class="card-image-block__card-name">{{ cardName }}</span>
      <span v-if="cardNameEn" class="card-image-block__card-name-en">{{ cardNameEn }}</span>
    </div>

    <div v-if="reversed" class="card-image-block__reversed-badge">
      <span class="card-image-block__reversed-icon">↺</span>
      <span>역방향</span>
    </div>

    <div v-if="keywords.length" class="card-image-block__keywords">
      <span v-for="kw in keywords" :key="kw" class="card-image-block__keyword">{{ kw }}</span>
    </div>
  </div>
</template>

<style scoped>
.card-image-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-md);
  padding: 0 var(--lt-space-md);
}

/* ── 오라 래퍼: overflow visible, position relative ── */
.card-image-block__aura-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 외부 발광 링 */
.card-image-block__halo {
  position: absolute;
  inset: -8px;
  border-radius: calc(var(--lt-radius-md) + 8px);
  background: radial-gradient(ellipse 80% 80% at 50% 60%,
    rgba(200, 169, 110, 0.07) 0%,
    transparent 70%);
  animation: halo-pulse 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.card-image-block__aura-wrap--positive .card-image-block__halo {
  background: radial-gradient(ellipse 80% 80% at 50% 60%,
    rgba(200, 169, 110, 0.09) 0%,
    transparent 70%);
}
.card-image-block__aura-wrap--challenging .card-image-block__halo {
  background: radial-gradient(ellipse 80% 80% at 50% 60%,
    rgba(130, 80, 200, 0.07) 0%,
    transparent 70%);
}

@keyframes halo-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.03); }
}

/* ── 카드 프레임 ── */
.card-image-block__frame {
  width: 130px;
  height: 214px;
  border-radius: var(--lt-radius-md);
  overflow: hidden;
  border: 1px solid rgba(200, 169, 110, 0.28);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(200, 169, 110, 0.1),
    0 0 14px rgba(200, 169, 110, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: card-float 8s ease-in-out infinite, frame-glow 4s ease-in-out infinite;
}

@keyframes card-float {
  0%   { transform: perspective(1000px) translateY(0px)   rotateX(0deg)    rotateY(0deg); }
  20%  { transform: perspective(1000px) translateY(-6px)  rotateX(1.5deg)  rotateY(-1.5deg); }
  45%  { transform: perspective(1000px) translateY(-8px)  rotateX(0.8deg)  rotateY(0.5deg); }
  70%  { transform: perspective(1000px) translateY(-5px)  rotateX(-1deg)   rotateY(1.5deg); }
  100% { transform: perspective(1000px) translateY(0px)   rotateX(0deg)    rotateY(0deg); }
}

@keyframes frame-glow {
  0%, 100% {
    box-shadow:
      0 6px 24px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(200, 169, 110, 0.1),
      0 0 14px rgba(200, 169, 110, 0.08);
  }
  50% {
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.65),
      0 0 0 1px rgba(200, 169, 110, 0.2),
      0 0 20px rgba(200, 169, 110, 0.13);
  }
}

/* 에너지별 배경 */
.card-image-block__frame--positive {
  background: linear-gradient(170deg, #101A31 0%, #0A1020 100%);
}
.card-image-block__frame--neutral {
  background: linear-gradient(170deg, #0D1528 0%, #060A14 100%);
}
.card-image-block__frame--challenging {
  background: linear-gradient(170deg, #0E0D1A 0%, #05060D 100%);
}

.card-image-block__frame--reversed {
  border-color: rgba(143, 211, 255, 0.25);
}

.card-image-block__frame:hover {
  animation-play-state: paused;
}

/* shimmer sweep */
.card-image-block__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 30%,
    rgba(200, 169, 110, 0.08) 50%,
    transparent 70%
  );
  animation: shimmer-loop 6s ease-in-out infinite 1s;
  pointer-events: none;
  z-index: 3;
}

@keyframes shimmer-loop {
  0%, 60%, 100% { transform: translateX(-150%); opacity: 0; }
  70%            { transform: translateX(-150%); opacity: 0; }
  85%            { transform: translateX(150%);  opacity: 1; }
}

/* 이미지 */
.card-image-block__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* fallback SVG */
.card-image-block__fallback-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

/* 이미지 하단 오버레이 */
.card-image-block__img-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(5, 7, 13, 0.6) 0%, transparent 100%);
  pointer-events: none;
}

/* 내부 테두리 */
.card-image-block__inner-border {
  position: absolute;
  inset: 5px;
  border-radius: calc(var(--lt-radius-md) - 3px);
  border: 1px solid rgba(200, 169, 110, 0.1);
  pointer-events: none;
  z-index: 2;
}

/* ── 연기 효과 (카드 너비에 딱 붙는 좁은 범위) ── */
.card-image-block__mist-a {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 28px;
  background:
    radial-gradient(ellipse 40px 14px at 50% 100%, rgba(200, 169, 110, 0.1) 0%, transparent 70%);
  filter: blur(8px);
  animation: mist-rise-a 5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.card-image-block__mist-b {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 20px;
  background:
    radial-gradient(ellipse 36px 10px at 50% 100%, rgba(77, 163, 255, 0.07) 0%, transparent 68%);
  filter: blur(7px);
  animation: mist-rise-b 5s ease-in-out infinite 1.5s;
  pointer-events: none;
  z-index: 0;
}

@keyframes mist-rise-a {
  0%   { opacity: 0;    transform: translateX(-50%) translateY(0)    scaleX(1); }
  20%  { opacity: 0.55; }
  65%  { opacity: 0.25; }
  100% { opacity: 0;    transform: translateX(-50%) translateY(-14px) scaleX(1.25); }
}
@keyframes mist-rise-b {
  0%   { opacity: 0;    transform: translateX(-50%) translateY(0)    scaleX(0.9); }
  25%  { opacity: 0.38; }
  70%  { opacity: 0.15; }
  100% { opacity: 0;    transform: translateX(-50%) translateY(-10px) scaleX(1.15); }
}

/* ── 카드 방사 별 파티클 (카드 뒤에서 나옴) ── */
.card-image-block__spark {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(0.4px);
}

/* 금색 sparks */
.card-image-block__spark--1,
.card-image-block__spark--3,
.card-image-block__spark--5,
.card-image-block__spark--7 {
  width: 3px;
  height: 3px;
  background: rgba(212, 184, 122, 0.95);
  box-shadow: 0 0 5px 2px rgba(200, 169, 110, 0.55);
}

/* 흰/파란 sparks */
.card-image-block__spark--2,
.card-image-block__spark--4,
.card-image-block__spark--6,
.card-image-block__spark--8 {
  width: 2.5px;
  height: 2.5px;
  background: rgba(220, 235, 255, 0.9);
  box-shadow: 0 0 5px 2px rgba(143, 211, 255, 0.5);
}

/* 위치 + 애니메이션 */
.card-image-block__spark--1 {
  top: 18%; left: 8%;
  animation: spark-ul 3.2s ease-out infinite 0s;
}
.card-image-block__spark--2 {
  top: 6%; left: 42%;
  animation: spark-up 2.8s ease-out infinite 0.7s;
}
.card-image-block__spark--3 {
  top: 14%; right: 8%;
  animation: spark-ur 3.5s ease-out infinite 1.4s;
}
.card-image-block__spark--4 {
  top: 38%; left: 2%;
  animation: spark-left 2.6s ease-out infinite 0.3s;
}
.card-image-block__spark--5 {
  top: 35%; right: 2%;
  animation: spark-right 3.0s ease-out infinite 1.8s;
}
.card-image-block__spark--6 {
  top: 65%; left: 6%;
  animation: spark-dl 2.4s ease-out infinite 1.0s;
}
.card-image-block__spark--7 {
  top: 62%; right: 6%;
  animation: spark-dr 3.8s ease-out infinite 2.2s;
}
.card-image-block__spark--8 {
  top: 10%; left: 28%;
  animation: spark-up 2.9s ease-out infinite 2.6s;
}

@keyframes spark-ul {
  0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
  15%  { opacity: 0.9; }
  100% { opacity: 0;   transform: translate(-38px, -55px) scale(0.3); }
}
@keyframes spark-up {
  0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
  15%  { opacity: 0.9; }
  100% { opacity: 0;   transform: translate(6px, -65px) scale(0.3); }
}
@keyframes spark-ur {
  0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
  15%  { opacity: 0.9; }
  100% { opacity: 0;   transform: translate(38px, -50px) scale(0.3); }
}
@keyframes spark-left {
  0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
  15%  { opacity: 0.85; }
  100% { opacity: 0;   transform: translate(-52px, -18px) scale(0.3); }
}
@keyframes spark-right {
  0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
  15%  { opacity: 0.85; }
  100% { opacity: 0;   transform: translate(52px, -15px) scale(0.3); }
}
@keyframes spark-dl {
  0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
  15%  { opacity: 0.8; }
  100% { opacity: 0;   transform: translate(-32px, 42px) scale(0.3); }
}
@keyframes spark-dr {
  0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
  15%  { opacity: 0.8; }
  100% { opacity: 0;   transform: translate(32px, 42px) scale(0.3); }
}

/* ── card name ── */
.card-image-block__name-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.card-image-block__card-name {
  display: block;
  font-size: 1.1rem;
  font-weight: 200;
  color: var(--lt-text-strong);
  letter-spacing: 0.06em;
}

.card-image-block__card-name-en {
  display: block;
  font-family: var(--lt-font-display);
  font-size: 0.75rem;
  color: var(--lt-text-muted);
  font-style: italic;
  letter-spacing: 0.06em;
}

/* ── reversed badge ── */
.card-image-block__reversed-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: rgba(143, 211, 255, 0.7);
  letter-spacing: 0.06em;
  background: rgba(77, 163, 255, 0.08);
  border: 1px solid rgba(77, 163, 255, 0.2);
  border-radius: var(--lt-radius-full);
  padding: 3px 10px 3px 8px;
}

.card-image-block__reversed-icon {
  font-size: 0.85rem;
  line-height: 1;
  opacity: 0.8;
}

/* ── keywords ── */
.card-image-block__keywords {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
}

.card-image-block__keyword {
  font-size: 0.7rem;
  color: var(--lt-text-muted);
  background-color: var(--lt-panel);
  border: 1px solid var(--lt-border-soft);
  padding: 3px 10px;
  border-radius: var(--lt-radius-sm);
  letter-spacing: 0.04em;
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .card-image-block__frame,
  .card-image-block__halo,
  .card-image-block__shimmer {
    animation: none;
  }
  .card-image-block__mist-a,
  .card-image-block__mist-b,
  .card-image-block__spark {
    display: none;
  }
}
</style>
