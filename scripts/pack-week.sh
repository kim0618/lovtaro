#!/bin/bash
# 업로드용 전달 폴더 만들기 (구글드라이브 전송 실패 대책)
#
# content-output/{날짜}/ 에는 중간 산출물이 섞여 있다. youtube/frames/*.png는
# video.mp4를 만들고 나면 업로드에 쓰지 않는데 주당 약 28MB를 차지하고,
# 파일 개수도 많아 드라이브가 폴더를 zip으로 묶을 때 실패 원인이 된다.
# 이 스크립트는 실제로 업로드하는 파일만 골라 평평한 전달 폴더로 복사한다.
#
# 사용법:
#   bash scripts/pack-week.sh 2026-08-31_mon 2026-09-01_tue ...
#   bash scripts/pack-week.sh --with-scenes 2026-08-31_mon ...   → scene PNG도 포함
#
# 출력: content-output/_upload/{날짜}/  (기존 내용은 지우고 다시 만든다)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTENT="$ROOT/content-output"
DEST="$CONTENT/_upload"

WITH_SCENES=0
if [ "$1" = "--with-scenes" ]; then WITH_SCENES=1; shift; fi
[ $# -eq 0 ] && { echo "사용: bash scripts/pack-week.sh [--with-scenes] <날짜폴더> [...]"; exit 1; }

for day in "$@"; do
  src="$CONTENT/$day"
  [ -d "$src" ] || { echo "⏭  $day: 폴더 없음"; continue; }
  out="$DEST/$day"
  rm -rf "$out"; mkdir -p "$out"

  # 인스타: 릴스 + 카피 (scene PNG는 릴스 안에 이미 들어 있어 기본 제외)
  [ -f "$src/insta/reel.mp4" ]            && cp "$src/insta/reel.mp4"            "$out/"
  [ -f "$src/insta/copy.txt" ]            && cp "$src/insta/copy.txt"            "$out/insta-copy.txt"
  [ -f "$src/insta/reply_templates.txt" ] && cp "$src/insta/reply_templates.txt" "$out/"

  # 유튜브: 영상 + 카피 (frames/·scenes.txt는 중간 산출물이라 제외)
  [ -f "$src/youtube/video.mp4" ] && cp "$src/youtube/video.mp4" "$out/"
  [ -f "$src/youtube/copy.txt" ]  && cp "$src/youtube/copy.txt"  "$out/youtube-copy.txt"

  # 스토리 · 트위터
  [ -f "$src/story01.png" ] && cp "$src/story01.png" "$out/"
  [ -f "$src/story.txt" ]   && cp "$src/story.txt"   "$out/"
  [ -f "$src/twitter.txt" ] && cp "$src/twitter.txt" "$out/"

  if [ "$WITH_SCENES" -eq 1 ]; then
    for f in "$src"/insta/scene*.png; do [ -f "$f" ] && cp "$f" "$out/"; done
  fi

  echo "✅ $day → $(du -sh "$out" | cut -f1)"
done

echo "──────────────"
echo "전달 폴더: $DEST  (총 $(du -sh "$DEST" | cut -f1))"
