import { PlateReasonForIssue } from './Plates.model';
import { Vehicle } from './Vehicle.model';

export interface NewPlateRequest extends Vehicle {
  reasonForCreation: PlateReasonForIssue;
  vtmUsername: string;
}
