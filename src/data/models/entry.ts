import { AutoZoner } from './autozoner';

class TransformedEntry {
  public week: number;
  public fiscalYear: number;
  public zoners: AutoZoner[];

  constructor(week: number, fiscalYear: number, zoners: AutoZoner[]) {
    this.week = week;
    this.fiscalYear = fiscalYear;
    this.zoners = zoners;
  }
}

export class Entry {
  public id: number;
  public week: number;
  public fiscalYear: number;
  public zonerId: number;
}

export default TransformedEntry;