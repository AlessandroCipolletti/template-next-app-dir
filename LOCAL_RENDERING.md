# Local Video Rendering API

This project now includes a local video rendering API that allows you to generate videos using Remotion directly from your Next.js application, without requiring AWS Lambda.

## How it Works

The local rendering API uses Remotion's `renderMedia` function to generate videos on your local machine, just like the `npx remotion render` command, but triggered via an HTTP API endpoint.

## API Endpoint

**POST** `/api/render/local`

### Request Body
```json
{
  "title": "Your custom title here"
}
```

### Response
- **Success**: Returns the video file as a binary response with `Content-Type: video/mp4`
- **Error**: Returns JSON with error details

## Usage Examples

### 1. Using the UI Component

The project includes a `LocalRenderButton` component that you can use in your React components:

```tsx
import { LocalRenderButton } from "../components/LocalRenderButton";

<LocalRenderButton title="My Custom Video Title" />
```

### 2. Direct API Call

```javascript
const response = await fetch("/api/render/local", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ title: "My Custom Title" }),
});

if (response.ok) {
  const videoBlob = await response.blob();
  // Handle the video blob (download, display, etc.)
}
```

### 3. Download the Video

```javascript
const videoBlob = await response.blob();
const url = window.URL.createObjectURL(videoBlob);
const a = document.createElement("a");
a.href = url;
a.download = "video.mp4";
a.click();
window.URL.revokeObjectURL(url);
```

## Technical Details

### What Happens During Rendering

1. **Bundling**: The API bundles your Remotion composition using `@remotion/bundler`
2. **Composition Selection**: Uses `selectComposition` to get the composition details
3. **Rendering**: Calls `renderMedia` with the bundled composition
4. **File Handling**: Creates a temporary file, renders to it, reads it back, and cleans up
5. **Response**: Returns the video as a binary response

### Performance Considerations

- **Local Processing**: Rendering happens on your server, so it uses your server's CPU and memory
- **Temporary Files**: Videos are temporarily stored in a `tmp/` directory during rendering
- **Cleanup**: Temporary files are automatically deleted after the response is sent
- **Concurrent Requests**: Multiple simultaneous render requests will work but may impact server performance

### Error Handling

The API includes comprehensive error handling for:
- Invalid input parameters
- Bundling failures
- Rendering errors
- File system issues

## Comparison with Lambda Rendering

| Feature | Local Rendering | Lambda Rendering |
|---------|----------------|------------------|
| **Speed** | Depends on server specs | Fast (AWS infrastructure) |
| **Cost** | Free (uses your server) | Pay per render |
| **Scalability** | Limited by server capacity | Highly scalable |
| **Setup** | No AWS configuration needed | Requires AWS setup |
| **Dependencies** | Server must have Remotion installed | No server dependencies |

## Integration with Existing Project

The local rendering API is designed to work alongside the existing Lambda rendering system. You can:

1. Use local rendering for development and testing
2. Use Lambda rendering for production with high volume
3. Switch between them based on your needs

## Requirements

- Node.js with Remotion dependencies installed
- Sufficient disk space for temporary video files
- Adequate CPU and memory for video rendering

## Troubleshooting

### Common Issues

1. **Memory Errors**: Increase your server's memory allocation
2. **Timeout Errors**: Rendering may take time for complex compositions
3. **File Permission Errors**: Ensure the `tmp/` directory is writable

### Debug Mode

Enable debug logging by checking the server console for progress messages:
```
Rendering progress: 25%
Rendering progress: 50%
Rendering progress: 75%
Rendering progress: 100%
``` 