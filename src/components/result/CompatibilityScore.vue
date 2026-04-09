<script setup>
defineProps({
  score: { type: Number, required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <div class="compat-score">
    <div class="compat-score__glow" aria-hidden="true" />
    <p class="compat-score__number">{{ score }}<span class="compat-score__percent">%</span></p>
    <p class="compat-score__label">{{ label }}</p>
  </div>
</template>

<style scoped>
.compat-score {
  position: relative;
  text-align: center;
  padding: var(--lt-space-2xl) var(--lt-space-md) var(--lt-space-lg);
  overflow: hidden;
}

.compat-score__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(212, 184, 122, 0.18) 0%, rgba(200, 169, 110, 0.08) 35%, transparent 65%),
    radial-gradient(circle at 40% 45%, rgba(77, 163, 255, 0.06) 0%, transparent 50%);
  filter: blur(35px);
  pointer-events: none;
  animation: compat-glow-pulse 4s ease-in-out infinite;
}

@keyframes compat-glow-pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -55%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -55%) scale(1.12); }
}

.compat-score__number {
  position: relative;
  font-family: var(--lt-font-title);
  font-size: 4.5rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1;
  background: linear-gradient(135deg, #D4B87A 0%, #E8D09A 40%, #C8A96E 70%, #D4B87A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--lt-space-xs);
  filter: drop-shadow(0 0 20px rgba(212, 184, 122, 0.25));
}

.compat-score__percent {
  font-size: 2.5rem;
  letter-spacing: 0;
}

.compat-score__label {
  position: relative;
  font-size: 0.88rem;
  color: var(--lt-text-sub);
  letter-spacing: 0.1em;
  font-weight: 300;
}
</style>
