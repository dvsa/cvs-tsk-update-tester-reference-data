import { LetterType, ParagraphId } from './Letter.model';
import { PlateReasonForIssue } from './Plates.model';
import { Vehicle } from './Vehicle.model';

export interface RequestBase {
  vtmUsername: string;
  recipientEmailAddress: string;
}

export interface NewPlateRequest extends RequestBase, Vehicle {
  reasonForCreation: PlateReasonForIssue;
}
export interface NewLetterRequest extends RequestBase, Vehicle {
  letterType: LetterType;
  paragraphId: ParagraphId;
}
