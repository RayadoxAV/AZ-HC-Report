/* 
  Raymundo Paz
  September 2024
*/



export type Entry = {
  week: number,
  fiscalYear: number,
  zoners: AutoZoner[];
}

export type AutoZoner = {
  id: number;
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
}

export type ApplicationState = {
  comparator: {
    currentStep: number,
    filePath: string,
    lastUploadedEntry: Entry,
    isFirstEntry: boolean,
    entries: Entry[]
  },
  debug: {
    logging: true
  }
};
