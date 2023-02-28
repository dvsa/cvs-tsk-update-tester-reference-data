import { NewLetterRequest, NewPlateRequest } from '../models/Request.model';
import { Plates } from '../models/Plates.model';
import { getSerialNumber } from './serialNumber.service';
import { TechRecord, Vehicle } from '../models/Vehicle.model';
import { put } from './dynamodb.service';
import logger from '../observability/logger';
import { Letter } from '../models/Letter.model';

export const addNewPlate = async (request: NewPlateRequest): Promise<TechRecord[]> => {
  if (!request.reasonForCreation || !request.vtmUsername || !request.recipientEmailAddress || !request.techRecord) {
    throw new Error('Bad Request');
  }

  const techRecords = request.techRecord as TechRecord[];

  // find the current record then add the plate to it
  const currentTechRecordIndex = techRecords.findIndex((techRecord) => techRecord.statusCode === 'current');

  if (currentTechRecordIndex < 0) {
    throw new Error('No current record found');
  }

  const currentPlates = techRecords[currentTechRecordIndex].plates ?? [];

  const newPlate: Plates = {
    plateSerialNumber: await getSerialNumber(),
    plateIssueDate: new Date().toISOString(),
    plateReasonForIssue: request.reasonForCreation,
    plateIssuer: request.vtmUsername,
  };

  validatePlate(newPlate);

  currentPlates.push(newPlate);

  techRecords[currentTechRecordIndex].plates = currentPlates;

  return techRecords;
};

export const validatePlate = (plate: Plates): void => {
  if (!plate) {
    throw new Error('Missing all of the plate information');
  }

  if (!plate.plateSerialNumber) {
    throw new Error('Missing plate serial number');
  }

  if (!plate.plateIssueDate) {
    throw new Error('Missing plate issue date');
  }

  if (!plate.plateReasonForIssue) {
    throw new Error('Missing plate reason for issue');
  }

  if (!plate.plateIssuer) {
    throw new Error('Missing plate issuer');
  }
};

export const addNewLetter = (request: NewLetterRequest): TechRecord[] => {
  if (!request.vtmUsername || !request.recipientEmailAddress || !request.techRecord) {
    throw new Error('Bad Request');
  }

  const techRecords = request.techRecord as TechRecord[];

  // find the current record then add the letter to it
  const currentTechRecordIndex = techRecords.findIndex((techRecord) => techRecord.statusCode === 'current');

  if (currentTechRecordIndex < 0) {
    throw new Error('No current record found');
  }

  const newLetter: Letter = {
    letterType: request.letterType,
    paragraphId: request.paragraphId,
    letterIssuer: request.vtmUsername,
    letterDateRequested: new Date().toISOString(),
  };

  validateLetter(newLetter);

  techRecords[currentTechRecordIndex].letterOfAuth = newLetter;

  return techRecords;
};

export const validateLetter = (letter: Letter): void => {
  if (!letter) {
    throw new Error('Missing all of the letter information');
  }

  if (!letter.letterType) {
    throw new Error('Missing letter type');
  }

  if (!letter.paragraphId) {
    throw new Error('Missing letter paragraph ID');
  }

  if (!letter.letterIssuer) {
    throw new Error('Missing letter issuer');
  }

  if (!letter.letterDateRequested) {
    throw new Error('Missing letter date issue');
  }
};

export const updateTechRecord = (vehicle: Vehicle): Promise<void> => {
  logger.debug('techRecord.service: updating tech record in DynamoDB started');
  return put(vehicle);
};
