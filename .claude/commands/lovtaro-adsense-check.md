---
description: lovtaro.kr 애드센스 신청 전 최종 점검 (2026-06-11 1회 실행 전용, Vue SPA dist/ 기준)
allowed-tools: Read, Edit, Glob, Grep, Bash, WebFetch
---

# 러브타로 애드센스 신청 최종 점검 스킬

6/12 애드센스 신청 하루 전 **2026-06-11에 1회 실행**하는 사전 점검 스킬. 콘텐츠 생성·변경 없음. 검수만 수행하고 지적사항 발생 시 즉시 수정.

**신청 목표**: lovtaro.kr 첫 애드센스 신청 (2026-06-12)
**특성**: Vue 3 SPA + `scripts/prerender.mjs` 정적 HTML 생성. 검증은 `dist/` 기준.
**리스크**: 타로 서비스 (예언·점술 오해 가능성) + 면책 조항 필수 + 카드 이미지 저작권

## 기본 동작

- **1회 실행으로 전수 점검** (페이지 단위 아닌 사이트 전체)
- 지적사항은 **즉시 수정** (스킬이 직접 Edit 실행)
- 수정 불가한 건은 리포트에 **요주의 플래그**로 기록
- 판단 필요한 건은 사용자에게 질문 후 결정

## 선행 실행

```bash
cd /home/tjd618/lovtaro && npm run build 2>&1 | tail -10
```

빌드 실패 시 점검 중단, 원인 수정 후 재실행.

## 점검 항목 (순서대로 실행)

### A. 사이트 구조

**A-1. sitemap.xml URL 수**

```bash
grep -c '<loc>' /home/tjd618/lovtaro/public/sitemap.xml
head -40 /home/tjd618/lovtaro/public/sitemap.xml
```

- 예상: 리딩 8 + 홈 1 + today 1 + cards 인덱스 1 + 카드 상세 78 + guide 인덱스 1 + guide 35-49 + about/contact/editorial/disclaimer/privacy 5 = **130-144**
- 부족 시 누락 URL 식별

**A-2. sitemap URL 실존 확인**

```bash
# sitemap의 URL을 dist 경로로 매핑해 실존 확인
grep -oE '<loc>[^<]+</loc>' /home/tjd618/lovtaro/public/sitemap.xml \
  | sed 's|<loc>https://lovtaro.kr|/home/tjd618/lovtaro/dist|; s|</loc>||' \
  | while read path; do
    [ -d "${path%/}" ] && [ -f "${path%/}/index.html" ] && continue
    [ -f "$path" ] && continue
    [ -f "${path}/index.html" ] && continue
    echo "MISSING: $path"
  done
```

- 발견 시 sitemap 수정 또는 prerender 누락 확인

**A-3. robots.txt 적절성**

```bash
cat /home/tjd618/lovtaro/public/robots.txt
# dist에도 복사됐는지
cat /home/tjd618/lovtaro/dist/robots.txt
```

- `Sitemap:` 라인 존재
- 전체 차단(`Disallow: /`) 없음
- `/print/` 같은 내부 경로 제외 확인

**A-4. ads.txt**

- 신청 전 시점 **없거나 빈 파일**
- 승인 후 추가 예정

**A-5. 404/broken 내부 링크 점검 (가이드)**

```bash
# guide 파일의 relatedReadings.path 실존 확인
grep -rE "path: '/[^']+'" /home/tjd618/lovtaro/src/data/guides/ \
  | grep -oE "path: '[^']+'" | sort -u
```

실존 라우트 화이트리스트:
- `/`, `/today`
- `/reading/love`, `/reading/mind`, `/reading/reunion`, `/reading/contact`, `/reading/yesno`, `/reading/compatibility`, `/reading/three`
- `/cards`, `/cards/:id`, `/guide`, `/guide/:slug`
- `/about`, `/contact`, `/privacy`, `/editorial-policy`, `/disclaimer`

화이트리스트 외 경로 발견 시 수정.

**A-6. relatedCards 실존**

```bash
node -e "
import('/home/tjd618/lovtaro/src/data/guides/index.js').then(g => {
  import('/home/tjd618/lovtaro/src/data/tarotCards.js').then(M => {
    import('/home/tjd618/lovtaro/src/data/minorArcana.js').then(m => {
      const ids = new Set([...M.TAROT_CARDS.map(c=>c.id), ...m.MINOR_ARCANA.map(c=>c.id)])
      g.default.forEach(x => (x.relatedCards||[]).forEach(c => {
        if(!ids.has(c.id)) console.log('MISSING-CARD:', x.slug, '→', c.id)
      }))
    })
  })
})
" 2>&1 || echo "node ESM 실행 실패 시 grep으로 대체"
```

ESM 실행 실패 시:

```bash
# 수동 교차 확인 (카드 id 추출)
grep -oE "id: '[a-z-]+'" /home/tjd618/lovtaro/src/data/tarotCards.js /home/tjd618/lovtaro/src/data/minorArcana.js \
  | sed "s/.*id: '//; s/'//" | sort -u > /tmp/lt-card-ids.txt
grep -rhoE "id: '[a-z-]+'" /home/tjd618/lovtaro/src/data/guides/ \
  | sed "s/id: '//; s/'//" | sort -u > /tmp/lt-guide-ref.txt
comm -23 /tmp/lt-guide-ref.txt /tmp/lt-card-ids.txt
```

### B. 콘텐츠 품질

**B-1. thin guide 전수 확인 (2,500자 미만)**

```bash
for f in /home/tjd618/lovtaro/dist/guide/*/index.html; do
  [ "$(basename $(dirname $f))" = "guide" ] && continue
  chars=$(sed 's/<[^>]*>//g' "$f" | tr -s ' \n' | wc -c)
  if [ "$chars" -lt 2500 ]; then
    slug=$(basename $(dirname "$f"))
    echo "THIN-GUIDE: $slug ($chars자)"
  fi
done
```

- 결과 0이 이상적. 발견 시 `/lovtaro-guide`로 즉시 보강 또는 PASS/HOLD 판정

**B-2. 카드 상세 본문 최소 분량 (1,800자 이상)**

```bash
for f in /home/tjd618/lovtaro/dist/cards/*/index.html; do
  chars=$(sed 's/<[^>]*>//g' "$f" | tr -s ' \n' | wc -c)
  if [ "$chars" -lt 1800 ]; then
    slug=$(basename $(dirname "$f"))
    echo "THIN-CARD: $slug ($chars자)"
  fi
done
```

- 발견 시 `/lovtaro-card-expand`로 보강

**B-3. AI 자동생성 의심 패턴**

```bash
grep -rEc '정리합니다|알아보겠습니다|완벽 가이드|한눈에 정리|안녕하세요|살펴보겠습니다' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js \
  2>/dev/null | awk -F: '$2 > 0'
```

- 발견 시 `/lovtaro-verify` 실행 또는 즉시 수정

**B-4. em dash(—) 0건 확인**

```bash
grep -rl '—' \
  /home/tjd618/lovtaro/src/data/ \
  /home/tjd618/lovtaro/src/pages/ \
  /home/tjd618/lovtaro/src/components/
```

- 발견 시 하이픈으로 즉시 교체 (전 프로젝트 공통 규칙)

**B-5. 타로 단정·예언 표현**

```bash
grep -rnE '반드시|100%|절대|무조건|확실히|보장|틀림없이' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

- 애드센스 정책상 예언·점술 단정 표현은 신뢰성 리스크
- 발견 시 완화 표현으로 즉시 교체

**B-6. 중복/거의 동일 글 탐지**

```bash
# 가이드 title 중복
grep -rhE "title: '" /home/tjd618/lovtaro/src/data/guides/ | sort | uniq -d
# 가이드 description 중복
grep -rhE "description: '" /home/tjd618/lovtaro/src/data/guides/ | sort | uniq -d
# slug 중복 (있으면 안 됨)
grep -rhE "slug: '" /home/tjd618/lovtaro/src/data/guides/ | sort | uniq -d
```

- 중복 0이어야 함

**B-7. 자가 부정·자극 표현**

```bash
grep -rnE '타로는 미신|재미로|큰일|끔찍|저주|파탄' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js \
  /home/tjd618/lovtaro/src/data/minorArcana.js
```

- 발견 시 완화·삭제

### C. SEO / 구조화 데이터

**C-1. JSON-LD 전수 주입 확인**

```bash
for f in /home/tjd618/lovtaro/dist/guide/*/index.html; do
  if ! grep -q 'application/ld+json' "$f"; then
    echo "NO-JSONLD: $f"
  fi
done
for f in /home/tjd618/lovtaro/dist/cards/*/index.html; do
  if ! grep -q 'application/ld+json' "$f"; then
    echo "NO-JSONLD: $f"
  fi
done
```

- 누락 0이어야 함

**C-2. JSON-LD 문법 오류**

```bash
for f in /home/tjd618/lovtaro/dist/guide/*/index.html; do
  awk '/<script type="application\/ld\+json">/,/<\/script>/' "$f" \
    | sed 's/<script[^>]*>//; s/<\/script>//' \
    | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{try{JSON.parse(d)}catch(e){console.error("JSONLD-ERR: '$f': "+e.message)}})' 2>/dev/null
done
```

- 오류 파일 즉시 수정 (빌더 로직 점검: `scripts/prerender.mjs` `buildGraph`)

**C-3. FAQPage JSON-LD ↔ 본문 FAQ 일치 (샘플 5개)**

각 가이드 글의 본문 `faq` 배열과 prerender.mjs의 `GUIDES[].faq` 완전 일치 확인:

```bash
# 가이드 파일의 faq 개수
for f in /home/tjd618/lovtaro/src/data/guides/*.js; do
  [ "$(basename $f)" = "index.js" ] && continue
  slug=$(basename $f .js)
  count=$(grep -cE "^\s+question:" "$f")
  echo "$slug: $count Q"
done

# prerender.mjs의 faq 개수 (GUIDES 배열)
# 수동 확인: Read 도구로 GUIDES 배열 전체 출력
```

- 불일치 발견 시 `/lovtaro-verify` 실행 또는 수동 동기화

**C-4. canonical URL 적절성**

```bash
for f in /home/tjd618/lovtaro/dist/guide/*/index.html /home/tjd618/lovtaro/dist/cards/*/index.html; do
  canon=$(grep -oE 'rel="canonical" href="[^"]+"' "$f" | head -1 | sed 's/.*href="//; s/"//')
  expected_path="${f#/home/tjd618/lovtaro/dist}"
  expected_path="${expected_path%/index.html}"
  expected="https://lovtaro.kr${expected_path}"
  if [ "$canon" != "$expected" ]; then
    echo "CANON-MISMATCH: $f → $canon (expected: $expected)"
  fi
done
```

- lovtaro는 trailingSlash 없음: `/cards/fool` (O)
- 불일치 발견 시 useHead.js 로직 점검

**C-5. og:image 주입**

```bash
# 기본 og-image.png 존재
ls /home/tjd618/lovtaro/dist/og-image.png
# 카드별 og
ls /home/tjd618/lovtaro/dist/images/cards-png/ | head -5
```

모든 페이지에 `og:image` meta 주입:

```bash
for f in /home/tjd618/lovtaro/dist/guide/*/index.html; do
  grep -q 'property="og:image"' "$f" || echo "NO-OG: $f"
done
```

**C-6. @graph 구조 (홈)**

```bash
# 홈에 Organization + WebSite + WebApplication 주입 확인
grep -oE '"@type":"[^"]+"' /home/tjd618/lovtaro/dist/index.html | sort -u
```

- Organization, WebSite, WebApplication, BreadcrumbList 4종 기대

### D. 필수 페이지 (AdSense 필수)

**D-1. 필수 페이지 존재**

```bash
for path in about contact privacy editorial-policy disclaimer; do
  f="/home/tjd618/lovtaro/dist/$path/index.html"
  if [ ! -f "$f" ]; then
    echo "MISSING-REQUIRED: $path"
  else
    chars=$(sed 's/<[^>]*>//g' "$f" | tr -s ' \n' | wc -c)
    if [ "$chars" -lt 500 ]; then
      echo "THIN-REQUIRED: $path ($chars자)"
    fi
  fi
done
```

- 모두 존재 + 500자 이상 본문

**D-2. Disclaimer 면책 조항 문구**

```bash
grep -E '오락|자기 성찰|전문|미래를 단정|예언' /home/tjd618/lovtaro/dist/disclaimer/index.html
```

필수 포함 요소:
- 타로 리딩은 오락/자기 성찰 목적
- 전문 상담을 대체하지 않음
- 미래를 단정·보장하지 않음

**D-3. Privacy 정책 핵심 항목**

```bash
grep -E '수집|목적|보관|제3자|쿠키|Analytics' /home/tjd618/lovtaro/dist/privacy/index.html
```

GA4 운영 중이므로 쿠키/Analytics 언급 필수.

**D-4. 네비게이션에서 필수 페이지 접근 가능**

```bash
# 홈 HTML에 footer 링크 포함
grep -cE 'href="/about"|href="/contact"|href="/privacy"|href="/editorial-policy"|href="/disclaimer"' /home/tjd618/lovtaro/dist/index.html
```

- 5개 모두 렌더링된 상태여야 함 (AppFooter)

### E. 기술·접근성

**E-1. viewport meta**

```bash
grep -rL 'name="viewport"' /home/tjd618/lovtaro/dist/guide/ /home/tjd618/lovtaro/dist/cards/
```

- 누락 0

**E-2. `<html lang="ko">`**

```bash
# 홈 확인
grep -c 'html lang="ko"' /home/tjd618/lovtaro/dist/index.html

# 가이드·카드 전수 확인 (lang 속성 없는 파일만 출력)
for f in /home/tjd618/lovtaro/dist/guide/*/index.html /home/tjd618/lovtaro/dist/cards/*/index.html; do
  grep -q 'html lang="ko"' "$f" || echo "NO-LANG: $f"
done
```

**E-3. alt 텍스트 누락 (카드 이미지)**

```bash
grep -rn "<img" /home/tjd618/lovtaro/dist/cards/ | grep -v "alt=" | head -10
```

- 발견 시 alt 속성 추가

**E-4. 광고 코드 잔재 (신청 전에는 없어야)**

```bash
grep -rl 'adsbygoogle\|pagead2.googlesyndication.com\|ca-pub-' /home/tjd618/lovtaro/dist/ 2>/dev/null
```

- 신청 전 광고 스크립트 **없어야** 함 (승인 후 삽입)

### F. Analytics / Search Console

**F-1. GA4 측정 ID 삽입**

```bash
grep -c 'G-9B8C0RHKXX' /home/tjd618/lovtaro/dist/index.html
```

- `index.html` + 페이지별 (raw HTML 또는 런타임 주입) 확인
- 값은 `.claude/rules/analytics.md` 참고

**F-2. 네이버 사이트 검증 메타**

```bash
grep -c 'naver-site-verification' /home/tjd618/lovtaro/dist/index.html
```

**F-3. Google Search Console 소유권**

- 사용자가 Search Console에 `lovtaro.kr` 속성 등록 완료 확인 (수동)
- sitemap 제출 완료 확인 (수동)

**F-4. GA4 트래픽 축적**

- Phase 2 기간 (4/23~6/10) 최소 3-4주 트래픽 축적 권장
- `/report` 스킬 또는 직접 GA4 콘솔 확인

### G. 콘텐츠 볼륨 종합

**G-1. 최종 카운트**

```bash
echo "guides: $(ls /home/tjd618/lovtaro/src/data/guides/ | grep -v '^index.js$' | wc -l)편"
echo "major: 22장 (고정)"
echo "minor: 56장 (고정)"
echo "sitemap URLs: $(grep -c '<loc>' /home/tjd618/lovtaro/public/sitemap.xml)"
```

- 가이드 **30편 이상** 권장
- sitemap 130+ URL

**G-2. 카드 보강 완료율**

`/lovtaro-card-expand` 스킬 파일의 보강 진행률 표 확인:

```bash
Read /home/tjd618/.claude/commands/lovtaro-card-expand.md
```

- 78/78 완료 권장 (미달이면 HOLD 고려)

### H. 정책 / 법적 이슈

**H-1. 타로 카드 이미지 저작권**

```bash
ls /home/tjd618/lovtaro/public/images/cards-png/ | head -5
# 이미지 출처 명시 확인 (credits 페이지 또는 disclaimer)
grep -rE 'Rider-Waite|Pamela Colman|저작권|출처' /home/tjd618/lovtaro/dist/disclaimer/index.html /home/tjd618/lovtaro/dist/privacy/index.html
```

- 라이더-웨이트 덱 기반 이미지는 퍼블릭 도메인 (1909년, 저작권 만료)이지만 명시 권장
- 자체 제작 이미지면 credit 불필요

**H-2. 금지 콘텐츠 키워드**

```bash
grep -rEil '도박|베팅|성인용품|무허가|불법|섹스|야한' \
  /home/tjd618/lovtaro/src/data/guides/ \
  /home/tjd618/lovtaro/src/data/cardDictionary.js
```

- 발견 시 문맥 확인 → 타로 해석 맥락이면 표현 점검 (예: Devil 카드 "유혹"은 OK, "성적 유혹"은 부적절)

**H-3. 미성년 타겟팅 표현**

- 타깃이 20-30대 여성이지만 미성년 독자 차단 장치 없음
- 글·카드 해석에서 미성년 연애 맥락 자극 표현 없는지 샘플 확인

### I. 배포 / 도메인

**I-1. HTTPS 작동 확인**

```bash
curl -sI https://lovtaro.kr | head -3
```

- 200 응답
- HTTPS 리다이렉트

**I-2. 모바일 렌더링 (수동)**

- 사용자가 모바일 기기 또는 DevTools에서 직접 확인
- 가이드 1편 + 카드 1장 + 홈 렌더링 체크

## 실행 결과 리포트 형식

`/home/tjd618/lovtaro/adsense-check-{YYYY-MM-DD}.md`에 저장:

```markdown
# 러브타로 애드센스 신청 점검 리포트 (2026-06-11)

## ✅ 통과 항목
- sitemap.xml N URL, 실존 전수 확인
- robots.txt 적절
- thin guide 0건 (2,500자+ 전수 충족)
- thin card 0건 (1,800자+ 전수 충족)
- em dash 0건
- 단정 표현 0건
- 중복 title/slug 0건
- JSON-LD 문법 오류 0건
- FAQ 일치 전수 확인
- canonical 전수 일치
- 필수 페이지 5종 (about/contact/privacy/editorial-policy/disclaimer) 전수 존재 + 500자+
- disclaimer 면책 문구 포함
- 광고 코드 잔재 0건
- GA4 측정 ID 주입
- 가이드 N편 / 카드 78장 보강 완료

## ⚠️ 수정 완료
- src/data/guides/xxx.js: em dash 2건 → 하이픈 교체
- src/data/cardDictionary.js::tower: "끔찍한" → "뚜렷한" 교체
- src/data/guides/yyy.js: FAQ prerender 불일치 → 본문 기준 갱신

## ❌ 요주의 (신청 전 결정 필요)
- yyy.js: 본문 2,200자 (목표 2,500자 미달) → /lovtaro-guide 보강 필요
- 가이드 29편 (목표 35-49편 미달) → 신청 홀드 또는 진행 판단 필요
- 카드 보강 72/78 (미완) → Phase 2 Week 6 연장 또는 진행

## 재신청 권장 여부
[PASS] 또는 [HOLD (x건 선결 필요)]

## 신청 체크리스트 (제출 전 최종 확인)
- [ ] Google Search Console 소유권 확인 완료
- [ ] GA4 측정 ID 프로덕션 연결
- [ ] Analytics 트래픽 축적 (최소 3-4주)
- [ ] 필수 페이지 메뉴·푸터 링크 노출 (BottomTabNav + AppFooter)
- [ ] 모바일 렌더링 직접 확인 (가이드 1 + 카드 1 + 홈)
- [ ] 네이버 사이트 검증
- [ ] HTTPS 정상 작동 확인
- [ ] 광고 컴포넌트 비활성 상태로 빌드됨 확인
```

## 작업 흐름

1. `npm run build` 선행 (dist/ 최신화)
2. A~I 순서대로 전수 실행
3. 자동 수정 가능한 건 Edit 도구로 즉시 처리
   - em dash → 하이픈
   - 단정 표현 완화
   - FAQ 동기화 불일치
4. 판단 필요한 건은 사용자에게 질문
   - thin content 발견 시 /lovtaro-guide 추가 실행할지
   - 가이드 편수 미달 시 신청 홀드 여부
   - 광고 컴포넌트 상태
5. 최종 리포트 출력 후 [PASS]/[HOLD] 판정
6. [HOLD]면 선결 과제 목록 제시, 해결 후 재실행 권장

## 금지

- 콘텐츠 **신규 생성 금지** (이 스킬은 검수+소규모 수정 전용)
- 사용자 동의 없이 페이지·글 **삭제 금지** (플래그만 올림)
- 신청 자체는 자동 수행하지 않음 (사용자가 Google AdSense 콘솔에서 직접)
- `slug`/`id` 변경 금지 (URL·sitemap·JSON-LD 전부 깨짐)
- `router/index.js` 라우트 구조 변경 금지

## 1회 실행 후

- 이 스킬은 **1회 실행 후 자동 삭제하지 않음** (재점검 필요 시 재실행 가능)
- 신청 승인 후 보관 or 사용자 지시 후 삭제


## 완료 후 로그 기록

스킬 실행이 완료되면 반드시 아래 명령으로 `skill-log.json`에 기록한다:

```bash
python3 -c "import json,datetime; logs=json.load(open('/home/tjd618/skill-log.json')); now=datetime.datetime.now(); logs.insert(0,{'date':now.strftime('%Y-%m-%d'),'time':now.strftime('%H:%M'),'project':'lovtaro','skill':'lovtaro-adsense-check'}); open('/home/tjd618/skill-log.json','w').write(json.dumps(logs,ensure_ascii=False,indent=2))"
```

$ARGUMENTS
