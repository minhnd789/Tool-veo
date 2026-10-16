// Kiểm tra nhanh: import từng thư viện và chạy thử SVGO, Satori, FFmpeg.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const pkgs = [
  'svgo', 'satori', 'gsap', 'animejs', 'motion', '@rive-app/canvas',
  '@lottiefiles/dotlottie-web', 'remotion', '@motion-canvas/core', 'three',
  '@react-three/fiber', '@react-three/drei', '@react-three/rapier',
  '@react-three/postprocessing', 'howler', 'mediabunny', 'ffmpeg-static',
];

let failed = 0;
for (const name of pkgs) {
  try {
    await import(name);
    console.log(`OK   ${name}`);
  } catch (err) {
    // Một số thư viện chỉ chạy trên trình duyệt; chỉ cần đã cài là đủ.
    const installed = existsSync(new URL(`../node_modules/${name}/package.json`, import.meta.url));
    console.log(`${installed ? 'OK*' : 'FAIL'} ${name}${installed ? ' (chỉ chạy trên trình duyệt)' : ''}`);
    if (!installed) failed++;
  }
}

const { optimize } = await import('svgo');
const svg = optimize('<svg xmlns="http://www.w3.org/2000/svg"><!-- x --><rect width="10" height="10"/></svg>').data;
console.log('SVGO   ', svg);

const ffmpeg = (await import('ffmpeg-static')).default;
console.log('FFmpeg ', execFileSync(ffmpeg, ['-version']).toString().split('\n')[0]);

const skills = readdirSync(new URL('../.claude/skills', import.meta.url));
console.log(`Skills  ${skills.length}: ${skills.join(', ')}`);

process.exit(failed ? 1 : 0);
