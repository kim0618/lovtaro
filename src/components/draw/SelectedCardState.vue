<script setup>
defineProps({
  card: {
    type: Object,
    default: null,
  },
  label: { type: String, default: '선택한 카드' },
})
</script>

<template>
  <div class="selected-card-state">
    <p class="selected-card-state__label">{{ label }}</p>
    <div v-if="card" class="selected-card-state__card">
      <div class="selected-card-state__display">
        <div class="selected-card-state__frame">
          <svg class="selected-card-state__art" viewBox="0 0 120 198" fill="none">
            <rect x="4" y="4" width="112" height="190" rx="6" stroke="#C8A96E" stroke-opacity="0.4" stroke-width="1"/>
            <rect x="9" y="9" width="102" height="180" rx="4" stroke="#C8A96E" stroke-opacity="0.2" stroke-width="0.5"/>
            <path d="M13 21 Q13 13 21 13" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="0.8" fill="none"/>
            <path d="M107 21 Q107 13 99 13" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="0.8" fill="none"/>
            <path d="M13 177 Q13 185 21 185" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="0.8" fill="none"/>
            <path d="M107 177 Q107 185 99 185" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="0.8" fill="none"/>
            <circle cx="60" cy="32" r="5" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
            <line x1="60" y1="40" x2="60" y2="68" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <circle cx="60" cy="99" r="29" stroke="#C8A96E" stroke-opacity="0.22" stroke-width="0.5" fill="none"/>
            <path d="M60 73 L86 99 L60 125 L34 99Z" stroke="#C8A96E" stroke-opacity="0.3" stroke-width="0.6" fill="none"/>
            <circle cx="60" cy="99" r="18" stroke="#C8A96E" stroke-opacity="0.35" stroke-width="0.5" fill="none"/>
            <path d="M40 99 C48 85 54 81 60 81 C66 81 72 85 80 99 C72 113 66 117 60 117 C54 117 48 113 40 99Z" stroke="#C8A96E" stroke-opacity="0.65" stroke-width="0.9" fill="none"/>
            <circle cx="60" cy="99" r="8" stroke="#C8A96E" stroke-opacity="0.55" stroke-width="0.6" fill="none"/>
            <circle cx="60" cy="99" r="3.5" fill="#C8A96E" fill-opacity="0.65"/>
            <line x1="60" y1="130" x2="60" y2="158" stroke="#C8A96E" stroke-opacity="0.15" stroke-width="0.4"/>
            <circle cx="60" cy="166" r="5" stroke="#C8A96E" stroke-opacity="0.5" stroke-width="0.6" fill="#C8A96E" fill-opacity="0.12"/>
          </svg>
          <div class="selected-card-state__mist" />
        </div>
      </div>
      <p class="selected-card-state__chosen">선택됨</p>
    </div>
    <div v-else class="selected-card-state__empty">
      <div class="selected-card-state__placeholder" />
      <p class="selected-card-state__hint">손이 머무는 카드를 골라보세요</p>
    </div>
  </div>
</template>

<style scoped>
.selected-card-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-md);
  padding: var(--lt-space-lg) var(--lt-space-md);
}

.selected-card-state__label {
  font-size: 0.78rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.selected-card-state__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
}

.selected-card-state__display {
  position: relative;
  animation: preview-float 5s ease-in-out infinite;
}

@keyframes preview-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.selected-card-state__frame {
  width: 80px;
  height: 132px;
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, #101A31 0%, #0A1020 50%, #060A14 100%);
  border: 1.5px solid rgba(200, 169, 110, 0.45);
  box-shadow:
    0 0 0 1px rgba(200, 169, 110, 0.12),
    0 0 20px rgba(200, 169, 110, 0.22),
    0 0 50px rgba(77, 163, 255, 0.12),
    0 8px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  animation: preview-glow 2.4s ease-in-out infinite;
}

@keyframes preview-glow {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(200, 169, 110, 0.12),
      0 0 20px rgba(200, 169, 110, 0.22),
      0 0 50px rgba(77, 163, 255, 0.12),
      0 8px 30px rgba(0, 0, 0, 0.5);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(212, 184, 122, 0.25),
      0 0 28px rgba(200, 169, 110, 0.35),
      0 0 70px rgba(77, 163, 255, 0.2),
      0 8px 30px rgba(0, 0, 0, 0.5);
  }
}

.selected-card-state__art {
  width: 100%;
  height: 100%;
}

/* 연기 */
.selected-card-state__mist {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 150%;
  height: 40px;
  background:
    radial-gradient(ellipse 50px 18px at 40% 100%, rgba(200, 169, 110, 0.12) 0%, transparent 70%),
    radial-gradient(ellipse 55px 16px at 50% 100%, rgba(77, 163, 255, 0.07) 0%, transparent 65%);
  filter: blur(10px);
  animation: mist-rise 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 5;
}

@keyframes mist-rise {
  0%   { opacity: 0; transform: translateX(-50%) translateY(0) scaleX(1); }
  20%  { opacity: 0.35; }
  65%  { opacity: 0.15; }
  100% { opacity: 0; transform: translateX(-50%) translateY(-18px) scaleX(1.4); }
}

.selected-card-state__chosen {
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.selected-card-state__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
}

.selected-card-state__placeholder {
  width: 80px;
  height: 132px;
  border: 1px dashed rgba(199, 215, 248, 0.2);
  border-radius: var(--lt-radius-sm);
  background: linear-gradient(170deg, rgba(10, 16, 32, 0.6) 0%, rgba(5, 7, 13, 0.4) 100%);
}

.selected-card-state__hint {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
}

@media (prefers-reduced-motion: reduce) {
  .selected-card-state__display,
  .selected-card-state__frame,
  .selected-card-state__eye {
    animation: none;
  }
  .selected-card-state__mist {
    display: none;
  }
}
</style>
