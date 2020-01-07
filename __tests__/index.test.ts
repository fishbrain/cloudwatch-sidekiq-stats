import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';

import { logMetric } from '../index';

describe('logMetric', () => {
  it('it sends the metric to cloudwatch', async () => {
    AWSMock.mock(
      'CloudWatch',
      'putMetricData',
      (
        params: AWS.CloudWatch.PutMetricDataInput,
        cb: (err: AWS.AWSError | null, data: {}) => void,
      ) => {
        expect(params.Namespace).toBe('Sidekiq');
        expect(params.MetricData[0].Value).toBe(1);
        cb(null, {});
      },
    );

    await logMetric('Enqueued', 1);
  });
});
