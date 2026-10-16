import type React from 'react';
import { AbsoluteFill, interpolate, random } from 'remotion';
import { HEIGHT, IMPACTS, WIDTH, between, progress } from './timeline';

const full: React.CSSProperties = { position: 'absolute', inset: 0, width: WIDTH, height: HEIGHT };

// Bầu trời đêm, trăng đỏ và mái nhà làng Lá.
export const Background = ({ t }: { t: number }) => {
  const roofs =
    'M0 820 L0 700 L90 700 L140 650 L190 700 L260 700 L260 640 L330 590 L400 640 L400 720 L520 720 L580 670 L640 720 L760 720 L760 660 L840 610 L920 660 L920 730 L1080 730 L1140 680 L1200 730 L1320 730 L1320 650 L1400 600 L1480 650 L1480 710 L1600 710 L1660 660 L1720 710 L1820 710 L1870 670 L1920 700 L1920 820 Z';
  return (
    <AbsoluteFill>
      <div style={{ ...full, background: 'radial-gradient(ellipse at 50% 30%, #4a0d14 0%, #1a0509 55%, #07020a 100%)' }} />
      <div
        style={{
          position: 'absolute',
          left: WIDTH / 2 - 210,
          top: 90 + t * 2,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 38%, #ff6b5a 0%, #c81e1e 55%, #6d0a12 100%)',
          boxShadow: '0 0 120px 40px rgba(220, 30, 30, 0.45)',
          opacity: 0.9,
        }}
      />
      <svg style={full} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <path d={roofs} fill="#0b0408" />
        <rect x={0} y={820} width={WIDTH} height={HEIGHT - 820} fill="#120609" />
        <rect x={0} y={928} width={WIDTH} height={4} fill="#3a1218" />
      </svg>
      <Embers t={t} />
    </AbsoluteFill>
  );
};

// Tàn lửa bay lên liên tục.
const Embers = ({ t }: { t: number }) => (
  <svg style={full} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
    {Array.from({ length: 45 }, (_, i) => {
      const speed = 40 + random(`es${i}`) * 90;
      const y = HEIGHT - ((random(`ey${i}`) * HEIGHT + t * speed) % (HEIGHT + 40));
      const x = random(`ex${i}`) * WIDTH + Math.sin(t * 1.3 + i) * 30;
      return <circle key={i} cx={x} cy={y} r={1.5 + random(`er${i}`) * 3} fill="#ff7a3a" opacity={0.25 + random(`eo${i}`) * 0.5} />;
    })}
  </svg>
);

// Tia lửa, sóng xung kích và chớp sáng tại mỗi va chạm.
export const Impacts = ({ t }: { t: number }) => (
  <svg style={full} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
    {IMPACTS.filter((i) => between(t, i.t, i.t + 0.5)).map((i, n) => {
      const p = progress(t, i.t, i.t + 0.45);
      const fade = 1 - p;
      return (
        <g key={n}>
          <circle cx={i.x} cy={i.y} r={40 + p * 260 * i.size} fill="none" stroke={i.color} strokeWidth={14 * fade} opacity={fade} />
          <circle cx={i.x} cy={i.y} r={70 * i.size * Math.max(0, 1 - p * 3)} fill="#fff" opacity={0.9} />
          {Array.from({ length: 16 }, (_, k) => {
            const a = random(`sa${i.t}${k}`) * Math.PI * 2;
            const r0 = 30 + p * 200 * i.size * (0.6 + random(`sr${i.t}${k}`));
            const len = 60 * i.size * fade;
            return (
              <line
                key={k}
                x1={i.x + Math.cos(a) * r0}
                y1={i.y + Math.sin(a) * r0}
                x2={i.x + Math.cos(a) * (r0 + len)}
                y2={i.y + Math.sin(a) * (r0 + len)}
                stroke={k % 3 === 0 ? '#fff' : i.color}
                strokeWidth={5 * fade + 1}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      );
    })}
  </svg>
);

// Chớp trắng toàn màn hình.
export const ScreenFlash = ({ t }: { t: number }) => {
  const small = Math.max(0, ...IMPACTS.map((i) => (t >= i.t ? Math.max(0, 0.5 * i.size - (t - i.t) * 6) : 0)));
  const finale = interpolate(t, [28.45, 28.6, 29.0, 29.4], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ ...full, background: '#fff', opacity: Math.min(1, Math.max(small * 0.6, finale)) }} />;
};

// Vệt tốc độ khi nhân vật lao tới.
export const SpeedLines = ({ t, speed, color }: { t: number; speed: number; color: string }) => {
  const o = Math.min(1, Math.max(0, (speed - 12) / 30));
  if (o <= 0) return null;
  const f = Math.floor(t * 30);
  return (
    <svg style={{ ...full, opacity: o }} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {Array.from({ length: 26 }, (_, i) => {
        const y = random(`ly${i}${f}`) * HEIGHT;
        const x = random(`lx${i}${f}`) * WIDTH;
        return <rect key={i} x={x} y={y} width={200 + random(`lw${i}`) * 500} height={2 + random(`lh${i}`) * 4} fill={color} opacity={0.5} />;
      })}
    </svg>
  );
};

// Tia sét gấp khúc, đổi hình mỗi frame.
export const Lightning = ({ x1, y1, x2, y2, seed, width = 4, color = '#9eeaff', jitter = 40 }: {
  x1: number; y1: number; x2: number; y2: number; seed: string; width?: number; color?: string; jitter?: number;
}) => {
  const n = 12;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n;
    const off = i === 0 || i === n ? 0 : (random(`${seed}-${i}`) - 0.5) * 2 * jitter;
    const nx = -(y2 - y1);
    const ny = x2 - x1;
    const len = Math.hypot(nx, ny) || 1;
    return `${x1 + (x2 - x1) * f + (nx / len) * off},${y1 + (y2 - y1) * f + (ny / len) * off}`;
  }).join(' ');
  return (
    <>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={width * 3} opacity={0.35} strokeLinejoin="round" />
      <polyline points={pts} fill="none" stroke="#ffffff" strokeWidth={width} strokeLinejoin="round" />
    </>
  );
};

// Chidori: chùm sét quanh bàn tay.
export const ChidoriBall = ({ x, y, t, scale = 1 }: { x: number; y: number; t: number; scale?: number }) => {
  const f = Math.floor(t * 30);
  return (
    <svg style={{ ...full, filter: 'drop-shadow(0 0 18px #3cc8ff)' }} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <circle cx={x} cy={y} r={60 * scale} fill="url(#chidoriGlow)" />
      <defs>
        <radialGradient id="chidoriGlow">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#7fe3ff" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#1a8cff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({ length: 9 }, (_, i) => {
        const a = random(`ca${i}${f}`) * Math.PI * 2;
        const r = (80 + random(`cr${i}${f}`) * 120) * scale;
        return <Lightning key={i} x1={x} y1={y} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} seed={`c${i}${f}`} width={2.5} jitter={18} />;
      })}
    </svg>
  );
};

// Hào quang toả quanh nhân vật khi gồng chiêu.
export const Aura = ({ cx, bottom, color, strength, t }: { cx: number; bottom: number; color: string; strength: number; t: number }) => {
  if (strength <= 0) return null;
  const pulse = 1 + 0.08 * Math.sin(t * 20);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - 330,
        top: bottom - 620,
        width: 660,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(ellipse at 50% 55%, ${color} 0%, transparent 65%)`,
        opacity: strength * 0.85,
        scale: `${pulse}`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

// Hoả độn: quả cầu lửa với các đốm lửa bám đuôi.
export const Fireball = ({ x, y, r, t }: { x: number; y: number; r: number; t: number }) => {
  if (r <= 1) return null;
  const f = Math.floor(t * 30);
  return (
    <svg style={{ ...full, mixBlendMode: 'screen' }} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <defs>
        <radialGradient id="fire">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="30%" stopColor="#ffd34d" />
          <stop offset="65%" stopColor="#ff6a1a" />
          <stop offset="100%" stopColor="#b3120a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({ length: 30 }, (_, i) => {
        const back = random(`fb${i}`) * r * 2.2;
        const pr = r * (0.25 + random(`fr${i}${f % 6}`) * 0.4) * (1 - back / (r * 2.6));
        return (
          <circle
            key={i}
            cx={x - back + (random(`fx${i}${f}`) - 0.5) * 20}
            cy={y + (random(`fy${i}`) - 0.5) * r * 1.2 + (random(`fj${i}${f}`) - 0.5) * 16}
            r={Math.max(0, pr)}
            fill="url(#fire)"
            opacity={0.8}
          />
        );
      })}
      <circle cx={x} cy={y} r={r * (1 + 0.04 * Math.sin(t * 40))} fill="url(#fire)" />
    </svg>
  );
};

// Dải lửa và chùm sét đẩy nhau ở cảnh cuối.
export const BeamClash = ({ t, fromX, fromY, toX, toY, point }: {
  t: number; fromX: number; fromY: number; toX: number; toY: number; point: number;
}) => {
  const f = Math.floor(t * 30);
  const midY = (fromY + toY) / 2;
  const thick = 70 + 10 * Math.sin(t * 30);
  const edge = (side: 1 | -1) =>
    Array.from({ length: 25 }, (_, i) => {
      const x = fromX + ((point - fromX) * i) / 24;
      const w = thick * (0.35 + (0.65 * i) / 24);
      return `${x},${fromY + (midY - fromY) * (i / 24) + side * (w + (random(`be${side}${i}${f}`) - 0.5) * 22)}`;
    });
  const top = edge(-1);
  const bottom = edge(1).reverse();
  return (
    <svg style={full} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <defs>
        <linearGradient id="fireBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff3d0a" />
          <stop offset="50%" stopColor="#ffe9a0" />
          <stop offset="100%" stopColor="#ff3d0a" />
        </linearGradient>
        <radialGradient id="core">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fff1c9" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon points={[...top, ...bottom].join(' ')} fill="url(#fireBeam)" style={{ filter: 'drop-shadow(0 0 30px #ff5a1a)' }} />
      <g style={{ filter: 'drop-shadow(0 0 16px #3cc8ff)' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Lightning key={i} x1={toX} y1={toY + (i - 2.5) * 6} x2={point} y2={midY + (random(`bl${i}${f}`) - 0.5) * 90} seed={`b${i}${f}`} width={4} jitter={45} />
        ))}
      </g>
      <circle cx={point} cy={midY} r={150 + 25 * Math.sin(t * 25)} fill="url(#core)" />
      {Array.from({ length: 14 }, (_, k) => {
        const a = random(`bs${k}${f}`) * Math.PI * 2;
        const r = 120 + random(`bd${k}${f}`) * 200;
        return (
          <line key={k} x1={point} y1={midY} x2={point + Math.cos(a) * r} y2={midY + Math.sin(a) * r}
            stroke={k % 2 ? '#ffd34d' : '#9eeaff'} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
        );
      })}
    </svg>
  );
};

// Bầy quạ: tung ra từ một điểm rồi tụ lại.
export const Crows = ({ t, x, y }: { t: number; x: number; y: number }) => {
  if (!between(t, 16.85, 19.7)) return null;
  const out = progress(t, 16.85, 17.9, (n) => 1 - Math.pow(1 - n, 3));
  const back = progress(t, 18.4, 19.4, (n) => n * n);
  const spread = out * (1 - back);
  const bird = 'M0 0 C -20 -18 -42 -14 -60 -4 C -40 -6 -24 0 -10 8 L 0 4 L 10 8 C 24 0 40 -6 60 -4 C 42 -14 20 -18 0 0 Z';
  return (
    <svg style={{ ...full, filter: 'drop-shadow(0 0 8px rgba(255, 40, 40, 0.6))' }} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {Array.from({ length: 28 }, (_, i) => {
        const a = random(`ka${i}`) * Math.PI * 2;
        const d = 120 + random(`kd${i}`) * 520;
        const bx = x + Math.cos(a) * d * spread + Math.sin(t * 3 + i) * 30 * spread;
        const by = y + Math.sin(a) * d * spread * 0.7 + Math.cos(t * 4 + i) * 20 * spread;
        const flap = 0.4 + 0.6 * Math.abs(Math.sin(t * 14 + i));
        const s = 1.4 + random(`ks${i}`) * 1.2;
        return (
          <g key={i} transform={`translate(${bx} ${by}) scale(${s} ${s * flap}) rotate(${Math.cos(a) * 15})`}>
            <path d={bird} fill="#050205" stroke="#c0303c" strokeWidth={2} />
            <circle cx={4} cy={-2} r={2.2} fill="#ff2a2a" />
          </g>
        );
      })}
    </svg>
  );
};

// Ánh mắt Sharingan loé lên.
export const EyeGlint = ({ x, y, strength }: { x: number; y: number; strength: number }) => {
  if (strength <= 0) return null;
  const s = 30 + 50 * strength;
  return (
    <svg style={{ ...full, mixBlendMode: 'screen' }} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <circle cx={x} cy={y} r={s * 0.18} fill="#ff4040" opacity={0.8 * strength} />
      <path d={`M${x - s * 1.6} ${y} L${x} ${y - 4} L${x + s * 1.6} ${y} L${x} ${y + 4} Z`} fill="#ffd0d0" opacity={strength} />
      <path d={`M${x} ${y - s * 0.6} L${x + 3} ${y} L${x} ${y + s * 0.6} L${x - 3} ${y} Z`} fill="#ffd0d0" opacity={strength} />
    </svg>
  );
};
