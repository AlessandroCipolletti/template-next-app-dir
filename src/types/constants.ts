import text_subtitles from '../app/text_subtitles.json';

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
  subtitles: text_subtitles.words.filter((w) => w.text.trim() !== ''),
  videoSrc:
    'https://argoseyes.s3.eu-west-3.amazonaws.com/development/test-subtitles.mp4?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMyJIMEYCIQDs47MmYU4cdXw3hkmlXW2BKOkuqu6iBgJLFfJnUinOzQIhANO7pbYffODPgXWzilOjnLmDpV6WQ8STG1HnYegXhWa3KtUDCO7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMjAxNDU0ODUyMTUyIgzsTIN1IA6M%2F0AJ850qqQMJS7EACdpXgdpcUmlQm66%2BErz0R2%2BygOS9Nrsmy7elKb1%2Fg6vRxdwgUpFJ9dCNarUqPL%2Bukzm%2B8BNgVzPpwpdfgHwDxC%2BTErvap5IRsU9jjIlARK%2BGaIqoLU6G4%2FOC20mO4uR5rpLhFN0Fnguqgkizk0UCRPiD48yIN05N4iPyTMTpmZsgikJYvjWuIO%2B1L8JUZMMu9%2FyTo5kHjNWujjoYoEBeGlnBuuyEbZNQWD1Wdibicx74U99WZNviyZSnAazUiTZT8IWeuAwmRairO9meilz%2BVTCAiTNSYqJgk1OeRNU3g6M94bjGh6eGjK8ZL8V7F8PYTYRnYz30FkCR8N6VSpbjoF5CuJW9s8jJ60Fc3LRRKKvTVfy3RZdJMirLuYsCJBQFTxQj1gjN6lqkbt0SzNVTAj%2B4ORRdIj308ejDEbmMp0GnXs4143UbNkkvp5XzB2fhB%2B%2BiYbqI8EMhpLG8Dn0TjID2nw%2BQA091UgAQF7OvHgQaaTBdDE%2FS%2FR8CVtDwxMgvCvQ5WuQ8zJuNnDlGYtFVYVnzQqJlbNq%2BzPUSCL%2FEhRw0cn5I0zCrp5zFBjrdAlWV9ZYWmMp5%2Bxk27momqGW4HJXpVDK2Jhmv2Iqu427yVfMTX2EFbzgpIphrwzSd8ALnNqnJC2tBCClIMOpkZNflIm2%2FjG4UkltBni26zId7sNFWwAvjBX1saWK6%2BIi0TCP8GuQFt2r%2FpTsWH7WnhWJAZbGAtKmrXiBeIqQWwHLPz7xwW49N0pGwdmRGJ2IAkol6AJ%2FVPRADxiq6KGYSNfDveAVRmqqCnImgBFG1CJ%2F88tzoCPdcazaWNzEZ%2ByJFS8v1UZLRYIS%2F0jbIMGbAzG13EucFo%2F5Da3Hvqe%2Fdy%2BXZY4aMFjTfOPc1xjXehaCfM%2FQkKQnN0mEOrJl6mvYxLB4fLKRLvPMtVk8oBiG%2BHMVDFwXfsC7FmP5IvUmC2TDvIo%2B8vUhWiZMmgVHMruEWWA%2FnTK52pH9uXVzM1rizEgErpg0qU6k7gYkfI%2F%2BkboJYoQBM%2BKulmVS9FdSSH%2F8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAS5Z5FDA4OCODEPJU%2F20250821%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20250821T124022Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=82f4d6409dbf786407f3650cf608ee9b42b4c1b79924dd5c1160cfd4b0aeacc9',
  width: 1080,
  height: 1920,
  durationInFrames: 212.5 * 30,
  fps: 30,
};
