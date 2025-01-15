import { DynamoDBDocumentClient, QueryCommandOutput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import config from '../../src/config';
import { ResourceType } from '../../src/dynamo/IDynamoRecord';
import { getDynamoMembers } from '../../src/dynamo/getDynamoRecords';

const mockItems = {
  Items: [
    {
      resourceType: ResourceType.User,
      resourceKey: '6adbf131-c6c2-4bc6-b1e9-b62f812bed29',
      name: 'test user',
      email: 'testUser@example.com',
    },
    {
      resourceType: ResourceType.User,
      resourceKey: '7d9e8e38-78d5-46ad-9fd0-6adad882161b',
      name: 'test user 2',
      email: 'testUser2@example.com',
    },
  ],
}

const client = mockClient(DynamoDBDocumentClient);

describe('getDynamoMembers', () => {
  beforeEach(() => {
    config.aws.dynamoTable = 'testTable';
    client.reset()
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call dynamo query', async () => {
    client.on(QueryCommand).resolves(mockItems as unknown as QueryCommandOutput)
    await getDynamoMembers();
    expect(client.call(0).firstArg.input).toEqual({
      TableName: 'testTable',
      KeyConditionExpression: 'resourceType = :type',
      FilterExpression: 'attribute_not_exists(#ttl_key) or #ttl_key = :null',
      ExpressionAttributeValues: {
        ':type': ResourceType.User,
        ':null': null,
      },
      ExpressionAttributeNames: {
        '#ttl_key': 'ttl',
      },
    })
  });
});
