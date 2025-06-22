'use client'
import { FC, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Player, PlayerRef } from '@remotion/player'
import text_subtitles from './text_subtitles.json'
import { SubtitledVideo } from '../components/SubtitledVideo'
import { Button } from "../components/Button/Button";
import { Subtitle } from '../types/constants'


const subtitles: Subtitle[] = text_subtitles.words.filter((w) => w.text.trim() !== '')

const fps = 30

const Page: FC = () => {
  const player = useRef<PlayerRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<{
    duration: number
    width: number
    height: number
  } | null>(null)
  const [frame, setFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
console.info(videoFile)

  const durationInFrames = meta ? Math.ceil(meta.duration * fps) : 0

  const [isRendering, setIsRendering] = useState(false);

  const handleLocalRender = async () => {
    setIsRendering(true);
    try {
      const requestId = `${Date.now()}`;
      let timeoutId: NodeJS.Timeout | null = null;
      
      // Start the render process
      const promise = fetch("/api/render/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subtitles,
          videoSrc: 'https://argoseyes.s3-accelerate.amazonaws.com/development/situations/804b04f6-bf3d-4e54-9ee5-84be0caa0e18.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS5Z5FDA4KOFQ5V4V%2F20250622%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20250622T202150Z&X-Amz-Expires=43200&X-Amz-Signature=eda5f3dfdee3e8b0013d1750ea59f048054e938be915548953ded9868d079a8d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject',
          requestId,
        }),
      });

      // Poll for progress while rendering
      const pollProgress = async () => {
        try {
          const progressResponse = await fetch(`/api/render/local/progress?requestId=${requestId}`);
          if (progressResponse.ok) {
            const progress = await progressResponse.json();
            console.log(`Rendering progress: ${progress.percentage}%`);
            
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
      if (timeoutId) clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the video blob
      const videoBlob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Local rendering failed:", error);
      alert("Failed to render video locally. Check console for details.");
    } finally {
      setIsRendering(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setVideoFile(file)
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')

    vid.preload = 'metadata'
    vid.src = url
    vid.onloadedmetadata = () => {
      setMeta({
        duration: vid.duration,
        width: vid.videoWidth,
        height: vid.videoHeight,
      })
      setVideoSrc(url)
      setFrame(0)
    }
  }

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Number(e.target.value)
    setFrame(f)
    player.current?.seekTo(f)
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      player.current?.pause()
      setIsPlaying(false)
    } else {
      player.current?.play()
      setIsPlaying(true)
    }
  }

  return (
    <div style={{ padding: 32 }}>
      {!videoSrc && (
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFile}
          style={{ marginBottom: 24 }}
        />
      )}

      {videoSrc && meta && (
        <>
          <div style={{ maxWidth: '300px' }}>
            <Player
              ref={player}
              component={SubtitledVideo}
              durationInFrames={durationInFrames}
              fps={fps}
              compositionWidth={meta.width}
              compositionHeight={meta.height}
              inputProps={{ subtitles, videoSrc }}
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
          
          <Button
            onClick={handleLocalRender}
            disabled={isRendering}
            loading={isRendering}
          >
            {isRendering ? "Rendering locally..." : "Render locally"}
          </Button>

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
  )
}

export default dynamic(() => Promise.resolve(Page), { ssr: false })
