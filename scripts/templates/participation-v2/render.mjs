// 참여형 v2 릴스 렌더러 (화·목 슬롯 시험 적용, 2026-10-14 신설)
// 사용법: node scripts/templates/participation-v2/render.mjs content-output/2026-10-20_tue
//   입력: {날짜}/insta/part.json  (스키마는 같은 폴더 example.part.json)
//   출력: {날짜}/insta/reel.mp4 (11초, 무음, 앱에서 "아름다운 시작") + cover.png + check.png(검증용 묶음)
// 흐름: 훅+뒷면 3장(0~2.4) -> "3초 뒤 공개"(~3.4) -> 카운트다운 3·2·1(~6.4) -> 1·2·3 차례로 뒤집힘 -> 카드명 -> 끝장 "해석은 고정댓글"
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs'; import os from 'os'; import { execFileSync } from 'child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const HOME = os.homedir();
const dayDir = resolve(ROOT, process.argv[2] || '');
const specPath = join(dayDir, 'insta', 'part.json');
if (!fs.existsSync(specPath)) { console.error(`❌ ${specPath} 없음`); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
if (!Array.isArray(spec.hook) || !spec.hook.length) { console.error('❌ hook(줄 배열) 필요'); process.exit(1); }
if (!Array.isArray(spec.cards) || spec.cards.length !== 3) { console.error('❌ cards는 정확히 3장'); process.exit(1); }
for (const c of spec.cards) {
  for (const k of ['img', 'name', 'nameEn']) if (!c[k]) { console.error(`❌ cards 항목에 ${k} 누락`); process.exit(1); }
  const abs = resolve(ROOT, c.img);
  if (!fs.existsSync(abs)) { console.error(`❌ 카드 이미지 없음: ${abs}`); process.exit(1); }
  c.url = pathToFileURL(abs).href;
}

// 카드 뒷면 = 기존 릴스와 같은 컬러 스킴 뒷면 (scripts/lib/color-card-back-svg.mjs)
const cb = await import(pathToFileURL(join(ROOT, 'scripts/lib/color-card-back-svg.mjs')).href);
const schemes = spec.schemes && spec.schemes.length === 3 ? spec.schemes : cb.pickRandomSchemes(3);
const HALO = { navy: 'rgba(70,120,255,.85)', indigo: 'rgba(120,100,255,.85)', plum: 'rgba(170,80,230,.9)', teal: 'rgba(60,200,210,.8)',
  rose: 'rgba(230,70,120,.85)', emerald: 'rgba(60,200,130,.8)', amber: 'rgba(240,170,60,.8)' };
const page_spec = {
  hook: spec.hook, cards: spec.cards, schemes, halo: schemes.map(k => HALO[k] || 'rgba(200,170,255,.8)'),
  defs: cb.colorCardBackDefs(), rb: Object.fromEntries(schemes.map(k => [k, cb.colorCardBackSvg(60, 99, 1, k)])),
};

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
const emulib = join(HOME, '.local/emulib');
if (fs.existsSync(emulib)) launch.env = { ...process.env, LD_LIBRARY_PATH: emulib + ':' + (process.env.LD_LIBRARY_PATH || '') };

const TOTAL = 11.0;
const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(join(HERE, 'participation-v2.html')).href);
await page.evaluate(s => init(s), page_spec);
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
await page.evaluate(() => fitNames());

const tmp = fs.mkdtempSync(join(os.tmpdir(), 'part-v2-'));
const outInsta = join(dayDir, 'insta');
const n = Math.round(TOTAL * 30);
for (let i = 0; i < n; i++) {
  await page.evaluate(t => render(t), i / 30);
  await page.screenshot({ path: join(tmp, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
}
const keys = [0.1, 2.9, 4.0, 6.75, 8.0, 10.5];
const stills = [];
for (const t of keys) { await page.evaluate(t => render(t), t); const p = join(tmp, `key_${t}.png`); await page.screenshot({ path: p }); stills.push(p); }
await browser.close();
fs.copyFileSync(stills[0], join(outInsta, 'cover.png'));
const cf = join(outInsta, 'check_frames'); fs.rmSync(cf, { recursive: true, force: true }); fs.mkdirSync(cf);
stills.forEach((p, i) => fs.copyFileSync(p, join(cf, `${String(i + 1).padStart(2, '0')}_${keys[i]}s.png`)));

const sharp = createRequire(ROOT + '/')('sharp');
const W = 405, H = 720;
const tiles = await Promise.all(stills.map(p => sharp(p).resize(W, H).toBuffer()));
await sharp({ create: { width: W * tiles.length + 6 * (tiles.length - 1), height: H, channels: 3, background: '#333' } })
  .composite(tiles.map((b, i) => ({ input: b, left: i * (W + 6), top: 0 }))).png().toFile(join(outInsta, 'check.png'));

let FF = process.env.FFMPEG || 'ffmpeg';
try { FF = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim(); } catch {}
execFileSync(FF, ['-y', '-nostdin', '-loglevel', 'error', '-framerate', '30', '-i', join(tmp, '%05d.jpg'),
  '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21',
  '-maxrate', '9M', '-bufsize', '18M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest',
  '-movflags', '+faststart', join(outInsta, 'reel.mp4')]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✅ ${outInsta}/reel.mp4 (${TOTAL}초, 뒷면 ${schemes.join('/')}) + cover.png + check.png + check_frames/`);
