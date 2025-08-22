/**
 * Use autocomplete to get a list of available regions.
 * @type {import('@remotion/lambda').AwsRegion}
 */
export const REMOTION_LAMBDA_REGION = 'eu-west-3';

export const REMOTION_LAMBDA_SITE_NAME = 'arcads-video-rendering-engine';

export const REMOTION_LAMBDA_CONCURRENCY = 40;

export const REMOTION_LAMBDA_RAM = 3009;
export const REMOTION_LAMBDA_DISK = 10240;
export const REMOTION_LAMBDA_TIMEOUT = 15 * 60; // max timeout is 900 seconds = 15 minutes
