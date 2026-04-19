/**
 * 1080x1920 shortform 세로형 템플릿 테스트 렌더.
 * Moon 2줄 / Ace of Cups 4줄 / Tower 6줄 - 1080x1350 본문 샘플과 동일 콘텐츠.
 *
 * 실행: node scripts/test-carousel-shortform.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { carouselShortformSlide } from './lib/carousel-shortform-template.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../design-handoff/samples-shortform')
mkdirSync(outDir, { recursive: true })

const cases = [
  {
    file: 'moon-2lines.png',
    cardSlug: 'moon',
    nameEn: 'THE MOON',
    titleKo: ['흐려진 마음의', '진짜 얼굴'],
    subtitleEn: 'what the tides quietly hide',
    bodyLines: [
      '보이는 것과 느껴지는 것',
      '그 사이의 결을 조용히 살펴봅니다',
    ],
    keywords: ['직감', '불안', '흐림'],
    index: 3,
    total: 5,
  },
  {
    file: 'ace-of-cups-4lines.png',
    cardSlug: 'ace-of-cups',
    nameEn: 'ACE OF CUPS',
    titleKo: ['처음 열리는', '감정의 샘'],
    subtitleEn: 'a quiet spring beginning',
    bodyLines: [
      '닫혀 있던 마음 한 자리가',
      '조용히 열리기 시작하는 시기',
      '작은 설렘, 다정한 연락 하나에도',
      '감정이 맑게 차오르는 때입니다',
    ],
    keywords: ['시작', '열림', '흘러듦'],
    index: 4,
    total: 5,
  },
  {
    file: 'tower-6lines.png',
    cardSlug: 'tower',
    nameEn: 'THE TOWER',
    titleKo: ['무너지며', '드러나는 진실'],
    subtitleEn: 'what the lightning reveals',
    bodyLines: [
      '오래 쌓아온 구조가 흔들리는 시기',
      '익숙했던 관계의 모양이',
      '한 번 무너져 내릴 수 있습니다',
      '하지만 그 흔들림은 끝이 아니라',
      '가려져 있던 진심을 드러내는',
      '조용한 다시-시작의 순간입니다',
    ],
    keywords: ['균열', '해체', '드러남'],
    index: 5,
    total: 5,
  },
]

for (const c of cases) {
  const { file, ...props } = c
  const svg = carouselShortformSlide(props)
  const outPath = resolve(outDir, file)
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log(`✓ ${file}  (bodyLines: ${props.bodyLines.length})`)
}

console.log(`\nSaved to: ${outDir}`)
