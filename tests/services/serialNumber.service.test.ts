import { Lambda } from 'aws-sdk';
import { getSerialNumber } from '../../src/services/serialNumber.service';

jest.mock('aws-sdk', () => {
  const mLambda = { invoke: jest.fn() };
  return { Lambda: jest.fn(() => mLambda) };
});

describe('serialNumberService tests', () => {
  beforeAll(() => {
    const mLambda = new Lambda();
    const mBody = JSON.stringify({
      plateSerialNumber: '12345',
    });
    const mRes = {
      Payload: JSON.stringify({
        statusCode: 200,
        body: mBody,
      }),
    };
    (mLambda.invoke as jest.Mocked<any>).mockImplementation(() => ({ promise: jest.fn().mockResolvedValue(mRes) }));
  });

  it('should call the generate plate number lambda', async () => {
    expect.assertions(1);

    const serialNumber = await getSerialNumber();
    expect(serialNumber).toBe('12345');
  });
});
