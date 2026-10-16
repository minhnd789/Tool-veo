import { Composition, staticFile } from 'remotion';
import { EditVideo, editVideoSchema } from './EditVideo';
import { NinjaFight } from './fight/NinjaFight';
import { DURATION_S, HEIGHT, WIDTH } from './fight/timeline';

// Video đầu vào đặt trong thư mục public/ (ví dụ public/input.mp4).
export const Root = () => (
  <>
    <Composition
      id="EditVideo"
      component={EditVideo}
      schema={editVideoSchema}
      durationInFrames={120}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ src: staticFile('input.mp4'), title: 'Tool Edit Video' }}
    />
    {/* Cần public/fight/itachi.png, sasuke.png và sfx.wav (npm run fight:sfx). */}
    <Composition
      id="NinjaFight"
      component={NinjaFight}
      durationInFrames={DURATION_S * 30}
      fps={30}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
