#!/usr/bin/env bash
# /insta 트래커 PC 간 동기화 (2026-09-01 신설)
#
# 문제: 트래커 4종(.claude/insta-data/)은 PC마다 각자 행을 추가하는데,
#       한쪽이 커밋을 늦추면 다음 PC가 stale한 대장 위에 또 쓰고, 병합 때 한쪽 기록이 날아간다.
# 해결: ① 이 PC의 미커밋 기록을 병합 "전에" 먼저 커밋해 보존
#       ② .gitattributes 의 merge=union 으로 양쪽 행을 모두 남김
#       ③ story_cards.json(1줄 JSON)은 used 배열을 합집합으로 직접 병합
#       ④ 병합 후 중복 행을 검사해 사람이 볼 수 있게 출력
#
# 사용법:
#   bash scripts/insta-sync.sh sync          # /insta 0단계에서 실행 (필수)
#   bash scripts/insta-sync.sh save "8/31~9/6"   # /insta 마지막 단계에서 실행 (필수)
#   bash scripts/insta-sync.sh check         # 중복 행 검사만
#
# ⚠️ 이 스크립트는 .claude/insta-data/ 와 .claude/skill-log.md 만 stage 한다.
#    작업 중인 다른 파일은 절대 커밋하지 않는다.

set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "❌ git 저장소가 아닙니다"; exit 1; }
cd "$ROOT"

TRACK=".claude/insta-data"
SCOPE=("$TRACK" ".claude/skill-log.md")
BR="$(git branch --show-current)"
PCNAME="$(hostname 2>/dev/null || echo unknown)"
MODE="${1:-sync}"

hr() { printf '%s\n' "────────────────────────────────────────"; }

ensure_attrs() {
  if [ ! -f "$TRACK/.gitattributes" ]; then
    echo "⚠️  $TRACK/.gitattributes 가 없습니다. union 병합이 안 걸려 기록이 날아갈 수 있습니다."
    echo "    (원본은 2026-09-01 커밋에 있음. 복원 후 다시 실행하세요.)"
    exit 1
  fi
}

# 스코프 안에 커밋 안 된 변경이 있으면 먼저 커밋한다 (병합 전 보존).
# $1 = 커밋 메시지. 변경이 있어 커밋했으면 0, 없었으면 1 반환.
# ⚠️ --amend 는 절대 쓰지 않는다. 커밋할 게 없을 때 amend를 돌리면
#    스코프 밖의 남의 커밋을 덮어쓴다.
commit_local_first() {
  local msg="$1" dirty=0
  git diff --quiet --  "${SCOPE[@]}" 2>/dev/null || dirty=1
  git diff --cached --quiet -- "${SCOPE[@]}" 2>/dev/null || dirty=1
  [ -n "$(git ls-files --others --exclude-standard -- "${SCOPE[@]}" 2>/dev/null)" ] && dirty=1
  if [ "$dirty" -eq 1 ]; then
    git add -- "${SCOPE[@]}" 2>/dev/null
    if git commit -q -m "$msg" -- "${SCOPE[@]}"; then
      echo "✅ 이 PC(${PCNAME})의 트래커 변경을 커밋했습니다: $msg"
      return 0
    fi
    echo "⚠️ 커밋 실패 - 위 git 출력을 확인하세요"
    return 1
  fi
  echo "· 이 PC에 커밋할 트래커 변경 없음"
  return 1
}

# story_cards.json 충돌을 used 배열 합집합으로 해소
resolve_story_cards() {
  local f="$TRACK/story_cards.json"
  git ls-files -u -- "$f" | grep -q . || return 0
  git show ":2:$f" > /tmp/.sc_ours.json 2>/dev/null
  git show ":3:$f" > /tmp/.sc_theirs.json 2>/dev/null
  python3 - "$f" <<'PY'
import json, sys
out = sys.argv[1]
def load(p):
    try:
        with open(p) as fh: return json.load(fh)
    except Exception: return {}
a, b = load('/tmp/.sc_ours.json'), load('/tmp/.sc_theirs.json')
merged, seen = [], set()
for src in (a.get('used', []), b.get('used', [])):
    for c in src:
        if c not in seen:
            seen.add(c); merged.append(c)
base = dict(a) or dict(b)
# 78장 한 바퀴를 넘겼으면 넘긴 만큼만 남기고 리셋 (원래 순환 규칙 유지)
if len(merged) > 78:
    merged = merged[78:]
base['used'] = merged
with open(out, 'w') as fh: json.dump(base, fh, ensure_ascii=False)
print(f"✅ story_cards.json used 배열 합집합 병합: {len(merged)}/78")
PY
  git add -- "$f"
}

# 대장에 같은 키의 행이 두 번 들어갔는지 검사 (union 병합의 부작용)
dup_check() {
  python3 - "$TRACK" <<'PY'
import re, sys, os, collections
track = sys.argv[1]
problems = 0

def rows(path):
    if not os.path.exists(path): return []
    out = []
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        s = line.strip()
        if s.startswith('|') and not re.match(r'^\|[\s\-:|]+\|$', s):
            cells = [c.strip() for c in s.strip('|').split('|')]
            out.append((i, cells, s))
    return out

# run_log: 1번 열(주차)이 키
seen = collections.defaultdict(list)
for i, c, s in rows(f'{track}/run_log.md'):
    if len(c) >= 6 and c[0] and '주차' not in c[0]:
        seen[c[0]].append(i)
for k, v in seen.items():
    if len(v) > 1:
        problems += 1
        print(f"🚨 run_log.md 주차 중복: {k}  (행 {', '.join(map(str, v))})")

# hook_history: (날짜, 훅텍스트)가 키. 도달 수치만 다른 쌍둥이 행을 잡는다
seen = collections.defaultdict(list)
for i, c, s in rows(f'{track}/hook_history.md'):
    if len(c) >= 5 and re.match(r'20\d\d-\d\d-\d\d', c[4]):
        seen[(c[4], c[1])].append((i, c[0]))
for (d, hook), v in seen.items():
    if len(v) > 1:
        problems += 1
        rs = ', '.join(f"{i}행(도달 {reach})" for i, reach in v)
        print(f"🚨 hook_history.md 훅 중복: {d} \"{hook[:34]}\"  → {rs}")
        print(f"   → 도달 수치가 큰 행만 남기고 지우세요")

if problems == 0:
    print("✅ 중복 행 없음")
else:
    print(f"\n⚠️ 중복 {problems}건. /insta 를 계속하기 전에 위 행을 손으로 정리하세요.")
sys.exit(0)
PY
}

case "$MODE" in
  sync)
    hr; echo "📥 insta 트래커 동기화 (PC: ${PCNAME}, 브랜치: ${BR})"; hr
    ensure_attrs
    commit_local_first "insta 트래커: ${PCNAME} 로컬 기록 선반영 ($(date +%Y-%m-%d))"

    if ! git fetch -q origin "$BR" 2>/dev/null; then
      echo "⚠️  fetch 실패(오프라인?). 원격 대조 없이 진행합니다 - 다른 PC 기록이 빠져 있을 수 있습니다."
    else
      BEHIND="$(git rev-list --count "HEAD..origin/$BR" 2>/dev/null || echo 0)"
      AHEAD="$(git rev-list --count "origin/$BR..HEAD" 2>/dev/null || echo 0)"
      echo "· 원격 대비: ${AHEAD} ahead / ${BEHIND} behind"
      if [ "$BEHIND" -gt 0 ]; then
        echo "· 다른 PC 커밋 ${BEHIND}건 병합 중..."
        git merge --no-edit "origin/$BR" >/dev/null 2>&1
        resolve_story_cards
        if git ls-files -u | grep -q .; then
          echo ""
          echo "❌ 자동 병합 안 된 충돌 파일:"
          git ls-files -u | awk '{print "   " $4}' | sort -u
          echo "   → 해결 후 'git commit' 하고 이 스크립트를 다시 실행하세요. /insta 는 중단."
          exit 2
        fi
        git commit -q --no-edit 2>/dev/null
        echo "✅ 병합 완료 (union 규칙으로 양쪽 행 모두 보존)"
      fi
    fi

    hr; echo "🔎 중복 행 검사"; hr
    dup_check

    hr; echo "📖 run_log.md 최근 3주차 (중복 생성 방지 근거)"; hr
    grep '^| 2026' "$TRACK/run_log.md" | tail -3 | cut -c1-150
    hr
    ;;

  save)
    LABEL="${2:-$(date +%Y-%m-%d)}"
    hr; echo "📤 insta 트래커 저장 (PC: ${PCNAME})"; hr
    ensure_attrs
    commit_local_first "insta 트래커 ${LABEL} (${PCNAME})"

    if git fetch -q origin "$BR" 2>/dev/null; then
      BEHIND="$(git rev-list --count "HEAD..origin/$BR" 2>/dev/null || echo 0)"
      if [ "$BEHIND" -gt 0 ]; then
        echo "· 푸시 전 원격 커밋 ${BEHIND}건 병합"
        git merge --no-edit "origin/$BR" >/dev/null 2>&1
        resolve_story_cards
        if git ls-files -u | grep -q .; then
          echo "❌ 충돌 발생. 해결 후 직접 push 하세요:"; git ls-files -u | awk '{print "   " $4}' | sort -u; exit 2
        fi
        git commit -q --no-edit 2>/dev/null
      fi
    fi

    dup_check
    echo ""
    echo "다음 명령으로 다른 PC에 반영하세요 (push 는 사용자 몫):"
    echo "   cd ~/lovtaro && git push"
    hr
    ;;

  check)
    dup_check
    ;;

  *)
    echo "사용법: bash scripts/insta-sync.sh sync|save|check"; exit 1
    ;;
esac
