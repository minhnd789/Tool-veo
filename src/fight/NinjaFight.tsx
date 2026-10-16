import type React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Aura, Background, BeamClash, ChidoriBall, Crows, EyeGlint, Fireball, Impacts, ScreenFlash, SpeedLines,
} from './Effects';
import {
  COMBO_END, COMBO_START, HEIGHT, ITACHI, SASUKE, WIDTH, beamPoint, between, cameraZoom, comboHitTimes,
  feet, handOf, itachiPose, kf, progress, sasukePose, shake, type Pose,
} from './timeline';

const FONT = '"Inter Display", "Inter", "IPAGothic", sans-serif';

type Char = typeof ITACHI | typeof SASUKE;

const Fighter = ({ who, pose, ghost = 1 }: { who: Char; pose: Pose; ghost?: number }) => {
  const w = (who.w / who.h) * who.height;
  const { cx, bottom } = feet(pose);
  return (
    <Img
      src={staticFile(who.src)}
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: bottom - who.height,
        width: w,
        height: who.height,
        transformOrigin: '50% 100%',
        rotate: `${pose.rot}deg`,
        opacity: pose.opacity * ghost,
        filter: `brightness(${1 + pose.flash * 2.5}) drop-shadow(0 12px 18px rgba(0,0,0,0.6))`,
      }}
    />
  );
};

// Bóng mờ đuổi theo khi di chuyển nhanh.
const Afterimages = ({ who, poseAt, t, speed }: { who: Char; poseAt: (t: number) => Pose; t: number; speed: number }) => {
  if (speed < 10) return null;
  return (
    <>
      {[0.1, 0.066, 0.033].map((dt, i) => (
        <Fighter key={i} who={who} pose={{ ...poseAt(t - dt), flash: 0.6 }} ghost={0.12 + i * 0.08} />
      ))}
    </>
  );
};

const Shadow = ({ pose }: { pose: Pose }) => {
  const { cx } = feet(pose);
  const lift = Math.min(1, -pose.y / 400);
  return (
    <div style={{
      position: 'absolute', left: cx - 170, top: 905, width: 340, height: 50, borderRadius: '50%',
      background: 'rgba(0,0,0,0.55)', scale: `${1 - lift * 0.5}`, opacity: pose.opacity * (1 - lift * 0.6),
    }} />
  );
};

// Chữ hét tên chiêu: đập vào rồi rung nhẹ.
const Callout = ({ t, start, end, jp, text, color, x }: {
  t: number; start: number; end: number; jp: string; text: string; color: string; x: number;
}) => {
  if (!between(t, start, end)) return null;
  const inP = progress(t, start, start + 0.25, Easing.out(Easing.back(2)));
  const outO = interpolate(t, [end - 0.3, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', left: x - 500, top: 150, width: 1000, textAlign: 'center',
      scale: `${interpolate(inP, [0, 1], [2.4, 1])}`, opacity: Math.min(inP * 2, 1) * outO,
      rotate: `${-4 + Math.sin(t * 40) * 0.6}deg`, fontFamily: FONT,
    }}>
      <div style={{ fontSize: 120, fontWeight: 900, color: '#fff', WebkitTextStroke: `10px ${color}`, paintOrder: 'stroke fill', textShadow: `0 0 40px ${color}` }}>{jp}</div>
      <div style={{ fontSize: 46, fontWeight: 900, color: '#fff', letterSpacing: 6, WebkitTextStroke: '8px #120206', paintOrder: 'stroke fill' }}>{text}</div>
    </div>
  );
};

const Intro = ({ t }: { t: number }) => {
  if (t > 3.4) return null;
  const o = interpolate(t, [2.8, 3.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const vs = progress(t, 1.2, 1.45, Easing.out(Easing.back(3)));
  const plate = (name: string, side: -1 | 1, color: string) => {
    const p = progress(t, 0.5, 1.1, Easing.out(Easing.cubic));
    return (
      <div style={{
        position: 'absolute', top: 120, [side < 0 ? 'left' : 'right']: 120,
        translate: `${side * (1 - p) * 700}px 0`, fontFamily: FONT, textAlign: side < 0 ? 'left' : 'right',
      }}>
        <div style={{ fontSize: 96, fontWeight: 900, color: '#fff', letterSpacing: 4, WebkitTextStroke: '3px #120206', textShadow: `0 0 24px ${color}` }}>{name}</div>
        <div style={{ height: 10, width: 360, marginTop: 8, marginLeft: side > 0 ? 'auto' : 0, background: color, boxShadow: `0 0 20px ${color}` }} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {plate('ITACHI', -1, '#ff3b3b')}
      {plate('SASUKE', 1, '#4cc9ff')}
      <div style={{
        position: 'absolute', left: WIDTH / 2 - 300, top: 330, width: 600, textAlign: 'center', fontFamily: FONT,
        fontSize: 260, fontWeight: 900, fontStyle: 'italic', color: '#ffcf3a', WebkitTextStroke: '6px #120206',
        textShadow: '0 0 50px #ff7a1a', scale: `${interpolate(vs, [0, 1], [4, 1])}`, opacity: Math.min(1, vs * 2),
      }}>VS</div>
    </AbsoluteFill>
  );
};

const ComboCounter = ({ t }: { t: number }) => {
  if (!between(t, COMBO_START, COMBO_END + 0.8)) return null;
  const hits = comboHitTimes.filter((h) => t >= h).length;
  if (hits === 0) return null;
  const last = comboHitTimes[hits - 1];
  const pop = interpolate(t - last, [0, 0.12], [1.5, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', right: 110, top: 420, fontFamily: FONT, textAlign: 'right',
      opacity: interpolate(t, [COMBO_END + 0.4, COMBO_END + 0.8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    }}>
      <div style={{ fontSize: 150, fontWeight: 900, fontStyle: 'italic', color: '#ffcf3a', WebkitTextStroke: '5px #120206', scale: `${pop}`, transformOrigin: '100% 50%' }}>{hits}</div>
      <div style={{ fontSize: 50, fontWeight: 900, color: '#fff', letterSpacing: 8, WebkitTextStroke: '2px #120206' }}>HITS!</div>
    </div>
  );
};

const EndCard = ({ t }: { t: number }) => {
  if (t < 29.0) return null;
  const o = progress(t, 29.1, 29.6);
  return (
    <AbsoluteFill style={{ background: '#07020a', opacity: progress(t, 29.0, 29.3), justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        fontFamily: FONT, fontSize: 110, fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: 6,
        opacity: o, translate: `${(1 - o) * 120}px 0`, textShadow: '0 0 40px #ff3b3b',
      }}>TO BE CONTINUED...</div>
    </AbsoluteFill>
  );
};

const speedOf = (poseAt: (t: number) => Pose, t: number, fps: number) => Math.abs(poseAt(t).x - poseAt(t - 1 / fps).x);

export const NinjaFight = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const it = itachiPose(t);
  const sa = sasukePose(t);
  const itSpeed = speedOf(itachiPose, t, fps);
  const saSpeed = speedOf(sasukePose, t, fps);
  const itHand = handOf(ITACHI, it);
  const saHand = handOf(SASUKE, sa);

  // Hoả độn: gồng 10–11.8s, quả cầu lửa bay 12.2–13.4s.
  const fireR = kf(t, [[11.8, 0], [12.2, 190], [13.4, 230]], Easing.out(Easing.cubic)) * (t < 13.45 ? 1 : 0);
  const fireX = kf(t, [[12.2, itHand.x + 60], [13.4, WIDTH + 260]], Easing.in(Easing.quad));

  const camShake = shake(t);
  const zoom = cameraZoom(t);
  const fireAura = Math.max(kf(t, [[9.8, 0], [10.4, 1], [12.2, 1], [12.6, 0]]), kf(t, [[24.8, 0], [25.4, 1], [28.5, 1], [28.6, 0]]));
  const blueAura = Math.max(kf(t, [[14.3, 0], [14.8, 1], [16.9, 1], [17.3, 0]]), kf(t, [[24.8, 0], [25.4, 1], [28.5, 1], [28.6, 0]]));
  const eyes = (who: Char, pose: Pose, s: number) => {
    const w = (who.w / who.h) * who.height;
    const { cx, bottom } = feet(pose);
    return who.eyes.map(([ex, ey], i) => (
      <EyeGlint key={i} x={cx - w / 2 + ex * w} y={bottom - who.height + ey * who.height} strength={s} />
    ));
  };
  const glintAt = (a: number) => interpolate(t, [a, a + 0.12, a + 0.6], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#07020a', overflow: 'hidden' }}>
      <AbsoluteFill style={{ scale: `${zoom}`, translate: `${camShake.x}px ${camShake.y}px`, transformOrigin: '50% 62%' }}>
        <Background t={t} />
        <SpeedLines t={t} speed={Math.max(itSpeed, saSpeed)} color="#ffffff" />
        <Shadow pose={it} />
        <Shadow pose={sa} />
        <Aura cx={feet(it).cx} bottom={feet(it).bottom} color="#ff5a1a" strength={fireAura} t={t} />
        <Aura cx={feet(sa).cx} bottom={feet(sa).bottom} color="#2fb6ff" strength={blueAura} t={t} />
        <Afterimages who={ITACHI} poseAt={itachiPose} t={t} speed={itSpeed} />
        <Afterimages who={SASUKE} poseAt={sasukePose} t={t} speed={saSpeed} />
        <Fighter who={ITACHI} pose={it} />
        <Fighter who={SASUKE} pose={sa} />
        {eyes(ITACHI, it, Math.max(glintAt(3.6), glintAt(9.9), glintAt(24.9)))}
        {eyes(SASUKE, sa, Math.max(glintAt(4.3), glintAt(14.3), glintAt(24.9)))}

        {between(t, 10.0, 12.2) && <Fireball x={itHand.x + 40} y={itHand.y} r={20 + 25 * progress(t, 10, 11.8) + 6 * Math.sin(t * 30)} t={t} />}
        <Fireball x={fireX} y={itHand.y} r={fireR} t={t} />
        {between(t, 14.5, 17.0) && <ChidoriBall x={saHand.x - 20} y={saHand.y} t={t} scale={0.6 + 0.6 * progress(t, 14.5, 15.5)} />}
        <Crows t={t} x={feet(it).cx} y={650} />
        {between(t, 26.0, 28.5) && (
          <BeamClash t={t} fromX={itHand.x + 30} fromY={itHand.y} toX={saHand.x - 20} toY={saHand.y} point={beamPoint(t)} />
        )}
        {between(t, 25.0, 26.0) && <ChidoriBall x={saHand.x - 20} y={saHand.y} t={t} scale={0.9} />}
        {between(t, 25.0, 26.0) && <Fireball x={itHand.x + 40} y={itHand.y} r={45 + 8 * Math.sin(t * 30)} t={t} />}
        <Impacts t={t} />
      </AbsoluteFill>

      <Intro t={t} />
      <Callout t={t} start={10.2} end={12.4} jp="火遁・豪火球の術" text="KATON: GŌKAKYŪ NO JUTSU!" color="#ff7a1a" x={WIDTH / 2} />
      <Callout t={t} start={14.7} end={16.6} jp="千鳥" text="CHIDORI!" color="#4cc9ff" x={WIDTH / 2} />
      <Callout t={t} start={17.4} end={19.4} jp="幻術" text="GENJUTSU..." color="#ff3b3b" x={WIDTH / 2} />
      <ComboCounter t={t} />
      <ScreenFlash t={t} />
      <EndCard t={t} />

      {/* Viền đen điện ảnh trên/dưới */}
      <div style={bar('top')} />
      <div style={bar('bottom')} />
      <Audio src={staticFile('fight/sfx.wav')} />
    </AbsoluteFill>
  );
};

const bar = (side: 'top' | 'bottom'): React.CSSProperties => ({
  position: 'absolute', left: 0, [side]: 0, width: WIDTH, height: HEIGHT * 0.06, background: '#000',
});
