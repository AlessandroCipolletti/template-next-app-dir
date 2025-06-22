import { FC } from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { Subtitle } from '../types/constants'
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";

export type SubtitledVideoProps = {
  // videoSrc: string
  subtitles: Subtitle[]
}

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});

export const SubtitledVideo: FC<SubtitledVideoProps> = ({
  // videoSrc,
  subtitles,
}) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = f / fps

  // Group words into sentences/chunks of 3-4 words
  const groupWordsIntoChunks = (subtitles: Subtitle[]): Subtitle[][] => {
    const chunks: Subtitle[][] = []
    let currentChunk: Subtitle[] = []

    for (const word of subtitles) {
      currentChunk.push(word)

      // Check if the word ends with punctuation that should end the chunk
      const endsWithPunctuation =
        word.text.endsWith(',') || word.text.endsWith('.')

      // Start a new chunk if we have 4 words, if there's a significant gap, or if word ends with punctuation
      if (currentChunk.length >= 4 || endsWithPunctuation) {
        chunks.push([...currentChunk])
        currentChunk = []
      } else if (currentChunk.length > 0) {
        // Check if there's a gap of more than 0.5 seconds to the next word
        const currentEnd = currentChunk[currentChunk.length - 1].end
        const nextWord = subtitles[subtitles.indexOf(word) + 1]
        if (nextWord && nextWord.start - currentEnd > 0.5) {
          chunks.push([...currentChunk])
          currentChunk = []
        }
      }
    }

    // Add remaining words
    if (currentChunk.length > 0) {
      chunks.push(currentChunk)
    }

    return chunks
  }

  // Helper function to clean word text by removing punctuation
  const cleanWordText = (text: string): string => {
    return text.replace(/[,.]$/, '') // Remove comma or period at the end
  }

  const wordChunks = groupWordsIntoChunks(subtitles)

  // Find the current chunk being displayed - simplified and deterministic logic
  const currentChunk = wordChunks.find((chunk) => {
    const chunkStart = chunk[0]?.start || 0
    const chunkEnd = chunk[chunk.length - 1]?.end || 0
    return t >= chunkStart && t <= chunkEnd
  }) || []

  return (
    <AbsoluteFill>
      {/* <Video src={videoSrc} /> */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            fontSize: 80,
            color: '#fff',
            textShadow: '0 0 10px #000',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '90%',
            textAlign: 'center',
          }}
        >
          {currentChunk.map((word) => (
            <span
              key={`${word.text}-${word.start}-${word.end}`}
              style={{
                margin: '0 0px',
                padding: '0px 20px',
                borderRadius: '8px',
                fontFamily,
                backgroundColor:
                  word.start <= t && word.end >= t
                    ? 'rgba(255, 255, 0, 0.7)'
                    : 'transparent',
                transition: 'background-color 0.1s ease-in-out',
              }}
            >
              {cleanWordText(word.text)}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
