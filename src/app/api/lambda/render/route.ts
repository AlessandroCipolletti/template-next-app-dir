import { AwsRegion, RenderMediaOnLambdaOutput } from '@remotion/lambda/client';
import {
  renderMediaOnLambda,
  speculateFunctionName,
} from '@remotion/lambda/client';
import { executeApi } from '../../../../helpers/api-response';
import {
  REMOTION_LAMBDA_CONCURRENCY,
  REMOTION_LAMBDA_DISK,
  REMOTION_LAMBDA_REGION,
  REMOTION_LAMBDA_RAM,
  REMOTION_LAMBDA_SITE_NAME,
  REMOTION_LAMBDA_TIMEOUT,
} from '../../../../videoRenderingEngine/remotionConfig.mjs';
import { RenderRequest } from '../../../../types/schema';

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    if (!process.env.REMOTION_AWS_ACCESS_KEY_ID) {
      throw new TypeError(
        'Set up Remotion Lambda to render videos. See the README.md for how to do so.',
      );
    }
    if (!process.env.REMOTION_AWS_SECRET_ACCESS_KEY) {
      throw new TypeError(
        'The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.',
      );
    }

    const result = await renderMediaOnLambda({
      codec: 'h264',
      functionName: speculateFunctionName({
        diskSizeInMb: REMOTION_LAMBDA_DISK,
        memorySizeInMb: REMOTION_LAMBDA_RAM,
        timeoutInSeconds: REMOTION_LAMBDA_TIMEOUT,
      }),
      concurrency: REMOTION_LAMBDA_CONCURRENCY,
      region: REMOTION_LAMBDA_REGION as AwsRegion,
      serveUrl: REMOTION_LAMBDA_SITE_NAME,
      composition: body.id,
      inputProps: body.inputProps,
      timeoutInMilliseconds: 1000 * 60 * 30,
      // framesPerLambda: 100,
      downloadBehavior: {
        type: 'download',
        fileName: 'video.mp4',
      },
    });

    return result;
  },
);
