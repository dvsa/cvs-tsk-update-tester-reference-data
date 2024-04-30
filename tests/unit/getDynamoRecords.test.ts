import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { ResourceType } from '../../src/dynamo/IDynamoRecord';
import { getDynamoMembers } from '../../src/dynamo/getDynamoRecords';

const mockDynamoClient = mockClient(DynamoDBDocumentClient);

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
    }).resolves({});
    await getDynamoMembers();
  });
});
