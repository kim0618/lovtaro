<script setup>
defineProps({
  answer: {
    type: String,
    required: true,
    validator: v => ['yes', 'no', 'maybe'].includes(v),
  },
  answerLabel: {
    type: String,
    required: true,
  },
  answerDesc: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="yesno-badge" :class="`yesno-badge--${answer}`">
    <div class="yesno-badge__glow" aria-hidden="true" />
    <p class="yesno-badge__label">{{ answerLabel }}</p>
    <p class="yesno-badge__desc">{{ answerDesc }}</p>
  </div>
</template>

<style scoped>
.yesno-badge {
  position: relative;
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
  overflow: hidden;
}

.yesno-badge__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
}

.yesno-badge--yes .yesno-badge__glow {
  background: radial-gradient(circle, rgba(212, 184, 122, 0.6) 0%, transparent 70%);
}

.yesno-badge--no .yesno-badge__glow {
  background: radial-gradient(circle, rgba(120, 140, 180, 0.5) 0%, transparent 70%);
}

.yesno-badge--maybe .yesno-badge__glow {
  background: radial-gradient(circle, rgba(160, 130, 200, 0.5) 0%, transparent 70%);
}

.yesno-badge__label {
  position: relative;
  font-family: var(--lt-font-title);
  font-size: 2.4rem;
  font-weight: 400;
  letter-spacing: 0.35em;
  line-height: 1;
  margin-bottom: var(--lt-space-sm);
}

.yesno-badge--yes .yesno-badge__label {
  background: linear-gradient(135deg, #D4B87A 0%, #E8D09A 45%, #C8A96E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.yesno-badge--no .yesno-badge__label {
  color: var(--lt-text-sub);
  opacity: 0.8;
}

.yesno-badge--maybe .yesno-badge__label {
  background: linear-gradient(135deg, #B8A0D4 0%, #D4C0E8 45%, #A090C0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.yesno-badge__desc {
  position: relative;
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  letter-spacing: 0.04em;
  line-height: 1.6;
  max-width: 280px;
  margin: 0 auto;
}
</style>
