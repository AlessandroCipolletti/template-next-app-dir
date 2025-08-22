import { FC } from 'react';
import {
  OffthreadVideo,
  RemotionOffthreadVideoProps,
  RemotionMainVideoProps,
  Video,
  getRemotionEnvironment,
} from 'remotion';

export const SafeVideo: FC<{ src: string }> = ({ src }) => {
  const isRendering = getRemotionEnvironment().isRendering;

  const Tag: FC<RemotionOffthreadVideoProps> | FC<RemotionMainVideoProps> =
    isRendering ? OffthreadVideo : Video;

  return <Tag src={src} />;
};
