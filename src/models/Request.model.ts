import { LetterType, ParagraphId } from './Letter.model';
import { PlateReasonForIssue } from './Plates.model';
import { Vehicle } from './Vehicle.model';

export interface NewPlateRequest extends Vehicle {
  reasonForCreation: PlateReasonForIssue;
  vtmUsername: string;
}
export interface NewLetterRequest extends Vehicle {
  vtmUsername: string;
  letterType: LetterType;
  paragraphId: ParagraphId;
}
