import { renderMedia, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import path from "path";
import fs from "fs/promises";

async function renderVideoLocally(inputProps, outputPath) {
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
      onProgress: (progress) => {
        const percentage = Math.round(progress.progress * 100);
        console.log(`Rendering progress: ${percentage}%`);
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
  const outputPath = process.argv[3] || path.join(process.cwd(), "tmp", `output-${Date.now()}.mp4`);
  
  // Read input props from file
  const inputPropsJson = await fs.readFile(inputPropsPath, 'utf8');
  const inputProps = JSON.parse(inputPropsJson);
  
  renderVideoLocally(inputProps, outputPath)
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