import * as AWS from 'aws-sdk';
import config from '../config';
import IDynamoRecord, { ResourceType } from './IDynamoRecord';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const getDynamoMembers: () => Promise<IDynamoRecord[]> = async () => {
  const result = await dynamo
    .query({
      TableName: config.aws.dynamoTable,
      KeyConditionExpression: 'resourceType = :type',
      FilterExpression: 'attribute_not_exists(#ttl_key) or #ttl_key = :null',
      ExpressionAttributeValues: {
        ':type': ResourceType.User,
        ':null': null,
      },
      ExpressionAttributeNames: {
        '#ttl_key': 'ttl',
      },
    } as AWS.DynamoDB.DocumentClient.QueryInput)
    .promise();

  return result.Items as IDynamoRecord[];
};
