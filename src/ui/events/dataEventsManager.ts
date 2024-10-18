/* 
  Raymundo Paz
  September 2024
*/

import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'fs';
import { promisify } from 'util';
const writeFile = promisify(fs.writeFile);

import ServerLogger, { LogSeverity } from '../../util/serverLogger';
import TransformedEntry from '../../data/models/entry';
import { fillManagers, getCurrentFiscalYear, getDateForCell } from '../../util/util';
import { AutoZoner } from '../../data/models/autozoner';
import DBManager from '../../data/database/dbManager';
import { BrowserWindow, shell } from 'electron';


export async function manageDataEvents(_: any, ...args: any[]): Promise<void> {
  const { event, args: eventArgs } = args[0];
  const window = BrowserWindow.getAllWindows()[0];

  switch (event) {
    case 'extract-file-information': {
      if (eventArgs.type === 0) {

        const entry: TransformedEntry = await extractDataFromFile(eventArgs.data);
        if (!entry) {
          ServerLogger.log('Could not extract information for file', LogSeverity.ERROR);
          // TODO: Send error to UI 
          return;
        }

        // Check if this is the first entry. If it is, add it to the database and send the event to the UI.
        // If it is not, send the entry data to the UI.

        if (DBManager.instance.getAll(0).length === 0) {
          window.webContents.send('data-events', { name: 'first-entry-created', value: entry });
        } else {
          window.webContents.send('data-events', { name: 'entry-created', value: entry });
        }

      } else if (eventArgs.type === 1) {
        readJSONFromPath(eventArgs.data);
      }
      break;
    }

    case 'request-entry': {

      const entryNumber: number = eventArgs.entryNumber;
      const param: string = eventArgs.param;

      if (param === 'last') {
        const requestedEntry = DBManager.instance.getLastTransformedEntry();

        window.webContents.send('data-events', { name: 'entry-provided', value: { entryNumber, entry: requestedEntry } });
      }

      break;
    }

    case 'save-entry': {
      const entry: TransformedEntry = eventArgs.data.entry;
      const isFirstEntry: boolean = eventArgs.data.isFirstEntry;
      DBManager.instance.insertEntry(entry);
      window.webContents.send('data-events', { name: 'entry-saved', value: { isFirstEntry } });
      break;
    }

    case 'write-email-file': {
      await writeFile('C:\\az-hc-report\\hc-report.eml', eventArgs.data, { encoding: 'utf-8' });
      shell.openPath('C:\\az-hc-report\\hc-report.eml');
      shell.openExternal('https://autozone1com.sharepoint.com/:x:/r/sites/Merch-Leadership/_layouts/15/Doc.aspx?sourcedoc=%7B823894B3-BFC9-4F58-8DFE-A4B9562E871C%7D&file=CC%20and%20Anniversaries%20-%20Merch%20(New%20HC%20Structure).xlsx&wdOrigin=TEAMS-MAGLEV.p2p_ns.rwc&action=default&mobileredirect=true');
      window.webContents.send('data-events', { name: 'reset-comparator' });
      break;
    }

    case 'get-all-entries': {
      const entries = DBManager.instance.getAlTransformedEntries();
      window.webContents.send('data-events', { name: 'provide-entries-list', value: { list: entries } });
      break;
    }

    case 'delete-entry': {
      const { week, fiscalYear } = eventArgs.data;
      DBManager.instance.deleteEntryByWeekAndYear(week, fiscalYear);
      const entries = DBManager.instance.getAlTransformedEntries();
      window.webContents.send('data-events', { name: 'provide-entries-list', value: { list: entries } });
      break;
    }

    default: {
      ServerLogger.log(`Unmanaged event '${event}'`, LogSeverity.WARNING);
      break;
    }
  }

  async function extractDataFromFile(path: string) {
    const workbook = await readExcelFileFromPath(path);
    if (!workbook) {
      ServerLogger.log('Workbook is not defined', LogSeverity.ERROR);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sheet: any = workbook.worksheets[0];

      if (!sheet) {
        ServerLogger.log('Worksheet is not defined. Workbook is empty', LogSeverity.ERROR);
        return;
      }

      const weekCell = sheet['_rows'][0]['_cells'][3].value;
      const week = Number.parseInt(weekCell.split('W')[1]);

      const entry: TransformedEntry = new TransformedEntry(week, getCurrentFiscalYear(), generateZoners(sheet));

      return entry;

    } catch (error) {
      console.log(error);
    }
  }

  async function readExcelFileFromPath(path: string) {
    const workbook = new Workbook();
    if (!fs.existsSync(path)) {
      // TODO: Send error to UI
      ServerLogger.log(`Could not find path '${path}'. File does not exist.`, LogSeverity.ERROR);
      return;
    }

    try {
      await workbook.xlsx.readFile(path);
      return workbook;
    } catch (error) {
      // TODO: Send error to UI
      ServerLogger.log(`Could not read file '${path}', ${error.message}`, LogSeverity.ERROR);
    }
  }

  function generateZoners(sheet: any): AutoZoner[] {

    const zoners: AutoZoner[] = [];

    const lastRowIndex = (sheet as Worksheet).actualRowCount;

    for (let i = 3; i < lastRowIndex; i++) {
      const row = sheet['_rows'][i];

      const zoner: AutoZoner = {
        id: undefined,
        ignitionId: `${row['_cells'][0].value}`,
        cc: `${row['_cells'][1].value}`,
        name: row['_cells'][3].value,
        hireDate: getDateForCell(row['_cells'][4].value),
        jobCode: row['_cells'][5].value,
        position: row['_cells'][6].value,
        grade: Number.parseInt(row['_cells'][7].value),
        supervisorId: `${row['_cells'][8].value}`,
        supervisorName: row['_cells'][10].value,
        manager: ''
      };

      zoners.push(zoner);
    }

    fillManagers(zoners);

    return zoners;
  }


  function readJSONFromPath(path: string) {
    console.log('Plain text', path);
  }
}
