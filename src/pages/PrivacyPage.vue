<script setup>
import { useHead } from '../composables/useHead.js'
import AppShell from '../components/common/AppShell.vue'
import PageContainer from '../components/ui/PageContainer.vue'

useHead({
  title: '개인정보처리방침 | Lovtaro',
  description: 'Lovtaro 개인정보처리방침 안내.',
})
</script>

<template>
  <AppShell>
    <PageContainer>
      <div class="privacy">
        <h1 class="privacy__title">개인정보처리방침</h1>
        <p class="privacy__updated">최종 수정일: 2026년 4월 5일</p>

        <section class="privacy__section">
          <h2>1. 수집하는 정보</h2>
          <p>
            Lovtaro는 회원가입을 요구하지 않으며, 이름, 이메일 등 개인을 식별할 수 있는 정보를 직접 수집하지 않습니다.
          </p>
          <p>다만, 서비스 운영 및 개선을 위해 다음 정보가 자동으로 수집될 수 있습니다.</p>
          <ul>
            <li><strong>방문 기록</strong> - Google Analytics 4(GA4)를 통한 페이지 조회수, 체류 시간, 유입 경로 등 익명화된 통계 데이터</li>
            <li><strong>기기 정보</strong> - 브라우저 종류, 화면 크기, 운영체제 등 기술적 환경 정보</li>
          </ul>
        </section>

        <section class="privacy__section">
          <h2>2. 로컬 저장 데이터</h2>
          <p>
            Lovtaro는 사용자 경험 향상을 위해 브라우저의 localStorage에 다음 정보를 저장합니다.
          </p>
          <ul>
            <li><strong>리딩 기록</strong> - 타로 리딩 결과 (최대 50건)</li>
            <li><strong>오늘의 카드</strong> - 당일 뽑은 카드 정보</li>
          </ul>
          <p>
            이 데이터는 사용자의 브라우저에만 저장되며, 외부 서버로 전송되지 않습니다.
            브라우저의 데이터 삭제 기능이나 리딩 기록 페이지에서 언제든 삭제할 수 있습니다.
          </p>
        </section>

        <section class="privacy__section">
          <h2>3. 쿠키 및 추적 기술</h2>
          <p>
            Google Analytics 4는 자체적으로 쿠키를 사용하여 방문자를 구분합니다.
            이는 개인을 식별하는 것이 아니라, 서비스 이용 패턴을 분석하기 위한 것입니다.
          </p>
          <p>
            브라우저 설정에서 쿠키를 차단하거나, Google의
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Analytics 수집 거부 브라우저 부가기능</a>을 설치하여 추적을 차단할 수 있습니다.
          </p>
        </section>

        <section class="privacy__section">
          <h2>4. 제3자 제공</h2>
          <p>
            Lovtaro는 수집된 정보를 제3자에게 판매하거나 공유하지 않습니다.
            단, Google Analytics 서비스 이용에 따라 Google의 개인정보처리방침이 적용됩니다.
          </p>
        </section>

        <section class="privacy__section">
          <h2>5. 이용자의 권리</h2>
          <ul>
            <li>브라우저 localStorage 데이터는 언제든 직접 삭제할 수 있습니다.</li>
            <li>Google Analytics 추적을 거부할 수 있습니다.</li>
            <li>개인정보 관련 문의는 아래 연락처로 보내주세요.</li>
          </ul>
        </section>

        <section class="privacy__section">
          <h2>6. 면책</h2>
          <p>
            Lovtaro의 타로 리딩은 오락 및 자기 성찰 목적으로만 제공됩니다.
            전문적인 심리 상담, 의료 조언, 법률 자문 등을 대체하지 않습니다.
            리딩 결과에 기반한 의사결정은 전적으로 이용자 본인의 책임입니다.
          </p>
        </section>

        <section class="privacy__section">
          <h2>7. 방침 변경</h2>
          <p>
            본 방침이 변경될 경우, 이 페이지를 통해 공지합니다.
          </p>
        </section>

        <section class="privacy__section">
          <h2>8. 문의</h2>
          <p>
            개인정보 관련 문의: jptcalc@naver.com
          </p>
        </section>
      </div>
    </PageContainer>
  </AppShell>
</template>

<style scoped>
.privacy {
  padding: var(--lt-space-xl) var(--lt-space-md) var(--lt-space-2xl);
  max-width: 480px;
  margin: 0 auto;
}

.privacy__title {
  font-family: var(--lt-font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--lt-text-strong);
  letter-spacing: 0.04em;
  text-align: center;
  margin-bottom: var(--lt-space-sm);
}

.privacy__updated {
  font-size: 0.68rem;
  color: var(--lt-text-muted);
  text-align: center;
  opacity: 0.6;
  margin-bottom: var(--lt-space-xl);
}

.privacy__section {
  margin-bottom: var(--lt-space-lg);
}

.privacy__section h2 {
  font-family: var(--lt-font-sans);
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--lt-text);
  letter-spacing: 0.03em;
  margin-bottom: var(--lt-space-sm);
  padding-bottom: var(--lt-space-xs);
  border-bottom: 1px solid var(--lt-border-soft);
}

.privacy__section p {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  letter-spacing: 0.02em;
  margin-bottom: var(--lt-space-sm);
}

.privacy__section ul {
  list-style: none;
  padding: 0;
  margin: var(--lt-space-sm) 0;
}

.privacy__section li {
  font-size: 0.78rem;
  color: var(--lt-text-sub);
  line-height: 1.8;
  padding-left: var(--lt-space-md);
  position: relative;
  margin-bottom: 4px;
}

.privacy__section li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lt-accent-2);
  opacity: 0.4;
}

.privacy__section a {
  color: var(--lt-accent-2);
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.85;
}

.privacy__section a:hover {
  opacity: 1;
}

.privacy__section strong {
  color: var(--lt-text);
  font-weight: 400;
}
</style>
