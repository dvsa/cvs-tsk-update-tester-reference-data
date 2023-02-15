import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import 'source-map-support/register';
import { NewPlateRequest } from './models/Request.model';
import logger from './observability/logger';
import * as technicalRecordService from './services/technicalRecord.service';
import * as sqsService from './services/sqs.service';
import { StatusCode, Vehicle } from './models/Vehicle.model';

const {
  NODE_ENV, SERVICE, AWS_PROVIDER_REGION, AWS_PROVIDER_STAGE,
} = process.env;

logger.info(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_PROVIDER_STAGE}'\n region: '${AWS_PROVIDER_REGION}'\n\n`,
);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'X-Content-Type-Options': 'nosniff',
};

export const handler = async (event: APIGatewayEvent, _: Context): Promise<APIGatewayProxyResult> => {
  logger.info('handler: triggered');

  try {
    const request = JSON.parse(event.body) as NewPlateRequest;

    logger.debug('handler: adding new plate to tech record');
    const techRecords = await technicalRecordService.addNewPlate(request);

    logger.debug('handler: updating tech record in DynamoDB');
    await technicalRecordService.updateTechRecord({ ...request as Vehicle, techRecord: techRecords });

    logger.debug('handler: sending tech record to SQS to generate new plate');
    await sqsService.sendTechRecordToSQS(techRecords.find((techRecord) => techRecord.statusCode === StatusCode.CURRENT), request);

    logger.info('handler: done, returning success');
    return {
      headers,
      statusCode: 200,
      body: null,
    };
  } catch (error) {
    logger.error('handler: ERROR', error);
    return { headers, statusCode: 500, body: null };
  }
};
