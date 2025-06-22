import { z } from "zod";
export const COMP_NAME = "MyComp";

export type Subtitle = { text: string; start: number; end: number }

export const CompositionProps = z.object({
  subtitles: z.array(z.object({
    text: z.string(),
    start: z.number(),
    end: z.number(),
  })),
  requestId: z.string(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  subtitles: [],
  requestId: '123',
};

// export const DURATION_IN_FRAMES = 200;
// export const VIDEO_WIDTH = 1280;
// export const VIDEO_HEIGHT = 720;

export const DURATION_IN_FRAMES = 212*30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

export const VIDEO_FPS = 30;
