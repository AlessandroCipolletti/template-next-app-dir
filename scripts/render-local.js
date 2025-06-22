import { renderMedia, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import path from "path";
import fs from "fs/promises";

async function renderVideoLocally(inputProps, outputPath, progressPath) {
  try {
    // Bundle the Remotion composition
    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), "src/remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    // Get composition details
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "MyComp",
      inputProps,
    });

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      onProgress: async (progress) => {
        const percentage = Math.round(progress.progress * 100);
        console.log(`Rendering progress: ${percentage}%`);
        
        // Write progress to file for API route to read
        try {
          await fs.writeFile(progressPath, JSON.stringify({
            progress: progress.progress,
            percentage,
            renderedFrames: progress.renderedFrames,
            encodedFrames: progress.encodedFrames,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Failed to write progress file:', error);
        }
      },
    });

    return true;
  } catch (error) {
    console.error("Rendering error:", error);
    throw error;
  }
}

// If this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const inputPropsPath = process.argv[2];
  const outputPath = process.argv[3];
  const progressPath = process.argv[4] || path.join(process.cwd(), "tmp", `progress-${Date.now()}.json`);
  
  // Read input props from file
  const inputPropsJson = await fs.readFile(inputPropsPath, 'utf8');
  const inputProps = JSON.parse(inputPropsJson);
  
  renderVideoLocally(inputProps, outputPath, progressPath)
    .then(() => {
      console.log(`Video rendered successfully to: ${outputPath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to render video:", error);
      process.exit(1);
    });
}

export { renderVideoLocally }; 