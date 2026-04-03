<template>
  <div class="section-divider" role="separator">
    <span class="section-divider__dot" />
    <span class="section-divider__line" />
    <span class="section-divider__dot" />
  </div>
</template>

<style scoped>
.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: var(--lt-space-sm) var(--lt-space-xl);
}

.section-divider__line {
  width: 48px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(77, 163, 255, 0.2) 30%,
    rgba(77, 163, 255, 0.2) 70%,
    transparent 100%
  );
}

.section-divider__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: rgba(77, 163, 255, 0.3);
}
</style>
