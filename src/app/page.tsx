'use client';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Player, PlayerRef } from '@remotion/player';
import text_subtitles from './text_subtitles.json';
import { SubtitledVideo } from '../videoRenderingEngine/components/SubtitledVideo';
import { COMP_NAME, Subtitle } from '../videoRenderingEngine/constants';

const VIDEO_URL =
  'https://argoseyes.s3.eu-west-3.amazonaws.com/development/test-subtitles.mp4?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEL7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMyJHMEUCICbNhG%2BFa8h6BzSXk8FmhCGEKgK%2BtB%2FHEy2I%2F2l2wHJ9AiEAmwIs723roK9uaYqeLUO%2FTOxWMXuCOLC4jqiONGmyfncqzAMIFhABGgwyMDE0NTQ4NTIxNTIiDLBqBzhT3bPkVIMCyyqpA6UhZ8m3Wr6OBlP%2FgB%2FzC4PtI3cWEzfucdG%2BfCZDAgVVlZb97BH9bCMMBc5%2FtfYZVw6%2BEmsoUT0JLS6KwXJ0u81TlP3DtO7ZRb95p5uf0qRHttfjqfaf5g6hzxPXriNmGZcENi658UnKjQp6Z8%2FxqCg4vE0rkP7HZ2kV1BF7oiHhSNi1qQ1ZVQ6ORUjDKN2FAGQAOH%2F2%2FZRqsAuQXqpSsCJN0Lu45bEdaPv0FB674UI%2FQCGNqFKEsz8vErwBMJ8vsX9L9Au2RXkG88xg%2BVqZ%2FCaU6ncr4SDd%2F3dkw4YKpwj2OqKLJYN7ny%2BAg3F11e3F%2FBzddDb%2BhdX9ZC6zuHxsdcE8WEtJklUO5q4d3Ax4ptrnlWK2qTYzk1fM5ftXrOHQ0%2FqSnAsh0r2btrXAGZsbNHyesAnQkwa%2Bw42DpFWi1KgdRLMumoyPYceDZaSHmSC3jtwSOiKbWp8ueQwAWse32iT%2FyBCpKPB5G5XrFQPJSUVgwf4F4X%2Bb6xqZSWtNc9aE84wx%2BDVnlMQaZEJtPPvw5XuJ5kIoT9b70Ly9jkbZ9Wt2ZHf78v2pi%2FqyMIPcocUGOt4CZakMGMMMlKHXGX4A%2BMUME8qJenbv4dm3VLdCeV5i%2Fj0U3aceWI8INMWztPeMpdPb10FoDlP25jmH%2F%2BSKh6WjGJcQlVR2cI2JcXK1gK%2Bn06LaOj28daESo6l9NRBG9ifRdETtjjq2060x92V3E3o90WKEDvZbBkwrDnz2AQ3kqlVueIRxoOzOkoydDoYDiiAcX3Epb9q3SgrNyeuBi5wjM3MoqavKyDJGcMkze50%2BhuFHyLMP9TKZD08hwx8P4vv44ugwBjhARUpgoHSacA6yk%2FgjwXN0eD%2BQ9%2FBmLnXpBgogu2COVeVuUq8qYuF4R%2F1df2F1xGdxjmmP1vyNacS03vdu2qafPabqBVAHLwb9uxFiViPTW4EbzaLwki%2F%2B04KEPBTo608REK2B1JMe%2BsZwaLIyxu8toHs8V901cfYNuVpqUjCoXtnP28oRF4FghcnByvPITAvcgDwnFcD3rYA%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAS5Z5FDA4GM7LESFH%2F20250822%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20250822T131829Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=1c007a4ec5c8e76b0ce6a5268c31e0cb0205ee3d84cbda83cff946f6133c984d';

const subtitles: Subtitle[] = text_subtitles.words.filter(
  (w) => w.text.trim() !== '',
);

const fps = 30;

const Page: FC = () => {
  const player = useRef<PlayerRef>(null);
  const [meta, setMeta] = useState<{
    duration: number;
    width: number;
    height: number;
  } | null>(null);
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRenderingLocal, setIsRenderingLocal] = useState(false);
  const [isRenderingLambda, setIsRenderingLambda] = useState(false);
  const [bucketName, setBucketName] = useState<string | null>(null);
  const [renderId, setRenderId] = useState<string | null>(null);

  const durationInFrames = meta ? Math.ceil(meta.duration * fps) : 0;

  const handleLocalRender = async () => {
    setIsRenderingLocal(true);
    try {
      const requestId = `${Date.now()}`;
      let timeoutId: NodeJS.Timeout | null = null;

      // Get video metadata for dynamic parameters
      const videoMetadata = meta
        ? {
            width: meta.width,
            height: meta.height,
            durationInFrames: Math.ceil(meta.duration * fps),
            fps: fps,
          }
        : {
            width: 1080,
            height: 1920,
            durationInFrames: 120 * 30,
            fps: 30,
          };

      // Prepare the request data with dynamic parameters
      const requestData = {
        subtitles,
        videoSrc: VIDEO_URL,
        requestId,
        ...videoMetadata,
      };

      console.time('render');
      // Start the render process
      const promise = fetch('/api/render/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      // Poll for progress while rendering
      const pollProgress = async () => {
        try {
          const progressResponse = await fetch(
            `/api/render/local/progress?requestId=${requestId}`,
          );
          if (progressResponse.ok) {
            const progress = await progressResponse.json();
            console.info(`Rendering progress: ${progress.percentage}%`);

            // Continue polling if not complete
            if (progress.progress < 1) {
              timeoutId = setTimeout(pollProgress, 5_000);
            }
          }
        } catch (error) {
          console.error('Progress polling error:', error);
        }
      };

      // Start polling for progress
      pollProgress();

      const response = await promise;

      console.timeEnd('render');

      if (timeoutId) clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the video blob
      const videoBlob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video.mp4';
      document.body.appendChild(a);
      a.click();
      console.info(url);
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (error) {
      console.error('Local rendering failed:', error);
      alert('Failed to render video locally. Check console for details.');
    } finally {
      setIsRenderingLocal(false);
    }
  };

  const handleLambdaRender = async () => {
    setIsRenderingLambda(true);
    try {
      const videoMetadata = meta
        ? {
            width: meta.width,
            height: meta.height,
            durationInFrames: Math.ceil(meta.duration * fps),
            fps: fps,
          }
        : {
            width: 1080,
            height: 1920,
            durationInFrames: 120 * 30,
            fps: 30,
          };

      // Prepare the request data with dynamic parameters
      const inputProps = {
        subtitles,
        videoSrc: VIDEO_URL,
        ...videoMetadata,
      };

      const result = await fetch('/api/lambda/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: COMP_NAME,
          inputProps,
        }),
      });
      console.time('render');
      const resultJson = await result.json();
      console.log(resultJson);

      setBucketName(resultJson.data.bucketName);
      setRenderId(resultJson.data.renderId);
    } catch (error) {
      console.error('Lambda rendering failed:', error);
      alert('Failed to render video lambda. Check console for details.');
    } finally {
      setIsRenderingLambda(false);
    }
  };

  const handleCheckLambdaProgress = useCallback(async () => {
    if (!renderId || !bucketName) return;

    const result = await fetch('/api/lambda/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: renderId,
        bucketName: bucketName,
      }),
    });
    const resultJson = await result.json();

    if (resultJson.data.type === 'done') {
      console.timeEnd('render');
      console.log('done: ', resultJson.data.url);
    } else {
      console.log('progress:', resultJson.data.progress);
    }
  }, [renderId, bucketName]);

  useEffect(() => {
    handleCheckLambdaProgress();
    const intervalId = setInterval(handleCheckLambdaProgress, 5_000);
    return () => clearInterval(intervalId);
  }, [handleCheckLambdaProgress]);

  useEffect(() => {
    const vid = document.createElement('video');

    vid.preload = 'metadata';
    vid.src = VIDEO_URL;
    vid.onloadedmetadata = () => {
      setMeta({
        duration: vid.duration,
        width: vid.videoWidth,
        height: vid.videoHeight,
      });
      setFrame(0);
    };
  }, []);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Number(e.target.value);
    setFrame(f);
    player.current?.seekTo(f);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      player.current?.pause();
      setIsPlaying(false);
    } else {
      player.current?.play();
      setIsPlaying(true);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      {meta && (
        <>
          <div style={{ maxWidth: '300px' }}>
            <Player
              ref={player}
              component={SubtitledVideo}
              durationInFrames={durationInFrames}
              fps={fps}
              compositionWidth={meta.width}
              compositionHeight={meta.height}
              inputProps={{ subtitles, videoSrc: VIDEO_URL }}
              // controls
              style={{ width: '100%' }}
            />
          </div>

          <button
            onClick={togglePlayPause}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginRight: 8,
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button onClick={handleLocalRender} disabled={isRenderingLocal}>
            {isRenderingLocal ? 'Rendering locally...' : 'Render locally'}
          </button>

          <button onClick={handleLambdaRender} disabled={isRenderingLambda}>
            {isRenderingLambda ? 'Rendering lambda...' : 'Render lambda'}
          </button>

          <input
            type="range"
            min={0}
            max={durationInFrames - 1}
            value={frame}
            onChange={handleSlider}
            style={{ width: '100%', marginTop: 16 }}
          />
        </>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
