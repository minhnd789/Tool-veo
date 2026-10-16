import { Easing, interpolate, random } from 'remotion';

// Toàn bộ kịch bản tính theo giây; các component đổi frame -> giây bằng fps.
export const DURATION_S = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const GROUND_Y = 930;

export const ITACHI = { src: 'fight/itachi.png', w: 1024, h: 1536, height: 560, hand: [0.68, 0.57], eyes: [[0.27, 0.31], [0.535, 0.315]] } as const;
export const SASUKE = { src: 'fight/sasuke.png', w: 1086, h: 1448, height: 560, hand: [0.18, 0.6], eyes: [[0.43, 0.395], [0.645, 0.405]] } as const;

type Key = [number, number];
const ease = Easing.inOut(Easing.cubic);

export const kf = (t: number, keys: Key[], easing = ease) =>
  interpolate(
    t,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing },
  );

export const between = (t: number, a: number, b: number) => t >= a && t < b;
export const progress = (t: number, a: number, b: number, easing?: (n: number) => number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

// --- Chuỗi combo 20.4s–24s: mỗi 0.3s một đòn, hai bên luân phiên tấn công.
export const COMBO_START = 20.4;
export const COMBO_END = 24.0;
const COMBO_STEP = 0.3;

const combo = (t: number) => {
  if (!between(t, COMBO_START, COMBO_END)) return null;
  const u = (t - COMBO_START) / COMBO_STEP;
  const k = Math.floor(u);
  const bump = Math.sin(Math.PI * (u - k));
  return { k, bump, itachiAttacks: k % 2 === 0 };
};

export const comboHitTimes = Array.from(
  { length: Math.round((COMBO_END - COMBO_START) / COMBO_STEP) },
  (_, k) => COMBO_START + k * COMBO_STEP + COMBO_STEP / 2,
);

// --- Vị trí nhân vật: x là độ lệch so với giữa màn hình, y âm là nhảy lên.
export type Pose = { x: number; y: number; rot: number; opacity: number; flash: number };

const clashKeys = (side: 1 | -1): Key[] => [
  [6.0, 500], [6.35, 215], [6.55, 290], [6.9, 205], [7.1, 300], [7.45, 215],
  [7.65, 320], [8.0, 220], [8.25, 340], [8.9, 500],
].map(([s, x]) => [s, x * side] as Key);

export const CLASH_TIMES = [6.35, 6.9, 7.45, 8.0];

export const itachiPose = (t: number): Pose => {
  let x = kf(t, [
    [0, -1500], [1.0, -500], ...clashKeys(-1),
    [11.8, -500], [12.0, -540], [12.6, -500],
    [20.0, -500], [20.35, -230], [24.0, -230], [24.4, -560],
  ]);
  let y = kf(t, [[8.25, 0], [8.55, -120], [8.9, 0]]);
  let rot = kf(t, [[6.0, 0], [6.3, 10], [6.55, -6], [6.85, 10], [7.1, -6], [7.4, 10], [7.65, -6], [7.95, 10], [8.3, 0]]);
  const c = combo(t);
  if (c) {
    x += c.itachiAttacks ? 80 * c.bump : -45 * c.bump;
    y += c.itachiAttacks ? -40 * c.bump : 0;
    rot += c.itachiAttacks ? 10 * c.bump : -6 * c.bump;
  }
  // Tan thành bầy quạ khi trúng Chidori rồi hiện lại.
  const opacity = t < 16.85 ? 1 : interpolate(t, [16.85, 16.9, 19.2, 19.6], [1, 0, 0, 1], { extrapolateRight: 'clamp' });
  return { x, y, rot, opacity, flash: hitFlash(t, 'itachi') };
};

export const sasukePose = (t: number): Pose => {
  let x = kf(t, [
    [0, 1500], [1.0, 500], ...clashKeys(1),
    [16.5, 500], [16.85, -380], [17.2, -450], [17.7, -450], [18.5, 500],
    [20.0, 500], [20.35, 230], [24.0, 230], [24.4, 560],
  ]);
  let y = kf(t, [[8.25, 0], [8.55, -120], [8.9, 0], [12.45, 0], [12.95, -360], [13.15, -360], [13.7, 0], [17.7, 0], [18.1, -200], [18.5, 0]]);
  let rot = kf(t, [[6.0, 0], [6.3, -10], [6.55, 6], [6.85, -10], [7.1, 6], [7.4, -10], [7.65, 6], [7.95, -10], [8.3, 0], [12.5, 0], [12.9, 15], [13.3, -10], [13.7, 0], [16.5, 0], [16.6, -14], [16.85, -14], [17.3, 0]]);
  const c = combo(t);
  if (c) {
    x += !c.itachiAttacks ? -80 * c.bump : 45 * c.bump;
    y += !c.itachiAttacks ? -40 * c.bump : 0;
    rot += !c.itachiAttacks ? -10 * c.bump : 6 * c.bump;
  }
  return { x, y, rot, opacity: 1, flash: hitFlash(t, 'sasuke') };
};

// Nháy trắng khi bị trúng đòn.
const hitFlash = (t: number, who: 'itachi' | 'sasuke') => {
  const hits = [
    ...CLASH_TIMES,
    ...comboHitTimes.filter((_, k) => (who === 'itachi' ? k % 2 === 1 : k % 2 === 0)),
  ];
  return Math.max(0, ...hits.map((h) => (t >= h ? Math.max(0, 1 - (t - h) / 0.12) : 0)));
};

// Toạ độ trên màn hình của chân (giữa đáy ảnh) và bàn tay nhân vật.
export const feet = (p: Pose) => ({ cx: WIDTH / 2 + p.x, bottom: GROUND_Y + p.y });
export const handOf = (who: typeof ITACHI | typeof SASUKE, p: Pose) => {
  const w = (who.w / who.h) * who.height;
  const { cx, bottom } = feet(p);
  return { x: cx - w / 2 + who.hand[0] * w, y: bottom - who.height + who.hand[1] * who.height };
};

// --- Va chạm: dùng cho tia lửa, sóng xung kích và rung camera.
export type Impact = { t: number; x: number; y: number; color: string; size: number };

export const IMPACTS: Impact[] = [
  ...CLASH_TIMES.map((t) => ({ t, x: WIDTH / 2, y: 690, color: '#ffffff', size: 1 })),
  { t: 13.35, x: WIDTH - 60, y: 690, color: '#ff8a1f', size: 2.2 },
  { t: 16.85, x: 470, y: 700, color: '#7fe3ff', size: 1.8 },
  ...comboHitTimes.map((t, k) => ({
    t,
    x: WIDTH / 2 + (k % 2 === 0 ? 150 : -150) + (random(`cx${k}`) - 0.5) * 80,
    y: 600 + random(`cy${k}`) * 180,
    color: k % 2 === 0 ? '#ff5a3c' : '#7fe3ff',
    size: 0.8,
  })),
  { t: 28.5, x: WIDTH / 2, y: 690, color: '#ffffff', size: 3 },
];

export const shake = (t: number) => {
  let amp = 0;
  for (const i of IMPACTS) {
    if (t >= i.t) amp += 22 * i.size * Math.exp(-(t - i.t) * 9);
  }
  // Rung liên tục khi hai chiêu cuối đẩy nhau.
  if (between(t, 26.0, 28.5)) amp += 7;
  const f = Math.floor(t * 60);
  return { x: (random(`sx${f}`) - 0.5) * 2 * amp, y: (random(`sy${f}`) - 0.5) * 2 * amp };
};

export const cameraZoom = (t: number) =>
  kf(t, [
    [0, 1], [3.0, 1], [5.9, 1.14], [6.2, 1.04], [9.0, 1],
    [14.5, 1], [16.4, 1.1], [16.9, 1], [20.3, 1], [20.5, 1.18], [24.0, 1.18], [24.5, 1],
    [26.0, 1], [28.4, 1.12], [28.6, 1],
  ]);

// Điểm hai chiêu cuối gặp nhau.
export const beamPoint = (t: number) => {
  const meet = kf(t, [[26.0, 0], [26.4, 1]]);
  const struggle = 110 * Math.sin((t - 26.4) * 2.3) + 35 * Math.sin((t - 26.4) * 7.1);
  return WIDTH / 2 + (t > 26.4 ? struggle : 0) * meet;
};
