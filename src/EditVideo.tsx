import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Video } from '@remotion/media';
import { z } from 'zod';

export const editVideoSchema = z.object({
  src: z.string(),
  title: z.string(),
});

// Phát video gốc và chèn tiêu đề động lên trên.
export const EditVideo = ({ src, title }: z.infer<typeof editVideoSchema>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Video src={src} />
      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: 60 }}>
        <div
          style={{
            alignSelf: 'flex-start',
            padding: '16px 32px',
            borderRadius: 12,
            background: 'rgba(0, 0, 0, 0.65)',
            color: 'white',
            fontFamily: 'sans-serif',
            fontSize: 56,
            fontWeight: 700,
            opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `translateY(${(1 - enter) * 80}px)`,
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
