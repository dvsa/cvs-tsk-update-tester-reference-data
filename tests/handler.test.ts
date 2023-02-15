import { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../src/handler';
import { PlateReasonForIssue } from '../src/models/Plates.model';
import { StatusCode } from '../src/models/Vehicle.model';
import { addNewPlate } from '../src/services/technicalRecord.service';

const techRecords = [{
  plates: [
    {
      plateSerialNumber: '12345',
      plateIssueDate: new Date(),
      plateReasonForIssue: PlateReasonForIssue.DESTROYED,
      plateIssuer: 'user',
    },
  ],
  vehicleType: 'hgv',
  statusCode: StatusCode.CURRENT,
}];

const body = {
  vin: '12345',
  vrms: ['12345'],
  systemNumber: '12345',
  techRecord: techRecords,
};

const goodEvent: APIGatewayEvent = {
  body: JSON.stringify(body),
  headers: { headers: 'headers' },
  multiValueHeaders: { mValHead: ['mValHeads'] },
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: 'path',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: null,
  resource: 'string',
};

const badEvent: APIGatewayEvent = {
  body: 'bad body',
  headers: { headers: 'headers' },
  multiValueHeaders: { mValHead: ['mValHeads'] },
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: 'path',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: null,
  resource: 'string',
};

jest.mock('../src/services/serialNumber.service');
jest.mock('../src/services/technicalRecord.service');
jest.mock('../src/services/sqs.service');
jest.mock('../src/services/dynamodb.service');

describe('handler tests', () => {
  beforeAll(() => {
    (addNewPlate as jest.Mock).mockResolvedValue(techRecords);
  });

  it('should allow me to call the handler successfully', async () => {
    expect.assertions(1);
    const res = await handler(goodEvent, null);
    expect(res.statusCode).toBe(200);
  });

  it('should allow me to call the handler with an error', async () => {
    expect.assertions(1);
    const res = await handler(badEvent, null);
    expect(res.statusCode).toBe(500);
  });
});
