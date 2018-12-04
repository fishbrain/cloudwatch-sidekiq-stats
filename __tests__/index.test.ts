import * as context from 'aws-lambda-mock-context';
import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import { handler, logMetric } from '../index';

describe('logMetric', () => {
  it('it sends the metric to cloudwatch', () => {
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

    logMetric('Enqueued', 1);
  });
});
