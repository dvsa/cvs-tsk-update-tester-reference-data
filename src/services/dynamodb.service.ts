import { DynamoDB } from 'aws-sdk';
import { getConfig, Config } from '../config';
import { Vehicle } from '../models/Vehicle.model';
import logger from '../observability/logger';

const config: Config = getConfig();

export type DynamoKey = { id: string; sortValue?: string };

export type Item = DynamoDB.DocumentClient.AttributeMap;

const client = new DynamoDB.DocumentClient({
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});

export const put = async (vehicle: Vehicle): Promise<void> => {
  const {
    systemNumber, vin, trailerId, techRecord,
  } = vehicle;

  const query = {
    TableName: config.TECHNICAL_RECORDS_TABLE,
    Key: {
      systemNumber,
      vin,
    },
    UpdateExpression: 'set techRecord = :techRecord',
    ConditionExpression: 'systemNumber = :systemNumber AND vin = :vin',
    ExpressionAttributeValues: {
      ':systemNumber': systemNumber,
      ':vin': vin,
      ':techRecord': techRecord,
    },
    ReturnValues: 'NONE',
  };

  if (trailerId) {
    logger.info(`found trailerId: ${trailerId} - adding to update expression`);
    query.UpdateExpression += ', trailerId = :trailerId';
    Object.assign(query.ExpressionAttributeValues, {
      ':trailerId': trailerId,
    });
  }

  try {
    await client.update(query).promise();
  } catch (err: unknown) {
    logger.error(err);
    throw new Error(err as string);
  }
};
