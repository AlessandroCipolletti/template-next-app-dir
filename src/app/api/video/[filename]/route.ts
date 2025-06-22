import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const videoPath = path.join(process.cwd(), "tmp", filename);
    
    // Check if file exists
    try {
      await fs.access(videoPath);
    } catch {
      return NextResponse.json({ error: "Video file not found" }, { status: 404 });
    }

    // Read the video file
    const videoBuffer = await fs.readFile(videoPath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'video/mp4'; // default
    
    if (ext === '.avi') contentType = 'video/x-msvideo';
    else if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.wmv') contentType = 'video/x-ms-wmv';
    else if (ext === '.flv') contentType = 'video/x-flv';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mkv') contentType = 'video/x-matroska';

    // Return the video file
    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("Video serving error:", error);
    return NextResponse.json(
      { error: "Failed to serve video", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 