import {
  speculateFunctionName,
  AwsRegion,
  getRenderProgress,
} from '@remotion/lambda/client';
import {
  REMOTION_LAMBDA_DISK,
  REMOTION_LAMBDA_RAM,
  REMOTION_LAMBDA_REGION,
  REMOTION_LAMBDA_TIMEOUT,
} from '../../../../remotion/remotionConfig.mjs';
import { executeApi } from '../../../../helpers/api-response';
import { ProgressRequest, ProgressResponse } from '../../../../types/schema';

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    const renderProgress = await getRenderProgress({
      bucketName: body.bucketName,
      functionName: speculateFunctionName({
        diskSizeInMb: REMOTION_LAMBDA_DISK,
        memorySizeInMb: REMOTION_LAMBDA_RAM,
        timeoutInSeconds: REMOTION_LAMBDA_TIMEOUT,
      }),
      region: REMOTION_LAMBDA_REGION as AwsRegion,
      renderId: body.id,
    });

    if (renderProgress.fatalErrorEncountered) {
      return {
        type: 'error',
        message: renderProgress.errors[0].message,
      };
    }

    if (renderProgress.done) {
      return {
        type: 'done',
        url: renderProgress.outputFile as string,
        size: renderProgress.outputSizeInBytes as number,
      };
    }

    return {
      type: 'progress',
      progress: Math.max(0.03, renderProgress.overallProgress),
    };
  },
);
