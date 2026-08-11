#!/bin/bash
# 영상 렌더링 (인스타 릴스 + 유튜브 쇼츠)
#
# 사용법:
#   bash scripts/render-videos.sh insta   2026-07-20_mon [...]   → insta/reel.mp4
#   bash scripts/render-videos.sh youtube 2026-07-20_mon [...]   → youtube/video.mp4
#   bash scripts/render-videos.sh all     2026-07-20_mon [...]   → 둘 다
#
# 인스타 릴스 장면 길이 규칙 (장면 수 기준):
#   2장(참여형)   3+4          = 7초
#   3장(소개형)   3+3+4        = 10초
#   6장(일 예고)  2×5+4        = 14초
# 유튜브는 youtube/scenes.txt의 `파일명:초` 정의를 따름
set -e

FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())" 2>/dev/null || echo ffmpeg)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTENT="$ROOT/content-output"
MODE="$1"; shift

# $1=png $2=초 $3=출력 $4=줌상한(기본 1.08) $5=페이드인(기본 1, 0이면 생략)
# $6=프레임당 줌 증가폭(기본 0.0004). 유튜브는 정지 화면 느낌을 줄이려 더 크게 준다
# 첫 클립은 fadein=0으로 호출 → 첫 프레임이 검은 화면이 아닌 실제 훅 이미지가 되어
# 유튜브/인스타 자동 썸네일이 검게 잡히는 문제를 방지
make_clip() {
  local img="$1" dur="$2" out="$3" zmax="${4:-1.08}" fadein="${5:-1}" zstep="${6:-0.0004}"
  local frames=$((dur * 30))
  local fadeout; fadeout=$(echo "$dur - 0.35" | bc)
  local fin=0.3
  [ "$dur" -le 2 ] && { fin=0.25; fadeout=$(echo "$dur - 0.3" | bc); }
  local fadein_f="fade=t=in:st=0:d=$fin,"
  [ "$fadein" -eq 0 ] && fadein_f=""
  # -nostdin 필수: 없으면 ffmpeg가 while 루프의 stdin을 삼켜 파일명이 잘림
  "$FF" -nostdin -y -loglevel error -i "$img" \
    -vf "scale=2160:3840,zoompan=z='min(zoom+$zstep,$zmax)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$frames:s=1080x1920:fps=30,${fadein_f}fade=t=out:st=$fadeout:d=0.35,format=yuv420p" \
    -c:v libx264 -preset fast -crf 20 "$out"
}

render_insta() {
  local d="$1" src="$CONTENT/$1/insta"
  [ -d "$src" ] || { echo "⏭  $d: insta 폴더 없음"; return; }
  local scenes=("$src"/scene*.png)
  local n=${#scenes[@]}
  local durs
  case $n in
    2) durs=(3 4) ;;
    3) durs=(3 3 4) ;;
    6) durs=(2 2 2 2 2 4) ;;
    *) echo "⏭  $d: 장면 ${n}개는 길이 규칙 미정 (직접 지정 필요)"; return ;;
  esac
  local tmp; tmp=$(mktemp -d)
  : > "$tmp/list.txt"
  for i in "${!scenes[@]}"; do
    local fadein=1; [ "$i" -eq 0 ] && fadein=0
    make_clip "${scenes[$i]}" "${durs[$i]}" "$tmp/c$i.mp4" 1.08 "$fadein"
    echo "file '$tmp/c$i.mp4'" >> "$tmp/list.txt"
  done
  "$FF" -nostdin -y -loglevel error -f concat -safe 0 -i "$tmp/list.txt" -c copy "$src/reel.mp4"
  rm -rf "$tmp"
  echo "✅ $d insta/reel.mp4 ($("$FF" -i "$src/reel.mp4" 2>&1 | grep -oP 'Duration: \K[0-9:.]+'))"
}

render_youtube() {
  local d="$1" yt="$CONTENT/$1/youtube"
  [ -f "$yt/scenes.txt" ] || { echo "⏭  $d: youtube/scenes.txt 없음"; return; }
  local tmp; tmp=$(mktemp -d)
  : > "$tmp/list.txt"
  local idx=0
  while IFS=: read -r img dur; do
    [ -z "$img" ] && continue
    local fadein=1; [ "$idx" -eq 0 ] && fadein=0
    make_clip "$yt/frames/$img" "$dur" "$tmp/${img%.png}.mp4" 1.12 "$fadein" 0.0010
    echo "file '$tmp/${img%.png}.mp4'" >> "$tmp/list.txt"
    idx=$((idx + 1))
  done < "$yt/scenes.txt"
  "$FF" -nostdin -y -loglevel error -f concat -safe 0 -i "$tmp/list.txt" -c copy "$yt/video.mp4"
  rm -rf "$tmp"
  echo "✅ $d youtube/video.mp4 ($("$FF" -i "$yt/video.mp4" 2>&1 | grep -oP 'Duration: \K[0-9:.]+'))"
}

for day in "$@"; do
  case "$MODE" in
    insta)   render_insta "$day" ;;
    youtube) render_youtube "$day" ;;
    all)     render_insta "$day"; render_youtube "$day" ;;
    *) echo "MODE는 insta | youtube | all"; exit 1 ;;
  esac
done
