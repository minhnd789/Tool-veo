// Chạy scripts/fight_sfx.py bằng bản Python có trên máy.
// Windows thường chỉ có `py` hoặc `python`, không có `python3`.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./fight_sfx.py', import.meta.url));
const candidates = process.platform === 'win32'
  ? [['py', ['-3']], ['python', []], ['python3', []]]
  : [['python3', []], ['python', []]];

for (const [cmd, args] of candidates) {
  const r = spawnSync(cmd, [...args, script], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  if (r.error?.code === 'ENOENT') continue;
  process.exit(r.status ?? 1);
}

console.error('Không tìm thấy Python 3. Cài từ https://www.python.org/downloads/ rồi chạy: pip install numpy');
process.exit(1);
