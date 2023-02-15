import { Plates } from './Plates.model';

export interface Vehicle {
  vin: string;
  primaryVrm: string;
  systemNumber: string;
  trailerId?: string;
  techRecord: TechRecord[] | TechRecord;
}

export interface TechRecord {
  plates: Plates[];
  vehicleType: string;
  statusCode: StatusCode;
}

export enum VehicleType {
  Trailer = 'trl',
}

export enum StatusCode {
  ARCHIVED = 'archived',
  CURRENT = 'current',
  PROVISIONAL = 'provisional',
}
