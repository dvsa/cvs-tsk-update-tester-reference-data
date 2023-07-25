import { SQS } from 'aws-sdk';
import { NewLetterRequest, NewPlateRequest } from '../models/Request.model';
import { DocumentName, SQSRequestBody } from '../models/SqsPayloadRequest.model';
import { TechRecord, Vehicle, VehicleType } from '../models/Vehicle.model';
import logger from '../observability/logger';
import { getConfig, Config } from '../config';

const config: Config = getConfig();

export const sendTechRecordToSQS = async (
  techRecord: TechRecord,
  request: NewPlateRequest | NewLetterRequest,
  type: string,
): Promise<void> => {
  logger.info('Send tech record to SQS');

  const sqs = new SQS({ apiVersion: '2012-11-05' });

  const params = {
    MessageBody:
      type === 'letter'
        ? JSON.stringify(formatLetterPayload(techRecord, request as NewLetterRequest))
        : JSON.stringify(formatPlatePayload(techRecord, request as NewPlateRequest)),
    QueueUrl: config.DOC_GEN_SQS_QUEUE,
  };

  try {
    await sqs.sendMessage(params).promise();
  } catch (err: unknown) {
    logger.error(err);
    throw new Error(err as string);
  }
};

export const formatPlatePayload = (techRecord: TechRecord, request: NewPlateRequest): SQSRequestBody => {
  const vehicle: Vehicle = {
    vin: request.vin,
    primaryVrm: request.primaryVrm,
    systemNumber: request.systemNumber,
    techRecord,
    trailerId: request.trailerId,
  };

  const plate = techRecord.plates.sort(
    (a, b) => new Date(b.plateIssueDate).getTime() - new Date(a.plateIssueDate).getTime(),
  )[0];

  return {
    vehicle,
    plate,
    documentName: techRecord.vehicleType === VehicleType.Trailer ? DocumentName.MINISTRY : DocumentName.MINISTRY,
    recipientEmailAddress: request.recipientEmailAddress,
  };
};

export const formatLetterPayload = (techRecord: TechRecord, request: NewLetterRequest): SQSRequestBody => {
  const vehicle: Vehicle = {
    vin: request.vin,
    primaryVrm: request.primaryVrm,
    systemNumber: request.systemNumber,
    techRecord,
    trailerId: request.trailerId,
  };

  return {
    vehicle,
    letter: techRecord.letterOfAuth,
    documentName: DocumentName.TRL_INTO_SERVICE,
    recipientEmailAddress: request.recipientEmailAddress,
  };
};
