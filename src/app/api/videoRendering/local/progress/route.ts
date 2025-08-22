import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    
    if (!requestId) {
      return NextResponse.json({ error: "requestId parameter is required" }, { status: 400 });
    }

    const progressPath = path.join(process.cwd(), "tmp", `progress-${requestId}.json`);
    console.log('Try to read Progress file path:', progressPath)
    
    try {
      const progressData = await fs.readFile(progressPath, 'utf8');
      const progress = JSON.parse(progressData);
      
      return NextResponse.json(progress);
    } catch {
      // Progress file doesn't exist yet or can't be read
      console.log('Progress file not found')
      return NextResponse.json({ 
        progress: 0, 
        percentage: 0, 
        renderedFrames: 0, 
        encodedFrames: 0,
        status: "not_started"
      });
    }

  } catch (error) {
    console.error("Progress reading error:", error);
    return NextResponse.json(
      { error: "Failed to read progress", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 