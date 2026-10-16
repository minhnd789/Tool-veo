// Tạo phụ đề tự động bằng whisper.cpp (chạy trên CPU).
// Cách dùng: node scripts/transcribe.mjs public/input.mp4 [ngôn ngữ=vi] [model=small]
// Kết quả: public/<tên file>.captions.json (kiểu Caption của @remotion/captions)
// và public/<tên file>.srt.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from '@remotion/install-whisper-cpp';
import { serializeSrt, createTikTokStyleCaptions } from '@remotion/captions';

const [input, language = 'vi', model = 'small'] = process.argv.slice(2);
if (!input) {
  console.error('Cách dùng: node scripts/transcribe.mjs <video> [ngôn ngữ=vi] [model=small]');
  process.exit(1);
}

const whisperPath = path.resolve('whisper.cpp');
const version = '1.5.5';
await installWhisperCpp({ to: whisperPath, version });
try {
  await downloadWhisperModel({ model, folder: whisperPath });
} catch (err) {
  // Xóa file tải dở để lần chạy sau tải lại từ đầu.
  rmSync(path.join(whisperPath, `ggml-${model}.bin`), { force: true });
  console.error('Không tải được model Whisper từ huggingface.co. Kiểm tra mạng hoặc cho phép huggingface.co.');
  throw err;
}

// whisper.cpp cần file WAV 16kHz mono.
const tmpDir = path.resolve('out');
mkdirSync(tmpDir, { recursive: true });
const wav = path.join(tmpDir, 'whisper-input.wav');
execFileSync(ffmpeg, ['-loglevel', 'error', '-y', '-i', input, '-ar', '16000', '-ac', '1', wav]);

const output = await transcribe({
  inputPath: wav,
  whisperPath,
  whisperCppVersion: version,
  model,
  language,
  tokenLevelTimestamps: true,
  printOutput: false,
});
const { captions } = toCaptions({ whisperCppOutput: output });

const base = path.join('public', path.parse(input).name);
writeFileSync(`${base}.captions.json`, JSON.stringify(captions, null, 2));

const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 });
const srt = serializeSrt({
  lines: pages.map((p) => [
    { text: p.text.trim(), startMs: p.startMs, endMs: p.startMs + p.durationMs, timestampMs: null, confidence: null },
  ]),
});
writeFileSync(`${base}.srt`, srt);

console.log(`Đã tạo ${base}.captions.json và ${base}.srt (${captions.length} từ)`);
