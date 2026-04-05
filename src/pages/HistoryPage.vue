<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'

useHead({
  title: '리딩 기록 | Lovtaro',
  description: '나의 타로 리딩 기록을 확인합니다.',
})
import PageContainer from '../components/ui/PageContainer.vue'
import SectionBlock from '../components/ui/SectionBlock.vue'
import { getReadingHistory, clearReadingHistory, updateReadingMemo } from '../composables/useReadingHistory.js'

const history = ref(getReadingHistory())
const isEmpty = computed(() => history.value.length === 0)

function formatTime(ts) {
  const d = new Date(ts)
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${mins}`
}

function formatFullDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${formatTime(ts)}`
}

// Date grouping
function getDateKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getGroupLabel(dateKey) {
  const now = new Date()
  const today = getDateKey(now.getTime())
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return getDateKey(d.getTime()) })()

  if (dateKey === today) return '오늘'
  if (dateKey === yesterday) return '어제'

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  if (dateKey >= getDateKey(weekAgo.getTime())) return '이번 주'

  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  if (dateKey >= getDateKey(twoWeeksAgo.getTime())) return '지난 주'

  const [y, m, d] = dateKey.split('-')
  return `${parseInt(m)}월 ${parseInt(d)}일`
}

const groupedHistory = computed(() => {
  const groups = []
  const groupMap = new Map()

  for (const entry of history.value) {
    const key = getDateKey(entry.timestamp)
    const label = getGroupLabel(key)
    if (!groupMap.has(label)) {
      const group = { label, entries: [] }
      groupMap.set(label, group)
      groups.push(group)
    }
    groupMap.get(label).entries.push(entry)
  }
  return groups
})

const collapsedGroups = ref(new Set())

function toggleGroup(label) {
  if (collapsedGroups.value.has(label)) {
    collapsedGroups.value.delete(label)
  } else {
    collapsedGroups.value.add(label)
  }
  // Force reactivity
  collapsedGroups.value = new Set(collapsedGroups.value)
}

const INITIAL_SHOW = 5
const expandedGroups = ref(new Set())

function toggleShowAll(label) {
  if (expandedGroups.value.has(label)) {
    expandedGroups.value.delete(label)
  } else {
    expandedGroups.value.add(label)
  }
  expandedGroups.value = new Set(expandedGroups.value)
}

function visibleEntries(group) {
  if (expandedGroups.value.has(group.label) || group.entries.length <= INITIAL_SHOW) {
    return group.entries
  }
  return group.entries.slice(0, INITIAL_SHOW)
}

function hiddenCount(group) {
  if (expandedGroups.value.has(group.label)) return 0
  return Math.max(0, group.entries.length - INITIAL_SHOW)
}

const expandedId = ref(null)

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
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

const editingMemoId = ref(null)
const memoText = ref('')

function startMemo(entry) {
  editingMemoId.value = entry.id
  memoText.value = entry.memo || ''
}

function saveMemo(entryId) {
  const trimmed = memoText.value.trim()
  updateReadingMemo(entryId, trimmed)
  const entry = history.value.find(e => e.id === entryId)
  if (entry) entry.memo = trimmed
  editingMemoId.value = null
  memoText.value = ''
}

function cancelMemo() {
  editingMemoId.value = null
  memoText.value = ''
}

function onKeydown(e) {
  if (e.key === 'Escape' && confirmingClear.value) cancelClear()
  if (e.key === 'Escape' && editingMemoId.value) cancelMemo()
}
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // Auto-collapse old groups (keep first 2 open)
  if (groupedHistory.value.length > 2) {
    groupedHistory.value.slice(2).forEach(g => collapsedGroups.value.add(g.label))
    collapsedGroups.value = new Set(collapsedGroups.value)
  }
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
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
      <SectionBlock v-for="group in groupedHistory" :key="group.label" spacing="sm">
        <!-- Group header -->
        <div class="history-group__header" @click="toggleGroup(group.label)">
          <span class="history-group__label">{{ group.label }}</span>
          <span class="history-group__meta">
            <span class="history-group__count">{{ group.entries.length }}건</span>
            <span class="history-group__arrow" :class="{ 'history-group__arrow--collapsed': collapsedGroups.has(group.label) }">&#9662;</span>
          </span>
        </div>

        <!-- Group entries -->
        <div v-if="!collapsedGroups.has(group.label)" class="history-list">
          <div
            v-for="entry in visibleEntries(group)"
            :key="entry.id"
            :class="['history-item', { 'history-item--expanded': expandedId === entry.id }]"
          >
            <!-- Clickable header area -->
            <div class="history-item__top" @click="toggleExpand(entry.id)">
              <div class="history-item__header">
                <span class="history-item__type">{{ entry.readingType }}</span>
                <span class="history-item__date">{{ group.label === '오늘' || group.label === '어제' ? formatTime(entry.timestamp) : formatFullDate(entry.timestamp) }}</span>
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
              <p v-if="entry.summary && expandedId !== entry.id" class="history-item__summary">{{ entry.summary }}</p>
              <span class="history-item__toggle">{{ expandedId === entry.id ? '접기' : '자세히 보기' }}</span>
            </div>

            <!-- Expanded details -->
            <div v-if="expandedId === entry.id" class="history-item__detail">
              <div class="history-item__detail-divider"></div>

              <!-- Summary -->
              <div v-if="entry.summary" class="history-item__detail-section">
                <span class="history-item__detail-label">리딩 요약</span>
                <p class="history-item__detail-text">{{ entry.summary }}</p>
              </div>

              <!-- Emotion Tags -->
              <div v-if="entry.details?.emotionTags?.length" class="history-item__detail-section">
                <span class="history-item__detail-label">감정 키워드</span>
                <div class="history-item__detail-tags">
                  <span v-for="tag in entry.details.emotionTags" :key="tag" class="history-item__detail-tag">{{ tag }}</span>
                </div>
              </div>

              <!-- Advice -->
              <div v-if="entry.details?.advice?.length" class="history-item__detail-section">
                <span class="history-item__detail-label">조언</span>
                <ul class="history-item__detail-list">
                  <li v-for="(line, i) in entry.details.advice" :key="i">{{ line }}</li>
                </ul>
              </div>

              <!-- Caution -->
              <div v-if="entry.details?.caution?.length" class="history-item__detail-section">
                <span class="history-item__detail-label">주의</span>
                <ul class="history-item__detail-list history-item__detail-list--caution">
                  <li v-for="(line, i) in entry.details.caution" :key="i">{{ line }}</li>
                </ul>
              </div>

              <!-- No details fallback -->
              <p v-if="!entry.details" class="history-item__detail-empty">이전 기록은 상세 내용이 저장되지 않았습니다. 새로운 리딩부터 자세한 내용이 기록됩니다.</p>

              <!-- Memo -->
              <div class="history-item__memo-wrap">
                <template v-if="editingMemoId === entry.id">
                  <textarea
                    v-model="memoText"
                    class="history-item__memo-input"
                    placeholder="이 리딩에 대한 메모를 남겨보세요..."
                    rows="3"
                    maxlength="300"
                  ></textarea>
                  <div class="history-item__memo-actions">
                    <button class="history-item__memo-cancel" @click.stop="cancelMemo">취소</button>
                    <button class="history-item__memo-save" @click.stop="saveMemo(entry.id)">저장</button>
                  </div>
                </template>
                <template v-else>
                  <p v-if="entry.memo" class="history-item__memo-text">{{ entry.memo }}</p>
                  <button class="history-item__memo-btn" @click.stop="startMemo(entry)">
                    {{ entry.memo ? '메모 수정' : '메모 남기기' }}
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Show more button -->
          <button
            v-if="hiddenCount(group) > 0"
            class="history-group__more"
            @click="toggleShowAll(group.label)"
          >
            + {{ hiddenCount(group) }}건 더 보기
          </button>

          <!-- Show less button -->
          <button
            v-if="expandedGroups.has(group.label) && group.entries.length > INITIAL_SHOW"
            class="history-group__more"
            @click="toggleShowAll(group.label)"
          >
            접기
          </button>
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

/* ── Group header ── */
.history-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--lt-space-md) var(--lt-space-sm);
  cursor: pointer;
  user-select: none;
}

.history-group__label {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--lt-text-sub);
  letter-spacing: 0.1em;
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid rgba(120, 150, 200, 0.08);
  flex: 1;
  margin-right: var(--lt-space-sm);
}

.history-group__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-group__count {
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
  letter-spacing: 0.04em;
}

.history-group__arrow {
  font-size: 0.6rem;
  color: var(--lt-text-muted);
  opacity: 0.4;
  transition: transform 300ms ease;
}

.history-group__arrow--collapsed {
  transform: rotate(-90deg);
}

.history-group__more {
  display: block;
  width: 100%;
  padding: 12px;
  font-size: 0.72rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.6;
  text-align: center;
  border: 1px dashed rgba(77, 163, 255, 0.15);
  border-radius: var(--lt-radius-md);
  background: transparent;
  transition: opacity 200ms ease, border-color 200ms ease;
  cursor: pointer;
}

.history-group__more:hover {
  opacity: 1;
  border-color: rgba(77, 163, 255, 0.3);
}

/* ── History list ── */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 var(--lt-space-md);
}

.history-item {
  position: relative;
  border: 1px solid rgba(120, 150, 200, 0.08);
  border-radius: var(--lt-radius-lg);
  background: linear-gradient(160deg, rgba(13, 21, 40, 0.6) 0%, rgba(10, 15, 30, 0.4) 100%);
  overflow: hidden;
  transition: border-color 400ms ease, box-shadow 400ms ease, transform 300ms ease, background 400ms ease;
}

.history-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(77, 163, 255, 0.12), transparent);
  transition: background 400ms ease;
}

.history-item--expanded {
  border-color: rgba(143, 211, 255, 0.5);
  background: linear-gradient(160deg, #091428 0%, #102660 45%, #081840 100%);
  box-shadow:
    0 0 0 1px rgba(100, 180, 255, 0.2),
    0 0 24px rgba(77, 163, 255, 0.18),
    0 0 48px rgba(45, 108, 223, 0.08),
    0 6px 24px rgba(0, 0, 0, 0.4);
  transform: scale(1.015);
  animation: history-selected-pulse 3.2s ease-in-out infinite;
}

@keyframes history-selected-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(100, 180, 255, 0.2),
      0 0 24px rgba(77, 163, 255, 0.18),
      0 0 48px rgba(45, 108, 223, 0.08),
      0 6px 24px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(100, 180, 255, 0.3),
      0 0 32px rgba(77, 163, 255, 0.24),
      0 0 56px rgba(45, 108, 223, 0.1),
      0 6px 24px rgba(0, 0, 0, 0.4);
  }
}

.history-item--expanded::before {
  background: linear-gradient(90deg, transparent, rgba(143, 211, 255, 0.4), transparent);
}

.history-item__top {
  padding: var(--lt-space-md) var(--lt-space-md);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
  transition: background 200ms ease;
}

.history-item__top:hover {
  background: rgba(77, 163, 255, 0.02);
}

.history-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item__type {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--lt-accent-2);
  letter-spacing: 0.12em;
}

.history-item__date {
  font-size: 0.65rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.04em;
  opacity: 0.5;
}

.history-item__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-item__card {
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  padding: 6px 12px;
  border: 1px solid rgba(120, 150, 200, 0.1);
  border-radius: var(--lt-radius-md);
  background: rgba(77, 163, 255, 0.03);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.02em;
}

.history-item__card--reversed {
  border-color: rgba(255, 140, 100, 0.18);
  background: rgba(255, 140, 100, 0.03);
}

.history-item__reversed {
  font-size: 0.55rem;
  color: rgba(255, 140, 100, 0.8);
  font-weight: 500;
  letter-spacing: 0.06em;
}

.history-item__position {
  font-size: 0.56rem;
  color: var(--lt-text-muted);
  margin-left: 2px;
  opacity: 0.6;
}

.history-item__summary {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.7;
  letter-spacing: 0.02em;
  opacity: 0.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-item__toggle {
  font-size: 0.65rem;
  color: var(--lt-accent-2);
  letter-spacing: 0.06em;
  opacity: 0.5;
  transition: opacity 200ms ease;
}

.history-item--expanded .history-item__toggle {
  opacity: 0.7;
}

.history-item--expanded .history-item__type {
  color: #fff;
  text-shadow: 0 0 12px rgba(143, 211, 255, 0.3);
}

.history-item--expanded .history-item__card {
  border-color: rgba(143, 211, 255, 0.2);
  background: rgba(77, 163, 255, 0.08);
  color: #F4F8FF;
}

.history-item__top:hover .history-item__toggle {
  opacity: 0.9;
}

/* Dim siblings when one is expanded */
.history-list:has(.history-item--expanded) .history-item:not(.history-item--expanded) {
  opacity: 0.5;
  transform: scale(0.98);
  transition: opacity 400ms ease, transform 300ms ease, border-color 400ms ease, box-shadow 400ms ease;
}

.history-list:has(.history-item--expanded) .history-item:not(.history-item--expanded):hover {
  opacity: 0.8;
}

/* ── Expanded detail ── */
.history-item__detail {
  padding: 0 var(--lt-space-md) var(--lt-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--lt-space-sm);
  animation: detailFadeIn 300ms ease;
}

@keyframes detailFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.history-item__detail-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(77, 163, 255, 0.1), transparent);
}

.history-item__detail-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item__detail-label {
  font-size: 0.62rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
}

.history-item__detail-text {
  font-size: 0.8rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  letter-spacing: 0.02em;
}

.history-item__detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-item__detail-tag {
  font-size: 0.68rem;
  color: rgba(100, 220, 180, 0.85);
  padding: 3px 10px;
  border: 1px solid rgba(100, 220, 180, 0.15);
  border-radius: var(--lt-radius-full);
  background: rgba(100, 220, 180, 0.05);
  letter-spacing: 0.04em;
}

.history-item__detail-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item__detail-list li {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.7;
  padding-left: 12px;
  position: relative;
}

.history-item__detail-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(77, 163, 255, 0.3);
}

.history-item__detail-list--caution li::before {
  background: rgba(255, 140, 100, 0.3);
}

.history-item__detail-empty {
  font-size: 0.72rem;
  color: var(--lt-text-muted);
  opacity: 0.5;
  text-align: center;
  padding: var(--lt-space-sm) 0;
  letter-spacing: 0.02em;
}

/* ── Memo ── */
.history-item__memo-wrap {
  margin-top: 2px;
}

.history-item__memo-text {
  font-size: 0.76rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  padding: 10px 14px;
  background: rgba(77, 163, 255, 0.03);
  border-left: 2px solid rgba(77, 163, 255, 0.15);
  border-radius: 0 var(--lt-radius-sm) var(--lt-radius-sm) 0;
  margin-bottom: 6px;
  white-space: pre-wrap;
  font-style: italic;
  letter-spacing: 0.02em;
}

.history-item__memo-btn {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  opacity: 0.6;
  letter-spacing: 0.04em;
  padding: 4px 0;
  transition: opacity var(--lt-transition);
}

.history-item__memo-btn:hover {
  opacity: 1;
}

.history-item__memo-input {
  width: 100%;
  font-size: 0.78rem;
  color: var(--lt-text);
  background: var(--lt-panel);
  border: 1px solid rgba(77, 163, 255, 0.15);
  border-radius: var(--lt-radius-sm);
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.7;
  font-family: inherit;
  letter-spacing: 0.02em;
}

.history-item__memo-input::placeholder {
  color: var(--lt-text-muted);
  opacity: 0.5;
}

.history-item__memo-input:focus {
  outline: none;
  border-color: rgba(77, 163, 255, 0.3);
}

.history-item__memo-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.history-item__memo-cancel,
.history-item__memo-save {
  font-size: 0.72rem;
  padding: 6px 14px;
  min-height: 32px;
  border-radius: var(--lt-radius-sm);
  letter-spacing: 0.04em;
  transition: background var(--lt-transition), border-color var(--lt-transition);
}

.history-item__memo-cancel {
  color: var(--lt-text-muted);
  border: 1px solid var(--lt-border-soft);
  background: transparent;
}

.history-item__memo-cancel:hover {
  border-color: var(--lt-line-soft);
}

.history-item__memo-save {
  color: var(--lt-text);
  background: var(--lt-btn-primary-bg);
  border: 1px solid var(--lt-btn-primary-border);
}

.history-item__memo-save:hover {
  background: var(--lt-btn-primary-hover);
  border-color: var(--lt-btn-primary-hover-border);
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
  padding: 12px var(--lt-space-lg);
  min-height: 44px;
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
  padding: 10px var(--lt-space-lg);
  min-height: 44px;
  min-width: 80px;
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
  padding: 10px var(--lt-space-lg);
  min-height: 44px;
  min-width: 80px;
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
