'use client'
import { FC, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Player, PlayerRef } from '@remotion/player'
import text_subtitles from './text_subtitles.json'
import { SubtitledVideo } from '../components/SubtitledVideo'
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
      
      // Get video metadata for dynamic parameters
      const videoMetadata = meta ? {
        width: meta.width,
        height: meta.height,
        durationInFrames: Math.ceil(meta.duration * fps),
        fps: fps
      } : {
        width: 1080,
        height: 1920,
        durationInFrames: 120 * 30,
        fps: 30
      };
      
      // Prepare the request data with dynamic parameters
      const requestData = {
        subtitles,
        videoSrc: 'https://argoseyes.s3.eu-west-3.amazonaws.com/development/situations/804b04f6-bf3d-4e54-9ee5-84be0caa0e18.mp4?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHQaCWV1LXdlc3QtMyJHMEUCIEvZXB1vqKSqkMlh2CPuc9Nm9zQchU8RRM9dtzlsjXfHAiEAgy8ddxOx0aVU4WMlDW1I4R3Iq1ot%2BKoaNYnSNF64Oo0q1QMIvf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwyMDE0NTQ4NTIxNTIiDDIMfls8AtAeZ6EugiqpA8xFldvAyHMM1EIzoJY%2Bx1hVZIZyosgns93VI3YWau8qGqzVz4rLStavrHVQCU17ZluPysMg1eFaK9cUdqsy3OiowzThEBJwW%2FBin%2B7siWochy5jjLwOB2aqa0he153hVT4%2FCbgoi8nos4gE%2BVAaqAPy91CvNXaZC5yqCjA%2F%2BxkHO7U09bbFdYxQsBxaK33MD3Pq%2BnDIsx%2Fm863NcEdMgkYrwWsbbkqTJIGaxSnVMcPY7NtphtWrv8nZtH%2BmWQG57pKjJfwovNqLkux9%2Bsx0ec6o7AiDI9OgmmAcTS93wWWm%2Bcd%2FvJGPAkhdHi7rubDvjRPHm5rjPToUgwhGivo7y8SUHSezvh82PAcQduYs5cGLajK8%2ByTHAgmT59VOzlobTC%2FEnW0QFTaGMIAxAFm3cnQsNzH2nkA3Sb4f13iH225IUnVPUewbQdFZR3WpIQQyoiKsKH%2BlfO6AcJUBYFeygg8bC5jT2BdVeSxEdmNzY19aYSPCPJrwI8L3XL9lBi35FZ6SL1mHgTd66q2bT1gyX5hkOSzznuGboqO2psU2J6r2bvHGIjtl%2BEAPMOi1kcUGOt4C4jyyE4bWBTLC96%2BZv4v26T62kbhXQwfPlFNtFb2KasAziAuOq4pch5Hj7E2N1I%2FD8voJxrSBX3pekvbRG3%2BxDVPtFM0so4fYbQoImkjolSrAFsb%2B11oQuTjmXU28MkWAdaAsi2JmnZQKy1%2B2pk9STIn%2BJ1JAnqvfR%2FnCe2SL34JAru2Cb%2BJwqJVswDwFpgBjcWFYRnBtNUOEN%2FRE0uaNjEyT0IeuSgBB6D%2B%2F3dz1jWdQyqMLQEhI5J%2BaTApqX4Wy0prXlkt2IAFqBcJktr%2BWH9JMakiDS8367LLG5ZFUz5Gf9fJO8rpJ3njvvHeUpHNFkDPIF89L6p0ndAhStWxh4uG4kbkaTJbL5MYw%2BJCbCzJbtkBlqOv3sYUMesw3Bl9jrHx28sdb4k3YBSvAJIG0KhZwzpWoXxJnONGeJUoMZrNt%2B6LEwE5yHCyOsocDsMmbsP6QBHra794mKVldkRU%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAS5Z5FDA4LJ6WJGBV%2F20250819%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20250819T115318Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=9dc590b3178b7476c0e77ecedc0bf0686db17001929c36b0b397b2348d189f41',
        requestId,
        ...videoMetadata,
      };
      
      // Start the render process
      const promise = fetch("/api/render/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
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
      console.log(url)
      debugger
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);

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
          
          <button
            onClick={handleLocalRender}
            disabled={isRendering}
          >
            {isRendering ? "Rendering locally..." : "Render locally"}
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
  )
}

export default dynamic(() => Promise.resolve(Page), { ssr: false })
