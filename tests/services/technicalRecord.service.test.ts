import { PlateReasonForIssue, Plates } from '../../src/models/Plates.model';
import { addNewPlate, updateTechRecord, validate } from '../../src/services/technicalRecord.service';
import { getSerialNumber } from '../../src/services/serialNumber.service';
import * as dynamodbService from '../../src/services/dynamodb.service';
import { StatusCode, TechRecord, Vehicle } from '../../src/models/Vehicle.model';

jest.mock('../../src/services/serialNumber.service');

describe('add plate tests', () => {
  beforeAll(() => {
    (getSerialNumber as jest.Mock).mockResolvedValue('12345');
  });

  it('should add a new plate when passed with existing plates', async () => {
    expect.assertions(2);

    const plate = {
      plateSerialNumber: '12345',
      plateIssueDate: new Date().toISOString(),
      plateReasonForIssue: PlateReasonForIssue.FREE_REPLACEMENT,
      plateIssuer: 'Issuer Name',
    };
    const technicalRecord = { plates: [] as Plates[], vehicleType: 'hgv', statusCode: StatusCode.CURRENT };
    technicalRecord.plates.push(plate);

    const request = {
      primaryVrm: '',
      vin: '12345',
      systemNumber: '123456',
      techRecord: [technicalRecord] as TechRecord[],
      vtmUsername: 'Username',
      reasonForCreation: PlateReasonForIssue.DESTROYED,
    };

    const newTechRecord = await addNewPlate(request);
    expect(newTechRecord[0].plates).toHaveLength(2);
    expect(newTechRecord[0].plates[1].plateIssuer).toBe('Username');
  });

  it('should add a new plate when passed an empty array', async () => {
    expect.assertions(2);

    const technicalRecord = { plates: [] as Plates[], vehicleType: 'hgv', statusCode: StatusCode.CURRENT };

    const request = {
      primaryVrm: '',
      vin: '12345',
      systemNumber: '123456',
      techRecord: [technicalRecord] as TechRecord[],
      vtmUsername: 'Username',
      reasonForCreation: PlateReasonForIssue.DESTROYED,
    };

    const newTechRecord = await addNewPlate(request);
    expect(newTechRecord[0].plates).toHaveLength(1);
    expect(newTechRecord[0].plates[0].plateIssuer).toBe('Username');
  });

  it('should error when not given user name', async () => {
    expect.assertions(1);
    const technicalRecord = { plates: [] as Plates[], vehicleType: 'hgv' };

    const request = {
      primaryVrm: '',
      vin: '12345',
      systemNumber: '123456',
      techRecord: [technicalRecord] as TechRecord[],
      vtmUsername: null,
      reasonForCreation: PlateReasonForIssue.DESTROYED,
    };

    try {
      await addNewPlate(request);
    } catch (err: any) {
      expect(err.message).toBe('Bad Request');
    }
  });

  it('should error when not given reason for creation', async () => {
    expect.assertions(1);
    const technicalRecord = { plates: [] as Plates[], vehicleType: 'hgv', statusCode: StatusCode.CURRENT };

    const request = {
      primaryVrm: '',
      vin: '12345',
      systemNumber: '123456',
      techRecord: [technicalRecord] as TechRecord[],
      vtmUsername: 'Username',
      reasonForCreation: null,
    };

    try {
      await addNewPlate(request);
    } catch (err: any) {
      expect(err.message).toBe('Bad Request');
    }
  });

  it('should error when not given tech record', async () => {
    expect.assertions(1);

    const request = {
      primaryVrm: '',
      vin: '12345',
      systemNumber: '123456',
      techRecord: null,
      vtmUsername: 'Username',
      reasonForCreation: PlateReasonForIssue.DESTROYED,
    };

    try {
      await addNewPlate(request);
    } catch (err: any) {
      expect(err.message).toBe('Bad Request');
    }
  });
});

describe('validate new plate tests', () => {
  const plate = {
    plateSerialNumber: '12345',
    plateIssueDate: new Date().toISOString(),
    plateReasonForIssue: PlateReasonForIssue.FREE_REPLACEMENT,
    plateIssuer: 'Issuer Name',
  };

  it('should error when not given plate', () => {
    try {
      validate(null as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing all of the plate information');
    }
  });

  it('should error when not given plate serial number', () => {
    try {
      validate({ ...plate, plateSerialNumber: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate serial number');
    }
  });

  it('should error when not given plate issue date', () => {
    try {
      validate({ ...plate, plateIssueDate: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate issue date');
    }
  });

  it('should error when not given plate reason for issue', () => {
    try {
      validate({ ...plate, plateReasonForIssue: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate reason for issue');
    }
  });

  it('should error when not given plate issuer', () => {
    try {
      validate({ ...plate, plateIssuer: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate issuer');
    }
  });
});

describe('update tech record tests', () => {
  const putSpy = jest.spyOn(dynamodbService, 'put');

  beforeAll(() => {
    (dynamodbService.put as jest.Mock).mockResolvedValue(null);
  });

  it('should update tech record', async () => {
    expect.assertions(1);

    const vehicle: Vehicle = {
      vin: '12345',
      systemNumber: '123456',
      primaryVrm: '',
      techRecord: undefined,
    };

    await updateTechRecord(vehicle);
    expect(putSpy).toHaveBeenCalled();
  });
});
