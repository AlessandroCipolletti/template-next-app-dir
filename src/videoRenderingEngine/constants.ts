import { z } from 'zod';
export const COMP_NAME = 'MyComp';

export type Subtitle = { text: string; start: number; end: number };

export const CompositionProps = z.object({
  subtitles: z.array(
    z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(),
    }),
  ),
  videoSrc: z.string().optional(),
  // Dynamic video parameters
  width: z.number().default(1080),
  height: z.number().default(1080),
  durationInFrames: z.number(),
  fps: z.number().default(30),
});

export const RenderRequestSchema = z.object({
  subtitles: z.array(
    z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(),
    }),
  ),
  videoSrc: z.string().optional(),
  requestId: z.string(),
  // Dynamic video parameters
  width: z.number().default(1080),
  height: z.number().default(1080),
  durationInFrames: z.number(),
  fps: z.number().default(30),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  subtitles: [],
  videoSrc: '',
  width: 1080,
  height: 1920,
  durationInFrames: 120 * 30,
  fps: 30,
};
