/**
 * 기존 콘텐츠 이미지 크기 보정
 * - 릴스: 1080x1920 (9:16)
 * - 피드: 1080x1350 (4:5)
 * - 캐러셀: 1080x1350 (4:5) - 피드와 동일
 * - 스토리/poll-story: 이미 1080x1920 OK
 *
 * 실행: node scripts/fix-image-sizes.mjs
 */
import sharp from 'sharp'
import { readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputDir = resolve(__dirname, '..', 'content-output')

const REEL_W = 1080, REEL_H = 1920
const FEED_W = 1080, FEED_H = 1350

async function resizeImage(filePath, targetW, targetH) {
  const meta = await sharp(filePath).metadata()
  if (meta.width === targetW && meta.height === targetH) return false

  // 배경 생성 (다크)
  const bg = await sharp({
    create: { width: targetW, height: targetH, channels: 4, background: { r: 5, g: 7, b: 13, alpha: 1 } }
  }).png().toBuffer()

  // 원본을 비율 유지하며 리사이즈
  const resized = await sharp(filePath)
    .resize(targetW, targetH, { fit: 'contain', background: { r: 5, g: 7, b: 13, alpha: 1 } })
    .png({ quality: 90 })
    .toBuffer()

  writeFileSync(filePath, resized)
  return true
}

async function main() {
  const dirs = readdirSync(outputDir).filter(d => d.startsWith('4월_'))
  let fixed = 0

  for (const dir of dirs) {
    const dayDir = resolve(outputDir, dir)

    // 릴스 폴더
    const reelDir = resolve(dayDir, 'reel')
    if (existsSync(reelDir)) {
      const files = readdirSync(reelDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      for (const f of files) {
        const fp = resolve(reelDir, f)
        const changed = await resizeImage(fp, REEL_W, REEL_H)
        if (changed) {
          console.log(`✅ 릴스 ${dir}/${f} → ${REEL_W}x${REEL_H}`)
          fixed++
        }
      }
    }

    // 피드 폴더
    const feedDir = resolve(dayDir, 'feed')
    if (existsSync(feedDir)) {
      const files = readdirSync(feedDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      for (const f of files) {
        const fp = resolve(feedDir, f)
        const changed = await resizeImage(fp, FEED_W, FEED_H)
        if (changed) {
          console.log(`✅ 피드 ${dir}/${f} → ${FEED_W}x${FEED_H}`)
          fixed++
        }
      }
    }

    // 캐러셀 폴더 (피드와 동일 크기)
    const carouselDir = resolve(dayDir, 'carousel')
    if (existsSync(carouselDir)) {
      const files = readdirSync(carouselDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      for (const f of files) {
        const fp = resolve(carouselDir, f)
        const changed = await resizeImage(fp, FEED_W, FEED_H)
        if (changed) {
          console.log(`✅ 캐러셀 ${dir}/${f} → ${FEED_W}x${FEED_H}`)
          fixed++
        }
      }
    }
  }

  if (fixed === 0) {
    console.log('모든 이미지가 이미 올바른 크기입니다')
  } else {
    console.log(`\n🎉 총 ${fixed}개 이미지 크기 수정 완료`)
  }
}

main().catch(console.error)
