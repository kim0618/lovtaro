<template>
  <div class="disclaimer-block">
    <p class="disclaimer-block__text">
      이 리딩은 지금의 감정을 비추는 거울입니다.<br>
      카드는 흐름을 살필 뿐, 관계를 단정하지는 않습니다.
    </p>
  </div>
</template>

<style scoped>
.disclaimer-block {
  padding: 0 var(--lt-space-md);
}

.disclaimer-block__text {
  font-size: 0.73rem;
  color: var(--lt-text-muted);
  text-align: center;
  line-height: 1.9;
  padding: var(--lt-space-md) 0;
  border-top: 1px solid var(--lt-border-soft);
  letter-spacing: 0.01em;
  opacity: 0.6;
}
</style>
