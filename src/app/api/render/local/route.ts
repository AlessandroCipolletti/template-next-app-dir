import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { RenderRequestSchema } from "../../../../types/constants";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let outputPath: string = '';
  let inputPropsPath: string = '';
  let progressPath: string = '';

  try {
    const body = await request.json();
    const inputProps = RenderRequestSchema.parse(body);

    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tmpDir, { recursive: true });

    // Generate unique output path and progress file
    outputPath = path.join(tmpDir, `output-${inputProps.requestId}.mov`);
    inputPropsPath = path.join(tmpDir, `input-${inputProps.requestId}.json`);
    progressPath = path.join(tmpDir, `progress-${inputProps.requestId}.json`);
    
    // Write input props to a temporary file to avoid shell interpretation issues
    await fs.writeFile(inputPropsPath, JSON.stringify(inputProps, null, 2));
    
    // Run the rendering script with file path instead of JSON string
    const scriptPath = path.join(process.cwd(), "scripts/render-local.js");
    await execAsync(`node ${scriptPath} '${inputPropsPath}' '${outputPath}' '${progressPath}'`);

    // Read the generated video file
    const videoBuffer = await fs.readFile(outputPath);
    
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
  } finally {
    try {
      await fs.unlink(outputPath);
      await fs.unlink(inputPropsPath);
      await fs.unlink(progressPath);
    } catch {
      // Output file might not exist, ignore error
    }
  }
} 