import { Composition, staticFile } from 'remotion';
import { EditVideo, editVideoSchema } from './EditVideo';

// Video đầu vào đặt trong thư mục public/ (ví dụ public/input.mp4).
export const Root = () => (
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
);
