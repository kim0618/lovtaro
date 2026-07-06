#!/usr/bin/env python3
"""운영자 카드뽑기 도구(/rt-draw-k39f2)용 경량 카드 썸네일 생성.

원본 카드 이미지(cards-png 메이저 ~1MB, mcards 마이너 ~2.7MB)는 폰에서 뽑을 때
장당 수 MB라 느리다. 도구는 캔버스에서 280px로만 쓰므로 560x840 JPEG로 축소해
public/images/cards-draw/{card_id}.jpg 로 저장한다 (장당 ~97KB).

카드 아트가 바뀌면 재실행: python3 scripts/gen-draw-thumbs.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'public' / 'images'
OUT = ROOT / 'cards-draw'
OUT.mkdir(parents=True, exist_ok=True)

MAJOR = ['fool', 'magician', 'priestess', 'empress', 'emperor', 'hierophant', 'lovers',
         'chariot', 'strength', 'hermit', 'wheel', 'justice', 'hanged', 'death',
         'temperance', 'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'world']
FILE_SLUG = {'priestess': 'high-priestess', 'wheel': 'wheel-of-fortune', 'hanged': 'hanged-man'}
SUITS = {'cups': 'Cups', 'pentacles': 'Pentacles', 'swords': 'Swords', 'wands': 'Wands'}
RANKS = {'ace': 'Ace', 'two': 'Two', 'three': 'Three', 'four': 'Four', 'five': 'Five',
         'six': 'Six', 'seven': 'Seven', 'eight': 'Eight', 'nine': 'Nine', 'ten': 'Ten',
         'page': 'Page', 'knight': 'Knight', 'queen': 'Queen', 'king': 'King'}


def jobs():
    for cid in MAJOR:
        yield cid, ROOT / 'cards-png' / f'{FILE_SLUG.get(cid, cid)}.png'
    for suit in SUITS:
        for rank in RANKS:
            yield f'{rank}-of-{suit}', ROOT / 'mcards' / suit / f'{RANKS[rank]} of {SUITS[suit]}.png'


def main():
    made = miss = total = 0
    for cid, src in jobs():
        if not src.exists():
            print('  MISSING:', src)
            miss += 1
            continue
        img = Image.open(src).convert('RGB')
        img.thumbnail((560, 840), Image.LANCZOS)
        dst = OUT / f'{cid}.jpg'
        img.save(dst, 'JPEG', quality=82, optimize=True)
        total += dst.stat().st_size
        made += 1
    print(f'생성 {made}장, 누락 {miss}장, 전체 {total/1024/1024:.1f}MB (평균 {total/max(1,made)/1024:.0f}KB)')


if __name__ == '__main__':
    main()
