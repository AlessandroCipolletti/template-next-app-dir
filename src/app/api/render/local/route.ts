import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { CompositionProps } from "../../../../types/constants";

const execAsync = promisify(exec);

const RenderRequestSchema = CompositionProps;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputProps = RenderRequestSchema.parse(body);

    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tmpDir, { recursive: true });

    // Generate unique output path and progress file
    const outputPath = path.join(tmpDir, `output-${inputProps.requestId}.mp4`);
    const inputPropsPath = path.join(tmpDir, `input-${inputProps.requestId}.json`);
    const progressPath = path.join(tmpDir, `progress-${inputProps.requestId}.json`);
    
    // Write input props to a temporary file to avoid shell interpretation issues
    await fs.writeFile(inputPropsPath, JSON.stringify(inputProps, null, 2));
    
    // Run the rendering script with file path instead of JSON string
    const scriptPath = path.join(process.cwd(), "scripts/render-local.js");
    await execAsync(`node ${scriptPath} '${inputPropsPath}' '${outputPath}' '${progressPath}'`);

    // Read the generated video file
    const videoBuffer = await fs.readFile(outputPath);
    
    // Clean up the temporary files
    await fs.unlink(outputPath);
    await fs.unlink(inputPropsPath);
    try {
      await fs.unlink(progressPath);
    } catch {
      // Progress file might not exist, ignore error
    }

    // Return the video as a response
    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=video.mp4",
      },
    });

  } catch (error) {
    console.error("Local rendering error:", error);
    return NextResponse.json(
      { error: "Failed to render video", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 