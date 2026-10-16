import { existsSync } from 'node:fs';
import { Config } from '@remotion/cli/config';

// Trong máy cloud của Claude Code không tải được Chrome của Remotion,
// nên dùng bản Chromium headless có sẵn nếu tìm thấy.
const headlessShell = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(headlessShell)) {
  Config.setBrowserExecutable(headlessShell);
}
