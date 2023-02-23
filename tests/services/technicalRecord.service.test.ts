import { PlateReasonForIssue, Plates } from '../../src/models/Plates.model';
import {
  addNewLetter,
  addNewPlate,
  updateTechRecord,
  validateLetter,
  validatePlate,
} from '../../src/services/technicalRecord.service';
import { getSerialNumber } from '../../src/services/serialNumber.service';
import * as dynamodbService from '../../src/services/dynamodb.service';
import { StatusCode, TechRecord, Vehicle } from '../../src/models/Vehicle.model';
import { Letter, LetterType, ParagraphId } from '../../src/models/Letter.model';
import { NewLetterRequest } from '../../src/models/Request.model';

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

describe('add letter tests', () => {
  beforeAll(() => {
    (getSerialNumber as jest.Mock).mockResolvedValue('12345');
  });

  it('should add a new letter', () => {
    expect.assertions(2);

    const technicalRecord = { vehicleType: 'hgv', statusCode: StatusCode.CURRENT };

    const request: NewLetterRequest = {
      primaryVrm: '',
      vin: '12345',
      systemNumber: '123456',
      techRecord: [technicalRecord] as TechRecord[],
      vtmUsername: 'Username',
      letterType: LetterType.TRL_ACCEPTANCE,
      paragraphId: ParagraphId.PARAGRAPH_3,
    };

    const newTechRecord = addNewLetter(request);
    expect(newTechRecord[0].letterOfAuth).toBeDefined();
    expect(newTechRecord[0].letterOfAuth.paragraphId).toBe(ParagraphId.PARAGRAPH_3);
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
      validatePlate(null as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing all of the plate information');
    }
  });

  it('should error when not given plate serial number', () => {
    try {
      validatePlate({ ...plate, plateSerialNumber: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate serial number');
    }
  });

  it('should error when not given plate issue date', () => {
    try {
      validatePlate({ ...plate, plateIssueDate: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate issue date');
    }
  });

  it('should error when not given plate reason for issue', () => {
    try {
      validatePlate({ ...plate, plateReasonForIssue: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate reason for issue');
    }
  });

  it('should error when not given plate issuer', () => {
    try {
      validatePlate({ ...plate, plateIssuer: null } as Plates);
    } catch (err: any) {
      expect(err.message).toBe('Missing plate issuer');
    }
  });
});

describe('validate new letter tests', () => {
  const letter = {
    letterType: LetterType.TRL_ACCEPTANCE,
    paragraphId: ParagraphId.PARAGRAPH_3,
    letterIssuer: 'user',
    letterDateRequested: new Date().toISOString(),
  };

  it('should error when not given letter', () => {
    try {
      validateLetter(null as Letter);
    } catch (err: any) {
      expect(err.message).toBe('Missing all of the letter information');
    }
  });

  it('should error when not given letter type', () => {
    try {
      validateLetter({ ...letter, letterType: null } as Letter);
    } catch (err: any) {
      expect(err.message).toBe('Missing letter type');
    }
  });

  it('should error when not given letter paragraph ID', () => {
    try {
      validateLetter({ ...letter, paragraphId: null } as Letter);
    } catch (err: any) {
      expect(err.message).toBe('Missing letter paragraph ID');
    }
  });

  it('should error when not given letter issuer', () => {
    try {
      validateLetter({ ...letter, letterIssuer: null } as Letter);
    } catch (err: any) {
      expect(err.message).toBe('Missing letter issuer');
    }
  });

  it('should error when not given letter issue date', () => {
    try {
      validateLetter({ ...letter, letterDateRequested: null } as Letter);
    } catch (err: any) {
      expect(err.message).toBe('Missing letter date issue');
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
