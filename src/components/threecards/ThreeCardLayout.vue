<script setup>
import CardImageBlock from '../result/CardImageBlock.vue'

defineProps({
  cards: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="three-card-layout">
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      class="three-card-layout__slot lt-appear"
      :class="`lt-appear--delay-${index + 1}`"
    >
      <p class="three-card-layout__position">{{ card.position }}</p>
      <CardImageBlock
        :image-src="card.image"
        :card-name="card.name"
        :card-name-en="card.nameEn"
        :energy="card.energy"
        :reversed="card.reversed"
      />
    </div>
  </div>
</template>

<style scoped>
/* 삼각형 배치: 첫 번째 카드 위 중앙 */
.three-card-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--lt-space-xl) var(--lt-space-lg);
  justify-items: center;
  padding: 0 var(--lt-space-md);
  overflow: hidden;
}

.three-card-layout__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
}

/* 첫 번째 카드: 상단 중앙 */
.three-card-layout__slot:nth-child(1) {
  grid-column: 1 / 3;
  justify-self: center;
}

/* 두 번째, 세 번째: 하단 좌우 */
.three-card-layout__slot:nth-child(2) {
  justify-self: end;
}

.three-card-layout__slot:nth-child(3) {
  justify-self: start;
}

.three-card-layout :deep(.card-image-block) {
  padding: 0;
  width: 100%;
  margin-top: 10px;
}

.three-card-layout :deep(.card-image-block__frame) {
  width: clamp(80px, 27vw, 130px);
  height: clamp(132px, 44vw, 214px);
}

.three-card-layout :deep(.card-image-block__keywords) {
  display: none;
}

.three-card-layout__position {
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.7;
}
</style>
