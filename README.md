# Tool Edit Video

Bộ công cụ làm video, animation, 3D và âm thanh bằng JavaScript/React.

## Cài đặt

```bash
npm install
npm run check   # kiểm tra mọi thư viện đã cài đúng
```

Cần Node.js 18 trở lên.

### Cài trên Windows (ví dụ `D:\AI Edit Video`)

1. Cài [Node.js LTS](https://nodejs.org), [Git](https://git-scm.com/download/win) và (nếu cần âm thanh NinjaFight) [Python 3](https://www.python.org/downloads/) — khi cài Python nhớ tick **Add python.exe to PATH**.
2. Mở PowerShell và tải mã nguồn:
   ```powershell
   cd D:\
   git clone https://github.com/minhnd789/tool-veo.git "AI Edit Video"
   ```
3. Mở thư mục `D:\AI Edit Video` và nhấp đúp `cai-dat-windows.bat`.
4. Chạy `npm run studio` trong thư mục đó, trình duyệt sẽ mở Remotion Studio.

## Edit một video

1. Chép video vào `public/input.mp4`.
2. Sửa nội dung trong `src/EditVideo.tsx` (mẫu có sẵn: phát video gốc và chèn tiêu đề động).
3. Xem trước: `npm run studio`. Xuất file: `npm run render EditVideo out/video.mp4`.

## Cảnh đánh nhau NinjaFight

Video 30 giây (1920×1080) hai nhân vật chibi đánh nhau, dựng hoàn toàn bằng code trong `src/fight/`:
intro VS, 3 lần chém, hoả độn cầu lửa, Chidori, bầy quạ, combo 12 hit, đối chưởng lửa với sét.

1. Đặt ảnh nhân vật PNG đã tách nền vào `public/fight/itachi.png` và `public/fight/sasuke.png`.
2. Tạo âm thanh: `npm run fight:sfx` (cần Python 3 và numpy).
3. Xuất video: `npm run render NinjaFight out/fight.mp4`.

Kịch bản (vị trí, mốc thời gian từng đòn) nằm trong `src/fight/timeline.ts`; hiệu ứng nằm trong `src/fight/Effects.tsx`.

## Phụ đề tự động (Whisper)

```bash
npm run captions public/input.mp4          # tiếng Việt, model small
npm run captions public/input.mp4 en base  # đổi ngôn ngữ / model
```

Script dùng [whisper.cpp](https://github.com/ggerganov/whisper.cpp) chạy trên CPU. Lần đầu chạy,
nó tự tải và build whisper.cpp vào thư mục `whisper.cpp/`, rồi tải model từ `huggingface.co`.
Kết quả là `public/<tên>.captions.json` (để chèn phụ đề động bằng Remotion) và `public/<tên>.srt`.

Model: `tiny`, `base`, `small` (mặc định), `medium`, `large-v3-turbo`. Model càng lớn thì càng chính
xác nhưng chạy càng lâu.

## Các thư viện đã cài (20 repo)

| Lớp | Repo | Cài dưới dạng |
| --- | --- | --- |
| Agent skills | [remotion-dev/skills](https://github.com/remotion-dev/skills) | `.claude/skills/remotion-*` |
| Agent skills | [motiondivision/ai-kit](https://github.com/motiondivision/ai-kit) | `.claude/skills/motion` |
| Agent skills | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `.claude/skills/gsap-*` |
| Design | [svg/svgo](https://github.com/svg/svgo) | `svgo` |
| Design | [vercel/satori](https://github.com/vercel/satori) | `satori` |
| Animation | [greensock/GSAP](https://github.com/greensock/GSAP) | `gsap` |
| Animation | [juliangarnier/anime](https://github.com/juliangarnier/anime) | `animejs` |
| Animation | [motiondivision/motion](https://github.com/motiondivision/motion) | `motion` |
| Animation | [rive-app/rive-wasm](https://github.com/rive-app/rive-wasm) | `@rive-app/canvas` |
| Animation | [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) | `@lottiefiles/dotlottie-web` |
| Video | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | `remotion`, `@remotion/cli`, `@remotion/player` |
| Video | [motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas) | `@motion-canvas/core`, `@motion-canvas/2d`, `@motion-canvas/ui`, `@motion-canvas/vite-plugin` |
| 3D | [mrdoob/three.js](https://github.com/mrdoob/three.js) | `three` |
| 3D | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | `@react-three/fiber` |
| 3D | [pmndrs/drei](https://github.com/pmndrs/drei) | `@react-three/drei` |
| 3D | [pmndrs/react-three-rapier](https://github.com/pmndrs/react-three-rapier) | `@react-three/rapier` |
| 3D | [pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing) | `@react-three/postprocessing`, `postprocessing` |
| Âm thanh và xuất bản | [goldfire/howler.js](https://github.com/goldfire/howler.js) | `howler` |
| Âm thanh và xuất bản | [Vanilagy/mediabunny](https://github.com/Vanilagy/mediabunny) | `mediabunny` |
| Âm thanh và xuất bản | [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) | `ffmpeg-static` (bản FFmpeg dựng sẵn) |

Công cụ dev: `vite` 5 (Motion Canvas chưa hỗ trợ Vite mới hơn), `@vitejs/plugin-react`, `typescript`.

## Agent skills

Thư mục `.claude/skills/` chứa 21 skill do Remotion, Motion và GSAP cung cấp. Claude Code
tự nạp chúng khi làm việc trong repo này. Nguồn gốc (commit):

- remotion-dev/skills @ 7ba4dcf
- motiondivision/ai-kit @ b7e2c68 (`plugins/motion/skills/motion`)
- greensock/gsap-skills @ aed9cfd (MIT)
