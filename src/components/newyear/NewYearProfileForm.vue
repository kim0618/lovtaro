<script setup>
import { ref, computed } from 'vue'
import { isValidBirthday, getYearCardNumber, NEWYEAR_YEAR } from '../../data/readings/newyear.js'

const emit = defineEmits(['submit'])

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
})

const NICKNAME_MAX = 10

const nickname = ref(props.initial.nickname ?? '')
const month = ref(props.initial.month ?? '')
const day = ref(props.initial.day ?? '')

const months = Array.from({ length: 12 }, (_, i) => i + 1)
const daysInMonth = computed(() => (month.value ? new Date(2000, Number(month.value), 0).getDate() : 31))
const days = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1))

// 월을 바꿔 일이 범위를 넘으면(3/31 → 2월) 일을 비운다
function onMonthChange() {
  if (day.value && Number(day.value) > daysInMonth.value) day.value = ''
}

const birthdayPartial = computed(() => Boolean(month.value) !== Boolean(day.value))
const birthdayValid = computed(() => isValidBirthday(month.value, day.value))

function submit() {
  if (birthdayPartial.value) return
  const nick = nickname.value.trim().slice(0, NICKNAME_MAX)
  emit('submit', {
    nickname: nick,
    month: birthdayValid.value ? Number(month.value) : null,
    day: birthdayValid.value ? Number(day.value) : null,
    yearCardNumber: birthdayValid.value ? getYearCardNumber(month.value, day.value) : null,
  })
}

function skip() {
  emit('submit', { nickname: '', month: null, day: null, yearCardNumber: null })
}
</script>

<template>
  <div class="ny-profile">
    <div class="ny-profile__header">
      <p class="ny-profile__eyebrow">Step 2</p>
      <h2 class="ny-profile__title">나에 대해 조금만 알려주세요</h2>
      <p class="ny-profile__desc">생일을 알려주시면 {{ NEWYEAR_YEAR }}년을 대표하는<br>나만의 연간 카드를 함께 찾아드려요.</p>
    </div>

    <div class="ny-profile__fields">
      <label class="ny-profile__field">
        <span class="ny-profile__label">닉네임 <span class="ny-profile__optional">선택</span></span>
        <input
          v-model="nickname"
          class="ny-profile__input"
          type="text"
          :maxlength="NICKNAME_MAX"
          placeholder="결과 카드에 들어갈 이름"
          autocomplete="nickname"
          enterkeyhint="next"
        />
      </label>

      <div class="ny-profile__field">
        <span class="ny-profile__label">생일 <span class="ny-profile__optional">선택 · 태어난 해는 필요 없어요</span></span>
        <div class="ny-profile__birthday">
          <select v-model="month" class="ny-profile__select" aria-label="태어난 월" @change="onMonthChange">
            <option value="">월</option>
            <option v-for="m in months" :key="m" :value="m">{{ m }}월</option>
          </select>
          <select v-model="day" class="ny-profile__select" aria-label="태어난 일">
            <option value="">일</option>
            <option v-for="d in days" :key="d" :value="d">{{ d }}일</option>
          </select>
        </div>
        <p v-if="birthdayPartial" class="ny-profile__hint">월과 일을 모두 골라주세요.</p>
      </div>
    </div>

    <div class="ny-profile__bottom">
      <button class="ny-profile__cta" :disabled="birthdayPartial" @click="submit">
        {{ birthdayValid ? '연간 카드와 함께 보기' : '다음' }}
      </button>
      <button class="ny-profile__skip" @click="skip">건너뛰기</button>
      <p class="ny-profile__note">입력한 정보는 카드 계산에만 쓰고<br>어디에도 보내지 않아요.</p>
    </div>
  </div>
</template>

<style scoped>
.ny-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12vh var(--lt-space-md) 6vh;
  min-height: 100dvh;
}

.ny-profile__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}

.ny-profile__eyebrow {
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: var(--lt-accent-2);
  opacity: 0.55;
  text-transform: uppercase;
  font-weight: 500;
}

.ny-profile__title {
  font-family: var(--lt-font-sans);
  font-size: 1.3rem;
  font-weight: 200;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
}

.ny-profile__desc {
  font-size: 0.76rem;
  color: var(--lt-text-muted);
  line-height: 1.7;
  letter-spacing: 0.03em;
}

.ny-profile__fields {
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  max-width: 340px;
}

.ny-profile__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ny-profile__label {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  letter-spacing: 0.04em;
}

.ny-profile__optional {
  font-size: 0.66rem;
  color: var(--lt-text-muted);
  opacity: 0.7;
  margin-left: 4px;
}

.ny-profile__input,
.ny-profile__select {
  width: 100%;
  min-height: 48px;
  padding: 0 var(--lt-space-md);
  background: var(--lt-bg-card);
  border: 1px solid rgba(120, 150, 200, 0.2);
  border-radius: var(--lt-radius-md);
  color: var(--lt-text-strong);
  font-family: var(--lt-font-sans);
  font-size: 16px; /* 16px 미만이면 iOS가 입력 시 화면을 확대한다 */
  transition: border-color var(--lt-transition);
}

.ny-profile__input::placeholder {
  color: var(--lt-text-muted);
  opacity: 0.6;
}

.ny-profile__input:focus,
.ny-profile__select:focus {
  outline: none;
  border-color: var(--lt-accent-2);
}

.ny-profile__select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--lt-text-muted) 50%), linear-gradient(135deg, var(--lt-text-muted) 50%, transparent 50%);
  background-position: calc(100% - 20px) 50%, calc(100% - 15px) 50%;
  background-size: 5px 5px;
  background-repeat: no-repeat;
}

.ny-profile__birthday {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ny-profile__hint {
  font-size: 0.7rem;
  color: var(--lt-accent-3);
}

.ny-profile__bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 340px;
  margin-top: 36px;
}

.ny-profile__cta {
  width: 100%;
  min-height: 50px;
  padding: 16px var(--lt-space-lg);
  background: var(--lt-btn-primary-bg);
  border: 1px solid var(--lt-btn-primary-border);
  border-radius: var(--lt-radius-lg);
  color: var(--lt-text-strong);
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: opacity var(--lt-transition);
}

.ny-profile__cta:disabled {
  opacity: 0.45;
  cursor: default;
}

.ny-profile__skip {
  min-height: 44px;
  padding: 0 var(--lt-space-lg);
  font-size: 0.76rem;
  color: var(--lt-text-muted);
  letter-spacing: 0.06em;
  background: none;
  border: none;
  cursor: pointer;
}

.ny-profile__note {
  font-size: 0.66rem;
  color: var(--lt-text-muted);
  opacity: 0.65;
  text-align: center;
  line-height: 1.5;
  letter-spacing: 0.04em;
}
</style>
