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
  <div class="newyear-card-grid">
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      class="newyear-card-grid__slot lt-appear"
      :class="`lt-appear--delay-${index + 1}`"
    >
      <p class="newyear-card-grid__position">{{ card.position }}</p>
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
/* 2x2 배치: 1~3월 → 4~6월 / 7~9월 → 10~12월 순서로 읽힘 */
.newyear-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--lt-space-xl) var(--lt-space-lg);
  justify-items: center;
  padding: 0 var(--lt-space-md);
  overflow: hidden;
}

.newyear-card-grid__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lt-space-sm);
}

.newyear-card-grid__slot:nth-child(odd) {
  justify-self: end;
}

.newyear-card-grid__slot:nth-child(even) {
  justify-self: start;
}

.newyear-card-grid :deep(.card-image-block) {
  padding: 0;
  width: 100%;
  margin-top: 10px;
}

.newyear-card-grid :deep(.card-image-block__frame) {
  width: clamp(80px, 27vw, 130px);
  height: clamp(132px, 44vw, 214px);
}

.newyear-card-grid :deep(.card-image-block__keywords) {
  display: none;
}

.newyear-card-grid__position {
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.7;
}
</style>
