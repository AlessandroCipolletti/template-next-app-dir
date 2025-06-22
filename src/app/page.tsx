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

  const durationInFrames = meta ? Math.ceil(meta.duration * fps) : 0

  const [isRendering, setIsRendering] = useState(false);

  const handleLocalRender = async () => {
    setIsRendering(true);
    try {
      const response = await fetch("/api/render/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subtitles }),
      });

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
              inputProps={{ subtitles }}
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
