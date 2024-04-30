import { DynamoDBDocumentClient, QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import config from '../config';
import IDynamoRecord, { ResourceType } from './IDynamoRecord';

const dynamo = DynamoDBDocumentClient.from(new DynamoDB());

export const getDynamoMembers: () => Promise<IDynamoRecord[]> = async () => {
  const result = await dynamo.send(new QueryCommand(
    {
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
    } as QueryCommandInput
  ))
  // .query({
  //   TableName: config.aws.dynamoTable,
  //   KeyConditionExpression: 'resourceType = :type',
  //   FilterExpression: 'attribute_not_exists(#ttl_key) or #ttl_key = :null',
  //   ExpressionAttributeValues: {
  //     ':type': ResourceType.User,
  //     ':null': null,
  //   },
  //   ExpressionAttributeNames: {
  //     '#ttl_key': 'ttl',
  //   },
  // } as QueryCommandInput);

  return result.Items as unknown as IDynamoRecord[];
};
