<script setup>
import { computed } from 'vue'
import { getCardImage } from '../../data/cardImages.js'

const props = defineProps({
  cardId: { type: String, default: '' },
  cardName: { type: String, default: '' },
  cardNameEn: { type: String, default: '' },
  readingType: { type: String, default: '' },
  reversed: { type: Boolean, default: false },
})

const frontImage = computed(() => getCardImage(props.cardId))
</script>

<template>
  <div class="card-reveal">
    <div class="card-reveal__glow" aria-hidden="true" />
    <p class="card-reveal__type">{{ readingType }}</p>
    <div class="card-reveal__card" :class="{ 'card-reveal__card--reversed': reversed }">
      <div class="card-reveal__card-inner">
        <div class="card-reveal__card-back">
          <svg class="card-reveal__card-art" viewBox="0 0 120 198" fill="none">
            <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="1"/>
            <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.18" stroke-width="0.5"/>
            <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.7" fill="none"/>
            <circle cx="40" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="42.5" cy="30.5" r="4" fill="#0A1020"/>
            <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
            <circle cx="80" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="77.5" cy="30.5" r="4" fill="#0A1020"/>
            <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>
            <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.28" stroke-width="0.6" fill="none"/>
            <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.32" stroke-width="0.5" fill="none"/>
            <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z" stroke="#C8A96E" stroke-opacity="0.6" stroke-width="0.8" fill="none"/>
            <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="none"/>
            <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.6"/>
            <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <circle cx="40" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="37.5" cy="167.5" r="4" fill="#0A1020"/>
            <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.45" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
            <circle cx="80" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="0.6" fill="none"/>
            <circle cx="82.5" cy="167.5" r="4" fill="#0A1020"/>
          </svg>
        </div>
        <div class="card-reveal__card-front">
          <img v-if="frontImage" :src="frontImage" :alt="cardName" class="card-reveal__card-front-img" />
          <template v-else>
            <svg class="card-reveal__card-front-art" viewBox="0 0 120 198" fill="none" aria-hidden="true">
              <rect x="8" y="8" width="104" height="182" rx="4" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
              <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.5" fill="none"/>
              <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.5" fill="none"/>
              <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.5" fill="none"/>
              <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.5" fill="none"/>
              <circle cx="40" cy="68" r="3" fill="#C8A96E" fill-opacity="0.7"/>
              <circle cx="82" cy="60" r="2.5" fill="#C8A96E" fill-opacity="0.6"/>
              <line x1="40" y1="68" x2="82" y2="60" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.6"/>
              <circle cx="28" cy="54" r="1.5" fill="#C8A96E" fill-opacity="0.45"/>
              <circle cx="60" cy="56" r="1.8" fill="#C8A96E" fill-opacity="0.4"/>
              <line x1="28" y1="54" x2="40" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
              <line x1="40" y1="68" x2="60" y2="56" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
              <line x1="60" y1="56" x2="82" y2="60" stroke="#C8A96E" stroke-opacity="0.12" stroke-width="0.4"/>
            </svg>
            <div class="card-reveal__card-front-content">
              <span class="card-reveal__card-name">{{ cardName }}</span>
              <span v-if="cardNameEn" class="card-reveal__card-en">{{ cardNameEn }}</span>
              <span v-if="reversed" class="card-reveal__card-orientation">역방향</span>
            </div>
          </template>
        </div>
      </div>
    </div>
    <p class="card-reveal__message">카드가 당신에게 전하는 이야기</p>
    <p class="card-reveal__hint">잠시 후 해석이 펼쳐집니다</p>
  </div>
</template>

<style scoped>
.card-reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16vh var(--lt-space-md) var(--lt-space-2xl);
  position: relative;
  overflow: hidden;
}

.card-reveal__glow {
  position: absolute;
  top: 28%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(77, 163, 255, 0.1) 0%, rgba(45, 108, 223, 0.04) 40%, transparent 70%);
  animation: reveal-ambient 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes reveal-ambient {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
}

.card-reveal__type {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.14em;
  margin-bottom: var(--lt-space-lg);
  opacity: 0;
  animation: lt-fade-in 500ms ease 200ms both;
}

.card-reveal__card {
  width: 110px;
  height: 180px;
  perspective: 1000px;
  margin-bottom: var(--lt-space-xl);
}

.card-reveal__card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: card-ritual-flip 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) 400ms both;
}

@keyframes card-ritual-flip {
  0% {
    transform: rotateY(0deg) scale(0.92);
  }
  30% {
    transform: rotateY(0deg) scale(1) translateY(-8px);
  }
  50% {
    transform: rotateY(90deg) scale(1) translateY(-8px);
  }
  75% {
    transform: rotateY(180deg) scale(1.03) translateY(-4px);
  }
  100% {
    transform: rotateY(180deg) scale(1) translateY(0);
  }
}

.card-reveal__card-back,
.card-reveal__card-front {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--lt-radius-md);
  overflow: hidden;
}

.card-reveal__card-back {
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1px solid rgba(200, 169, 110, 0.3);
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(200, 169, 110, 0.1);
}

.card-reveal__card-art {
  width: 100%;
  height: 100%;
}

.card-reveal__card-front {
  transform: rotateY(180deg);
  background: linear-gradient(170deg, var(--lt-bg-3) 0%, var(--lt-bg-2) 100%);
  border: 1px solid rgba(200, 169, 110, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(200, 169, 110, 0.08);
}

.card-reveal__card-front-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-reveal__card-front-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.card-reveal__card-front-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.card-reveal__card-name {
  font-size: 1.1rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.06em;
}

.card-reveal__card-en {
  font-family: var(--lt-font-display);
  font-size: 0.7rem;
  color: var(--lt-text-muted);
  font-style: italic;
  letter-spacing: 0.08em;
}

.card-reveal__card--reversed .card-reveal__card-front {
  transform: rotateY(180deg);
}

.card-reveal__card-orientation {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.1em;
  opacity: 0.8;
  margin-top: 4px;
}

.card-reveal__message {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.08em;
  opacity: 0;
  animation: lt-fade-in 500ms ease 1.6s both;
}

.card-reveal__hint {
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.1em;
  opacity: 0;
  margin-top: 40px;
  animation: lt-fade-in 400ms ease 1.9s both;
}

@media (prefers-reduced-motion: reduce) {
  .card-reveal__glow,
  .card-reveal__card-inner,
  .card-reveal__type,
  .card-reveal__message,
  .card-reveal__hint {
    animation: none;
    opacity: 1;
  }
  .card-reveal__card-inner {
    transform: rotateY(180deg);
  }
}
</style>
