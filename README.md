# Tool Edit Video

Bộ công cụ làm video, animation, 3D và âm thanh bằng JavaScript/React.

## Cài đặt

```bash
npm install
npm run check   # kiểm tra mọi thư viện đã cài đúng
```

Cần Node.js 18 trở lên.

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
