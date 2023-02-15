export interface Config {
  GENERATE_PLATE_SERIAL_NUMBER_FUNCTION_NAME: string; // generatePlateSerialNumber
  GENERATE_PLATE_SERIAL_NUMBER_PATH: string; // /plateSerialNo,
  TECHNICAL_RECORDS_TABLE: string;
  TECHNICAL_RECORDS_SYSTEM_NUMBER_INDEX: string; // SysNumIndex
  DOC_GEN_SQS_QUEUE: string;
}

export const getConfig = (): Config => {
  [
    'GENERATE_PLATE_SERIAL_NUMBER_FUNCTION_NAME',
    'GENERATE_PLATE_SERIAL_NUMBER_PATH',
    'TECHNICAL_RECORDS_TABLE',
    'TECHNICAL_RECORDS_SYSTEM_NUMBER_INDEX',
    'DOC_GEN_SQS_QUEUE',
  ].forEach((envVar) => {
    if (!process.env[`${envVar}`]) {
      throw new Error(`Environment variable ${envVar} seems to be missing.`);
    }
  });
  return {
    GENERATE_PLATE_SERIAL_NUMBER_FUNCTION_NAME: process.env.GENERATE_PLATE_SERIAL_NUMBER_FUNCTION_NAME,
    GENERATE_PLATE_SERIAL_NUMBER_PATH: process.env.GENERATE_PLATE_SERIAL_NUMBER_PATH,
    TECHNICAL_RECORDS_TABLE: process.env.TECHNICAL_RECORDS_TABLE,
    TECHNICAL_RECORDS_SYSTEM_NUMBER_INDEX: process.env.TECHNICAL_RECORDS_SYSTEM_NUMBER_INDEX,
    DOC_GEN_SQS_QUEUE: process.env.DOC_GEN_SQS_QUEUE,
  };
};

export default {
  logger: {
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};
