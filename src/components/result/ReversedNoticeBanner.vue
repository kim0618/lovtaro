<template>
  <div class="reversed-notice">
    <span class="reversed-notice__icon" aria-hidden="true">↕</span>
    <p class="reversed-notice__text">역방향 카드는 경고가 아니에요. 지금 그 에너지가 내면으로 향하고 있다는 신호로 읽어보세요.</p>
  </div>
</template>

<style scoped>
.reversed-notice {
  margin: 0 var(--lt-space-md);
  padding: 10px var(--lt-space-lg);
  background: rgba(200, 169, 110, 0.05);
  border: 1px solid rgba(200, 169, 110, 0.15);
  border-radius: var(--lt-radius-sm);
  display: flex;
  align-items: center;
  gap: var(--lt-space-sm);
}

.reversed-notice__icon {
  font-size: 0.7rem;
  color: rgba(200, 169, 110, 0.6);
  flex-shrink: 0;
  line-height: 1;
}

.reversed-notice__text {
  font-size: 0.74rem;
  color: var(--lt-text-muted);
  line-height: 1.65;
  letter-spacing: 0.02em;
  opacity: 0.85;
}
</style>
