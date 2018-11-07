import { Callback, Context, Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const cloudwatch = new AWS.CloudWatch();

const sidekiqUrl = process.env.SIDEKIQ_URL;
const sidekiqUsername = '';
const sidekiqPassword = process.env.SIDEKIQ_PASSWORD;
const appName = process.env.APP_NAME;

const logMetric = async (attr: string, value: number) => {
  const params = {
    MetricData: [
      {
        Dimensions: [
          {
            Name: 'App',
            Value: appName,
          },
        ],
        MetricName: attr,
        Timestamp: new Date(),
        Unit: 'Count',
        Value: value,
      },
    ],
    Namespace: 'Sidekiq',
  };

  return cloudwatch.putMetricData(params).promise();
};

export const handler: Handler = async (
  _event: unknown,
  _context: Context,
  _callback: Callback | undefined,
) => {
  if (sidekiqUrl === undefined) {
    console.log('No SIDEKIQ_URL set');
    return;
  }

  const response = await fetch(sidekiqUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${Buffer.from(
        `${sidekiqUsername}:${sidekiqPassword}`,
      ).toString('base64')}`,
    },
  });

  if (!response.ok) {
    console.log('Error:', response.status, response.statusText);
    return;
  }

  const stats = await response.json();

  await Promise.all([
    logMetric('Enqueued', stats.sidekiq.enqueued),
    logMetric('Busy', stats.sidekiq.busy),
    logMetric('Retries', stats.sidekiq.retries),
    logMetric('Processes', stats.sidekiq.processes),
    logMetric('Scheduled', stats.sidekiq.scheduled),
    logMetric('DefaultLatency', stats.sidekiq.default_latency),
  ]);
};
