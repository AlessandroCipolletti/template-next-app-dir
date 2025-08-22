import { Composition } from 'remotion';
import { SubtitledVideo } from '../components/SubtitledVideo';
import { COMP_NAME, defaultMyCompProps } from './constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={SubtitledVideo}
        durationInFrames={defaultMyCompProps.durationInFrames}
        fps={defaultMyCompProps.fps}
        width={defaultMyCompProps.width}
        height={defaultMyCompProps.height}
        defaultProps={defaultMyCompProps}
      />
    </>
  );
};
