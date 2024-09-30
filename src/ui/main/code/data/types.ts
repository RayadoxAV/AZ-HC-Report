export type AutoZoner = {
  ignitionId: string;
  cc: string;
  name: string;
  hireDate: Date;
  jobCode: string;
  position: string;
  grade: number;
  supervisorId: string;
  supervisorName: string;
  manager: string;
  isOld?: boolean;
  isNew?: boolean;
  changes?: Map<string, { name: string, displayName: string, before: any, after: any }>;
}

export type Entry = {
  week: number;
  fiscalYear: number; 
  zoners: AutoZoner[];
}
