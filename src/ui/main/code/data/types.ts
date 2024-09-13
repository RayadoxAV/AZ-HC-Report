/* 
  Raymundo Paz
  September 2024
*/
export type Entry = {
  week: number,
  fiscalYear: number
}

export type ApplicationState = {
  comparator: {
    currentStep: number,
    filePath: string,
    lastUploadedEntry: Entry,
    entries: Entry[]
  },
  debug: {
    logging: true
  }
};
