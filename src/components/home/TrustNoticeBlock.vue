<template>
  <div class="trust-notice">
    <p class="trust-notice__text">
      Lovtaro의 리딩은 지금 흐르는 감정의 결을 비추는 거울입니다.<br>
      결과는 단정이 아닌, 방향을 살피는 조용한 해석입니다.
    </p>
  </div>
</template>

<style scoped>
.trust-notice {
  padding: 0 var(--lt-space-md);
}

.trust-notice__text {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  text-align: center;
  line-height: 1.9;
  padding: var(--lt-space-lg) var(--lt-space-md);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-md);
  background: var(--lt-panel);
  letter-spacing: 0.01em;
}
</style>
