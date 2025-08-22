import {
  deployFunction,
  deploySite,
  getOrCreateBucket,
  deleteSite,
} from '@remotion/lambda';
import { getSites } from '@remotion/lambda/client';
import dotenv from 'dotenv';
import path from 'path';
import {
  REMOTION_LAMBDA_DISK,
  REMOTION_LAMBDA_RAM,
  REMOTION_LAMBDA_REGION,
  REMOTION_LAMBDA_SITE_NAME,
  REMOTION_LAMBDA_TIMEOUT,
} from './remotionConfig.mjs';

console.log('Selected region:', REMOTION_LAMBDA_REGION);
dotenv.config();

if (!process.env.REMOTION_AWS_ACCESS_KEY_ID) {
  console.log(
    'The environment variable "REMOTION_AWS_ACCESS_KEY_ID" is not set.',
  );
  console.log('Lambda renders were not set up.');
  console.log(
    'Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup',
  );
  process.exit(0);
}
if (!process.env.REMOTION_AWS_SECRET_ACCESS_KEY) {
  console.log(
    'The environment variable "REMOTION_REMOTION_AWS_SECRET_ACCESS_KEY" is not set.',
  );
  console.log('Lambda renders were not set up.');
  console.log(
    'Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup',
  );
  process.exit(0);
}

process.stdout.write('Deploying Lambda function... ');

const { functionName, alreadyExisted: functionAlreadyExisted } =
  await deployFunction({
    createCloudWatchLogGroup: true,
    memorySizeInMb: REMOTION_LAMBDA_RAM,
    region: REMOTION_LAMBDA_REGION,
    timeoutInSeconds: REMOTION_LAMBDA_TIMEOUT,
    diskSizeInMb: REMOTION_LAMBDA_DISK,
  });
console.log(
  functionName,
  functionAlreadyExisted ? '(already existed)' : '(created)',
);

process.stdout.write('Ensuring bucket... ');
const { bucketName, alreadyExisted: bucketAlreadyExisted } =
  await getOrCreateBucket({
    region: REMOTION_LAMBDA_REGION,
  });
console.log(
  bucketName,
  bucketAlreadyExisted ? '(already existed)' : '(created)',
);

process.stdout.write('Cleaning previous sites... ');
const { sites } = await getSites({ region: REMOTION_LAMBDA_REGION });
const relatedSites = sites.filter(
  (s) =>
    s.id === REMOTION_LAMBDA_SITE_NAME ||
    s.id.startsWith(`${REMOTION_LAMBDA_SITE_NAME}-`) ||
    s.id.startsWith(`${REMOTION_LAMBDA_SITE_NAME}@`) ||
    s.id.startsWith(`${REMOTION_LAMBDA_SITE_NAME}_`),
);

for (const s of relatedSites) {
  console.log(`\n  Deleting site: ${s.id}`);
  await deleteSite({
    bucketName,
    region: REMOTION_LAMBDA_REGION,
    siteId: s.id,
  });
}
console.log('\nCleanup complete.');

process.stdout.write('Deploying site... ');
const result = await deploySite({
  bucketName,
  entryPoint: path.join(process.cwd(), 'src', 'remotion', 'Entry.ts'),
  siteName: REMOTION_LAMBDA_SITE_NAME,
  region: REMOTION_LAMBDA_REGION,
});
console.log({ result });

console.log();
console.log('You now have everything you need to render videos!');
console.log('Re-run this command when:');
console.log('  1) you changed the video rendering code');
console.log('  2) you changed config.mjs');
console.log('  3) you upgraded Remotion to a newer version');
