import config from '../config';
import IDynamoRecord, { ResourceType } from './IDynamoRecord';
import { DynamoDBDocumentClient, QueryCommandInput } from "@aws-sdk/lib-dynamodb"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient());

export const getDynamoMembers: () => Promise<IDynamoRecord[]> = async () => {
  const result = await dynamo
    .send(new QueryCommand(
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
    ));

  return result.Items as unknown as IDynamoRecord[];
};
