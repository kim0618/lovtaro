<script setup>
import { ref, computed } from 'vue'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import { getReadingHistory, clearReadingHistory } from '../composables/useReadingHistory.js'

const history = ref(getReadingHistory())
const isEmpty = computed(() => history.value.length === 0)

function formatDate(ts) {
  const d = new Date(ts)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hours}:${mins}`
}

const confirmingClear = ref(false)

function handleClear() {
  confirmingClear.value = true
}

function confirmClear() {
  clearReadingHistory()
  history.value = []
  confirmingClear.value = false
}

function cancelClear() {
  confirmingClear.value = false
}
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="history-header">
        <h1 class="history-header__title">리딩 기록</h1>
        <p class="history-header__sub">지난 리딩의 흐름을 돌아봅니다</p>
      </div>
    </PageContainer>

    <!-- Empty state -->
    <SectionBlock v-if="isEmpty" spacing="md">
      <div class="history-empty">
        <div class="history-empty__icon" aria-hidden="true">
          <svg viewBox="0 0 28 14" fill="none" width="32">
            <path d="M1 7C4 0.5 9 0 14 0s10 0.5 13 7c-3 6.5-8 7-13 7S4 13.5 1 7Z" stroke="currentColor" stroke-width="0.7" />
            <circle cx="14" cy="7" r="3.5" stroke="currentColor" stroke-width="0.6" />
            <circle cx="14" cy="7" r="1" fill="currentColor" />
          </svg>
        </div>
        <p class="history-empty__text">아직 리딩 기록이 없어요</p>
        <p class="history-empty__sub">카드를 뽑으면 여기에 기록이 남습니다</p>
      </div>
    </SectionBlock>

    <!-- History list -->
    <template v-else>
      <SectionBlock spacing="sm">
        <div class="history-list">
          <div
            v-for="entry in history"
            :key="entry.id"
            class="history-item"
          >
            <div class="history-item__header">
              <span class="history-item__type">{{ entry.readingType }}</span>
              <span class="history-item__date">{{ formatDate(entry.timestamp) }}</span>
            </div>
            <div class="history-item__cards">
              <span
                v-for="card in entry.cards"
                :key="card.id"
                class="history-item__card"
                :class="{ 'history-item__card--reversed': card.reversed }"
              >
                {{ card.name }}
                <span v-if="card.reversed" class="history-item__reversed">역</span>
                <span v-if="card.position" class="history-item__position">{{ card.position }}</span>
              </span>
            </div>
            <p v-if="entry.summary" class="history-item__summary">{{ entry.summary }}</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock spacing="md">
        <div class="history-clear-wrap">
          <template v-if="!confirmingClear">
            <button class="history-clear" @click="handleClear">기록 전체 삭제</button>
          </template>
          <template v-else>
            <p class="history-clear-confirm__text">정말 모든 기록을 삭제할까요?</p>
            <div class="history-clear-confirm__actions">
              <button class="history-clear-confirm__cancel" @click="cancelClear">취소</button>
              <button class="history-clear-confirm__ok" @click="confirmClear">삭제</button>
            </div>
          </template>
        </div>
      </SectionBlock>
    </template>
  </AppShell>
</template>

<style scoped>
.history-header {
  text-align: center;
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-lg);
}

.history-header__title {
  font-size: 1.6rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  margin-bottom: 6px;
}

.history-header__sub {
  font-size: 0.85rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
}

/* ── Empty state ── */
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--lt-space-2xl) var(--lt-space-md);
  gap: var(--lt-space-sm);
}

.history-empty__icon {
  color: var(--lt-text-muted);
  opacity: 0.3;
  margin-bottom: var(--lt-space-sm);
}

.history-empty__text {
  font-size: 0.92rem;
  color: var(--lt-text-sub);
}

.history-empty__sub {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
}

/* ── History list ── */
.history-list {
  display: flex;
  flex-direction: column;
  padding: 0 var(--lt-space-md);
}

.history-item {
  padding: var(--lt-space-lg) 0;
  border-bottom: 1px solid var(--lt-border-soft);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
}

.history-item:last-child {
  border-bottom: none;
}

.history-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item__type {
  font-size: 0.78rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.history-item__date {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
}

.history-item__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-item__card {
  font-size: 0.88rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  padding: 4px 10px;
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-sm);
  background: var(--lt-panel);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.history-item__card--reversed {
  border-color: rgba(77, 163, 255, 0.2);
}

.history-item__reversed {
  font-size: 0.58rem;
  color: var(--lt-accent-2);
  opacity: 0.7;
}

.history-item__position {
  font-size: 0.6rem;
  color: var(--lt-text-muted);
  margin-left: 2px;
}

.history-item__summary {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  line-height: 1.7;
}

/* ── Clear button ── */
.history-clear-wrap {
  display: flex;
  justify-content: center;
  padding: 0 var(--lt-space-md);
}

.history-clear {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
  padding: var(--lt-space-xs) var(--lt-space-md);
  transition: opacity var(--lt-transition), color var(--lt-transition);
}

.history-clear:hover {
  opacity: 1;
  color: var(--lt-text-sub);
}

/* ── Confirm delete ── */
.history-clear-confirm__text {
  font-size: 0.82rem;
  color: var(--lt-text-sub);
  text-align: center;
  margin-bottom: var(--lt-space-sm);
}

.history-clear-confirm__actions {
  display: flex;
  justify-content: center;
  gap: var(--lt-space-sm);
}

.history-clear-confirm__cancel {
  font-size: 0.78rem;
  color: var(--lt-text-muted);
  padding: var(--lt-space-xs) var(--lt-space-md);
  border: 1px solid var(--lt-border-soft);
  border-radius: var(--lt-radius-sm);
  background: var(--lt-panel);
  transition: color var(--lt-transition), border-color var(--lt-transition);
}

.history-clear-confirm__cancel:hover {
  color: var(--lt-text-sub);
  border-color: var(--lt-line-soft);
}

.history-clear-confirm__ok {
  font-size: 0.78rem;
  color: #F4F8FF;
  padding: var(--lt-space-xs) var(--lt-space-md);
  border: 1px solid rgba(200, 60, 60, 0.3);
  border-radius: var(--lt-radius-sm);
  background: rgba(180, 40, 40, 0.18);
  transition: background var(--lt-transition), border-color var(--lt-transition);
}

.history-clear-confirm__ok:hover {
  background: rgba(180, 40, 40, 0.3);
  border-color: rgba(200, 60, 60, 0.5);
}
</style>
