<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  to: { type: String, required: true },
  tag: { type: String, default: '' },
  featured: { type: Boolean, default: false },
})

const router = useRouter()
</script>

<template>
  <button
    class="tarot-menu-card"
    :class="{ 'tarot-menu-card--featured': featured }"
    @click="router.push(props.to)"
  >
    <div class="tarot-menu-card__body">
      <span v-if="tag" class="tarot-menu-card__tag">{{ tag }}</span>
      <div class="tarot-menu-card__text">
        <h3 class="tarot-menu-card__title">{{ title }}</h3>
        <p class="tarot-menu-card__desc">{{ description }}</p>
      </div>
    </div>
    <span class="tarot-menu-card__arrow" aria-hidden="true">&#8594;</span>
  </button>
</template>

<style scoped>
.tarot-menu-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid var(--lt-border-soft);
  padding: var(--lt-space-lg) 0;
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.tarot-menu-card:hover {
  opacity: 0.75;
}

.tarot-menu-card--featured {
  position: relative;
}

.tarot-menu-card--featured::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 28px;
  background: linear-gradient(to bottom, var(--lt-accent-2), transparent);
  opacity: 0.5;
}

.tarot-menu-card--featured .tarot-menu-card__title {
  color: var(--lt-text-strong);
}

.tarot-menu-card__body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.tarot-menu-card__tag {
  font-size: 0.6rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.8;
}

.tarot-menu-card__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tarot-menu-card__title {
  font-family: var(--lt-font-sans);
  font-size: 0.98rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.01em;
}

.tarot-menu-card__desc {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  line-height: 1.5;
}

.tarot-menu-card__arrow {
  font-size: 0.8rem;
  color: var(--lt-text-muted);
  flex-shrink: 0;
  margin-left: var(--lt-space-md);
  transition: transform var(--lt-transition), color var(--lt-transition);
}

.tarot-menu-card:hover .tarot-menu-card__arrow {
  transform: translateX(3px);
  color: var(--lt-accent-2);
}
</style>
