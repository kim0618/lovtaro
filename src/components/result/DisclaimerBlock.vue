<template>
  <div class="disclaimer-block" role="contentinfo">
    <p class="disclaimer-block__text">
      이 리딩은 지금의 감정을 비추는 거울입니다.<br>
      카드는 흐름을 살필 뿐, 관계를 단정하지는 않습니다.
    </p>
    <p class="disclaimer-block__legal">
      Lovtaro의 타로 리딩은 오락 및 자기 성찰 목적으로만 제공되며,
      전문적인 심리 상담, 의료 조언, 법률 자문을 대체하지 않습니다.
      리딩 결과에 기반한 의사결정은 전적으로 이용자 본인의 책임입니다.
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
  padding: var(--lt-space-md) 0 var(--lt-space-sm);
  border-top: 1px solid var(--lt-border-soft);
  letter-spacing: 0.02em;
  opacity: 0.65;
}

.disclaimer-block__legal {
  font-size: 0.65rem;
  color: var(--lt-text-muted);
  text-align: center;
  line-height: 1.8;
  letter-spacing: 0.02em;
  opacity: 0.4;
  padding: 0 var(--lt-space-sm);
}
</style>
