import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { ResourceType } from '../../src/dynamo/IDynamoRecord';
import { getDynamoMembers } from '../../src/dynamo/getDynamoRecords';

const mockDynamoClient = mockClient(DynamoDBDocumentClient);

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

describe('getDynamoMembers', () => {
  beforeEach(() => {
    mockDynamoClient.reset();
  });

  it('should call dynamo query', async () => {
    mockDynamoClient.on(QueryCommand).callsFake((params) => {
      expect(params).toBeCalledWith({
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
    }).resolves(mockItems as unknown as QueryCommandOutput);
    await getDynamoMembers();
  });
});
