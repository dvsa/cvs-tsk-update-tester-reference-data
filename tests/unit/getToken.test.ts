import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import { mocked } from 'ts-jest/utils';
import config from '../../src/config';
import { getToken } from '../../src/aad/getToken';
import { getSecret } from '../../src/utils/index';

jest.mock('../../src/utils/index');

describe('getToken', () => {
  mocked(getSecret).mockResolvedValue('SECRET');

  const RESULT: AuthenticationResult = {
    authority: '',
    uniqueId: '',
    tenantId: '',
    scopes: [''],
    account: null,
    idToken: '',
    idTokenClaims: {},
    accessToken: 'TOKEN',
    fromCache: false,
    expiresOn: null,
    tokenType: '',
    correlationId: '',
  };

  test('GIVEN a succesful response WHEN called THEN expected access token to be in response', async () => {
    config.aad.clientId = 'CLIENTID';
    config.aad.clientSecret = 'CLIENTSECRET';
    config.aad.authorityId = 'https://login.microsoftonline.com/xyz';

    ConfidentialClientApplication.prototype.acquireTokenByClientCredential = jest.fn().mockResolvedValue(RESULT);
    const result = await getToken();
    expect(result).toEqual(RESULT.accessToken);
  });

  test('GIVEN a failed request WHEN called THEN expect error to be thrown', async () => {
    config.aad.clientId = 'CLIENTID';
    config.aad.clientSecret = 'CLIENTSECRET';
    config.aad.authorityId = 'https://login.microsoftonline.com/xyz';

    const ERROR = new Error('Hello');

    ConfidentialClientApplication.prototype.acquireTokenByClientCredential = jest.fn().mockRejectedValue(ERROR);

    return expect(getToken).rejects.toThrow('Hello');
  });
});
