<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const error = ref(null)
const router = useRouter()

onErrorCaptured((err, instance, info) => {
  console.error('[ErrorBoundary]', err, '\nComponent:', instance, '\nInfo:', info)
  error.value = err
  return false
})

function reset() {
  error.value = null
  router.push('/')
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <div class="error-boundary__inner">
      <div class="error-boundary__icon" aria-hidden="true">
        <svg viewBox="0 0 28 14" fill="none" width="28">
          <path d="M1 7C4 0.5 9 0 14 0s10 0.5 13 7c-3 6.5-8 7-13 7S4 13.5 1 7Z" stroke="currentColor" stroke-width="0.7"/>
          <circle cx="14" cy="7" r="3.5" stroke="currentColor" stroke-width="0.6"/>
          <circle cx="14" cy="7" r="1" fill="currentColor"/>
        </svg>
      </div>
      <p class="error-boundary__title">잠시 흐름이 끊겼어요</p>
      <p class="error-boundary__sub">예상치 못한 오류가 발생했습니다.<br>처음으로 돌아가서 다시 시작해봐요.</p>
      <button class="error-boundary__btn" @click="reset">처음으로</button>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: var(--lt-space-xl) var(--lt-space-md);
  background: var(--lt-bg-0);
}

.error-boundary__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-md);
  text-align: center;
  max-width: 320px;
}

.error-boundary__icon {
  color: var(--lt-text-muted);
  opacity: 0.3;
  margin-bottom: var(--lt-space-sm);
}

.error-boundary__title {
  font-size: 1.1rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.02em;
}

.error-boundary__sub {
  font-size: 0.82rem;
  color: var(--lt-text-muted);
  line-height: 1.8;
}

.error-boundary__btn {
  margin-top: var(--lt-space-sm);
  padding: 10px 32px;
  background: var(--lt-btn-primary-bg);
  color: #F4F8FF;
  border-radius: var(--lt-radius-sm);
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  transition: background var(--lt-transition), box-shadow var(--lt-transition);
  box-shadow: 0 4px 16px rgba(45, 108, 223, 0.18);
}

.error-boundary__btn:hover {
  background: var(--lt-btn-primary-hover);
  box-shadow: 0 6px 24px rgba(45, 108, 223, 0.28);
}
</style>
