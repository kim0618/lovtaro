// 사연형 릴스 렌더러 (수·금 슬롯, 2026-10-14 신설)
// 사용법: node scripts/templates/story-reel/render.mjs content-output/2026-10-15_wed [--youtube]
//   --youtube : 끝 문구를 유튜브용(설명란 링크)으로 바꿔 youtube/video.mp4 로 렌더 (인스타 산출물은 건드리지 않음)
//   입력: {날짜}/insta/story.json  (스키마는 같은 폴더 example.story.json)
//   출력: {날짜}/insta/reel.mp4 (무음, 인스타 앱에서 음악 얹음) + cover.png + check.png(검증용 묶음)
// 렌더 방식: story-reel.html 을 헤드리스 크롬으로 30fps 프레임 캡처 -> ffmpeg 인코딩
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs'; import os from 'os'; import { execFileSync } from 'child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const HOME = os.homedir();
const dayDir = resolve(ROOT, process.argv[2] || '');
const YT = process.argv.includes('--youtube');
const specPath = join(dayDir, 'insta', 'story.json');
if (!fs.existsSync(specPath)) { console.error(`❌ ${specPath} 없음`); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
for (const k of ['card', 'cardName', 'cardLine', 'hook', 'story', 'comfort'])
  if (!spec[k]) { console.error(`❌ story.json 필드 누락: ${k}`); process.exit(1); }
if (spec.story.length !== 4) { console.error('❌ story는 4줄이어야 한다'); process.exit(1); }
spec.cta = spec.cta || ['지금 내 상황의 카드는', '프로필 링크에서 뽑아보세요'];
if (YT) spec.cta = spec.ctaYoutube || ['지금 내 상황의 카드는', '설명란 링크에서 뽑아보세요'];
const cardAbs = resolve(ROOT, spec.card);
if (!fs.existsSync(cardAbs)) { console.error(`❌ 카드 이미지 없음: ${cardAbs}`); process.exit(1); }
spec.cardUrl = pathToFileURL(cardAbs).href;

// ---- 타임라인: 읽는 속도 기준 (음성 없음) ----
const FILL = 11.0;            // 초당 채워지는 글자 수 (읽기보다 약간 빠르게)
const HOLD = 1.35;            // 다 채워진 뒤 머무는 시간
const strip = m => m.replace(/\|/g, ' ').replace(/~/g, '').replace(/\*/g, '');
const items = []; let t = 0;
const push = (scene, dur, text) => { const it = { scene, start: +t.toFixed(3), dur, text }; items.push(it); t += dur; return it; };
push('cover', spec.coverDur || 2.4);
[...spec.story, spec.comfort].forEach((m, i) => {
  const toks = strip(m).split(/\s+/).filter(Boolean); let c = 0.05; const words = [];
  for (const w of toks) { const d = [...w].length / FILL; words.push({ t: +c.toFixed(3), d: +d.toFixed(3) }); c += d + 0.1; }
  const it = push(i < 4 ? `s${i + 1}` : 's5', +(c + HOLD).toFixed(2), m); it.words = words;
});
push('end', 4.0); push('end2', 4.0);
const tl = { items, total: +(t + 0.3).toFixed(2) };

// ---- 플레이라이트 찾기 (저장소 -> 이 PC 도구 폴더) ----
let chromium;
for (const base of [ROOT + '/', HOME + '/.claude/tools/calc-runner/']) {
  try { chromium = createRequire(base)('playwright').chromium; break; } catch {}
}
if (!chromium) {
  console.error('❌ playwright 없음. 한 번만 설치:\n  mkdir -p ~/.claude/tools/calc-runner && cd ~/.claude/tools/calc-runner && npm i playwright && npx playwright install chromium');
  process.exit(1);
}
const launch = { args: ['--allow-file-access-from-files'] };
const cache = join(HOME, '.cache/ms-playwright');
if (process.env.LOVTARO_CHROME) launch.executablePath = process.env.LOVTARO_CHROME;
else if (fs.existsSync(cache)) {
  const c = fs.readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
  const exe = c && join(cache, c, 'chrome-linux64/chrome');
  if (exe && fs.existsSync(exe)) launch.executablePath = exe;
}
const emulib = join(HOME, '.local/emulib');   // sudo 없는 WSL에서 크롬 의존 라이브러리
if (fs.existsSync(emulib)) launch.env = { ...process.env, LD_LIBRARY_PATH: emulib + ':' + (process.env.LD_LIBRARY_PATH || '') };

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(join(HERE, 'story-reel.html')).href);
await page.evaluate(([tl, spec]) => init(tl, spec), [tl, spec]);
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);

const tmp = fs.mkdtempSync(join(os.tmpdir(), 'story-reel-'));
const outInsta = join(dayDir, YT ? 'youtube' : 'insta');
fs.mkdirSync(outInsta, { recursive: true });
const n = Math.ceil(tl.total * 30);
for (let i = 0; i < n; i++) {
  await page.evaluate(t => render(t), i / 30);
  await page.screenshot({ path: join(tmp, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  if (i % 300 === 0) process.stdout.write(`  frame ${i}/${n}\n`);
}
// 검증용 정지 화면: 첫 장 + 사연 5장면(다 채워진 순간) + 카드 + 링크
const keys = [['cover', 0]];
for (const it of items) {
  if (/^s\d$/.test(it.scene)) keys.push([it.scene, it.start + it.dur - 0.5]);
  if (it.scene === 'end' || it.scene === 'end2') keys.push([it.scene, it.start + 3.2]);
}
const stills = [];
for (const [k, tt] of keys) {
  await page.evaluate(t => render(t), tt);
  const p = join(tmp, `key_${k}.png`); await page.screenshot({ path: p }); stills.push(p);
}
await browser.close();
fs.copyFileSync(stills[0], join(outInsta, 'cover.png'));
// 원본 해상도 검증 프레임 (자소·카드명 확인은 이걸로)
const cf = join(outInsta, 'check_frames'); fs.rmSync(cf, { recursive: true, force: true }); fs.mkdirSync(cf);
stills.forEach((p, i) => fs.copyFileSync(p, join(cf, `${String(i + 1).padStart(2, '0')}_${keys[i][0]}.png`)));

const sharp = createRequire(ROOT + '/')('sharp');
const W = 405, H = 720;
const tiles = await Promise.all(stills.map(p => sharp(p).resize(W, H).toBuffer()));
await sharp({ create: { width: W * tiles.length + 6 * (tiles.length - 1), height: H, channels: 3, background: '#333' } })
  .composite(tiles.map((b, i) => ({ input: b, left: i * (W + 6), top: 0 }))).png().toFile(join(outInsta, 'check.png'));

let FF = process.env.FFMPEG || 'ffmpeg';
try { FF = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim(); } catch {}
execFileSync(FF, ['-y', '-nostdin', '-loglevel', 'error', '-framerate', '30', '-i', join(tmp, '%05d.jpg'),
  '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21',
  '-maxrate', '6M', '-bufsize', '12M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest',
  '-movflags', '+faststart', join(outInsta, YT ? 'video.mp4' : 'reel.mp4')]);
fs.rmSync(tmp, { recursive: true, force: true });
const outName = YT ? 'video.mp4' : 'reel.mp4';
console.log(`✅ ${outInsta}/${outName} (${tl.total}초) + cover.png + check.png + check_frames/`);
