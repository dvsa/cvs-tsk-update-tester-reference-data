import { LetterType, ParagraphId } from '../../src/models/Letter.model';
import { PlateReasonForIssue } from '../../src/models/Plates.model';
import { NewLetterRequest, NewPlateRequest } from '../../src/models/Request.model';
import { DocumentName } from '../../src/models/SqsPayloadRequest.model';
import { StatusCode, TechRecord } from '../../src/models/Vehicle.model';
import { formatLetterPayload, formatPlatePayload } from '../../src/services/sqs.service';

describe('test sqs service', () => {
  describe('test plate payload format', () => {
    const techRecord: TechRecord = {
      plates: [
        {
          plateSerialNumber: '12344321',
          plateIssueDate: new Date().toISOString(),
          plateReasonForIssue: PlateReasonForIssue.DESTROYED,
          plateIssuer: 'User',
        },
        {
          plateSerialNumber: '1234',
          plateIssueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
          plateReasonForIssue: PlateReasonForIssue.DESTROYED,
          plateIssuer: 'User',
        },
      ],
      vehicleType: 'hgv',
      statusCode: StatusCode.CURRENT,
    };

    const request: NewPlateRequest = {
      vin: '1234',
      primaryVrm: 'vrm1',
      systemNumber: '1234',
      reasonForCreation: PlateReasonForIssue.DESTROYED,
      vtmUsername: 'User',
      techRecord: [techRecord] as TechRecord[],
    };
    it('should let me format message without a trailerID', () => {
      const res = formatPlatePayload(techRecord, request);

      const vehicle = {
        vin: '1234',
        primaryVrm: 'vrm1',
        systemNumber: '1234',
        techRecord,
      };

      const plate = {
        plateSerialNumber: '12344321',
        plateIssueDate: techRecord.plates[0].plateIssueDate,
        plateReasonForIssue: PlateReasonForIssue.DESTROYED,
        plateIssuer: 'User',
      };

      const expectedRes = {
        vehicle,
        plate,
        documentName: DocumentName.MINISTRY,
      };
      expect(res).toEqual(expectedRes);
    });

    it('should let me format message with a trailerID and send correct documentName', () => {
      request.trailerId = '12345';
      request.techRecord[0].vehicleType = 'trl';
      const res = formatPlatePayload(techRecord, request);

      const vehicle = {
        vin: '1234',
        primaryVrm: 'vrm1',
        systemNumber: '1234',
        trailerId: '12345',
        techRecord: { ...techRecord, vehicleType: 'trl' },
      };

      const plate = {
        plateSerialNumber: '12344321',
        plateIssueDate: techRecord.plates[0].plateIssueDate,
        plateReasonForIssue: PlateReasonForIssue.DESTROYED,
        plateIssuer: 'User',
      };

      const expectedRes = {
        vehicle,
        plate,
        documentName: DocumentName.MINISTRY_TRL,
      };
      expect(res).toEqual(expectedRes);
    });
  });
  describe('test letter payload format', () => {
    const techRecord: TechRecord = {
      letterOfAuth: {
        letterType: LetterType.TRL_ACCEPTANCE,
        paragraphId: ParagraphId.PARAGRAPH_3,
        letterIssuer: 'user',
        letterDateRequested: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      },
      vehicleType: 'hgv',
      statusCode: StatusCode.CURRENT,
    };

    const request: NewLetterRequest = {
      vin: '1234',
      primaryVrm: 'vrm1',
      systemNumber: '1234',
      vtmUsername: 'User',
      techRecord: [techRecord] as TechRecord[],
      letterType: LetterType.TRL_ACCEPTANCE,
      paragraphId: ParagraphId.PARAGRAPH_3,
    };
    it('should let me format message without a trailerID', () => {
      const res = formatLetterPayload(techRecord, request);

      const vehicle = {
        vin: '1234',
        primaryVrm: 'vrm1',
        systemNumber: '1234',
        techRecord,
      };

      const letter = {
        letterType: LetterType.TRL_ACCEPTANCE,
        paragraphId: ParagraphId.PARAGRAPH_3,
        letterIssuer: 'user',
        letterDateRequested: techRecord.letterOfAuth.letterDateRequested,
      };

      const expectedRes = {
        vehicle,
        letter,
        documentName: DocumentName.TRL_INTO_SERVICE,
      };
      expect(res).toEqual(expectedRes);
    });
  });
});
