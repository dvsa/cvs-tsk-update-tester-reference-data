import { DynamoDBDocument, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import 'source-map-support/register';
import IMemberDetails from './aad/IMemberDetails';
import { getMemberDetails } from './aad/getMemberDetails';
import config from './config';
import IDynamoRecord, { ResourceType } from './dynamo/IDynamoRecord';
import { getDynamoMembers } from './dynamo/getDynamoRecords';
import logger from './observability/logger';

const { NODE_ENV, SERVICE, AWS_PROVIDER_REGION, AWS_PROVIDER_STAGE } = process.env;

logger.info(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_PROVIDER_STAGE}'\n region: '${AWS_PROVIDER_REGION}'\n\n`,
);

const client = DynamoDBDocument.from(new DynamoDB());

const handler = async (): Promise<void> => {
  logger.info('Function triggered, getting member details...');
  const azureList = await getMemberDetails();

  logger.info(`Found ${azureList.length} active members, getting dynamo records...`);
  const dynamoList = await getDynamoMembers();

  logger.info(`Found ${dynamoList.length} existing dynamo records, generating and executing...`);
  const stmts = await Promise.allSettled(
    generateStatements(azureList, dynamoList).map((stmt) => client.put(stmt)),
  );

  stmts.filter((r) => r.status === 'rejected').map((r) => logger.error((<PromiseRejectedResult>r).reason));

  logger.info('Done');
};

function generateStatements(
  azureMembers: IMemberDetails[],
  dynamoRecords: IDynamoRecord[],
): PutCommandInput[] {
  const memberMap = azureMembers.map(
    (am) =>
      <PutCommandInput>{
        TableName: config.aws.dynamoTable,
        Item: <IDynamoRecord>{
          resourceType: ResourceType.User,
          resourceKey: am.id,
          name: am.displayName,
          email: am.mail || am.userPrincipalName,
        },
      },
  );

  // for our existing records, we want to set a TTL of 1 week
  //  if the user is not in the active list
  const SECONDS_IN_AN_HOUR = 60 * 60;
  const HOURS_IN_A_DAY = 24;
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  const expirationTime = secondsSinceEpoch + HOURS_IN_A_DAY * SECONDS_IN_AN_HOUR - SECONDS_IN_AN_HOUR;

  const drMap = dynamoRecords
    .filter((dr) => !azureMembers.some((am) => am.id === dr.resourceKey))
    .map(
      (dr) =>
        <PutCommandInput>{
          TableName: config.aws.dynamoTable,
          Item: <IDynamoRecord>{
            resourceType: dr.resourceType,
            resourceKey: dr.resourceKey,
            name: dr.name,
            email: dr.email,
            ttl: expirationTime,
          },
        },
    );

  return memberMap.concat(drMap);
}

export { handler };
