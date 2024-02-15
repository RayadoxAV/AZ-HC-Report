const { BrowserWindow, dialog, shell } = require('electron');
const { Workbook } = require('exceljs');
const fs = require('fs');
const { promisify } = require('util');
const util = require('../util/util');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

class FileManager {

  static dbPath = 'C:\\az-hc-report\\historic.json';
  static dbFolder = 'C:\\az-hc-report';

  static dbTemplate = {
    meta: {
      version: 1
    },
    entries: [
      /* Entry template
        {
          week: 0,
          zoners: []
        }
      */
    ]
  }

  async manageFileEvents(_, args) {
    switch (args.name) {
      case 'file-open': {
        this.openFileDialog(args.window);
        break;
      }

      case 'add-entry': {
        // TODO: RESTORE THIS
        await FileManager.addEntryToDb(args.data.entry);
        BrowserWindow.getAllWindows()[0].webContents.send('data-events', { name: 'entry-uploaded', data: { isFirst: args.data.isFirst, changes: args.data.changes, currentWeek: args.data.currentWeek, pastWeek: args.data.pastWeek } });

        break;
      }

      case 'file-write': {
        await FileManager.writeFileContents(args.data.contents, args.data.fileName);
        BrowserWindow.getAllWindows()[0].webContents.send('file-events', { name: 'file-message', message: 'Report email generated successfully' });
        shell.openPath(`${FileManager.dbFolder}\\${args.data.fileName}`);
        // shell.openExternal('https://autozone1com.sharepoint.com/:x:/r/sites/Merch-Leadership/SharedDocuments/Unix - CC - Anniversaries - Hibrido/CC and Anniversaries - Merch.xlsx')
        shell.openExternal('https://autozone1com.sharepoint.com/:x:/r/sites/Merch-Leadership/_layouts/15/Doc.aspx?sourcedoc=%7BEA5492BD-7739-47EE-942C-4E878B2FFFA3%7D&file=CC%20and%20Anniversaries%20-%20Merch.xlsx&wdLOR=c750BDEB2-7C3F-45DD-828B-F7D91382FEC1&fromShare=true&action=default&mobileredirect=true');
        break;
      }
      
      default: {
        break;
      }
    }
  }

  openFileDialog(windowTitle) {
    const windows = BrowserWindow.getAllWindows();

    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];

      if (window.title === windowTitle) {
        dialog.showOpenDialog(window, { properties: ['openFile'] }).then((value) => {
          if (!value.canceled) {
            // window.webContents.send('file-e')
            window.webContents.send('file-events', { name: 'file-path-provided', value: value.filePaths[0] });
          }
        }).catch((error) => {
          console.log(error);
        });
        break;
      }
    }
  }

  static async readFileFromPath(path) {
    const workbook = new Workbook();

    if (!fs.existsSync(path)) {
      return;
    }

    try {
      await workbook.xlsx.readFile(path);
      return workbook;

    } catch (error) {
      console.log(error);
      return;
    }
  }

  static async createDBIfNotExists() {
    let created = false;

    try {
      if (!fs.existsSync(FileManager.dbFolder)) {
        await mkdir(FileManager.dbFolder);
        created = true;
      }

      if (created) {
        await writeFile(FileManager.dbPath, JSON.stringify(FileManager.dbTemplate),{ encoding: 'utf-8' });
      } else {
        if (!fs.existsSync(FileManager.dbPath)) {
          await writeFile(FileManager.dbPath, JSON.stringify(FileManager.dbTemplate), { encoding: 'utf-8' });
        }
      }

    } catch (error) {
      console.log(error);
      return false;
    }

    return created;
  } 

  /**
   * Returns an entry based on its week
   * @param {number} week The week to search from
   */
  static async searchInDB(week) {
    let entryResult = undefined;

    try {
      const dbString = await readFile(FileManager.dbPath, { encoding: 'utf-8' });
      const db = JSON.parse(dbString);
      
      for (let i = 0; i < db.entries.length; i++) {
        const entry = db.entries[i];
        if (entry.week === week) {
          entryResult = entry;
          break;
        }
      }
    } catch (error) {
      // TODO: Send error to the client
      console.log(error);
    }

    return entryResult;
  }

  static async getMostRecentEntry() {
    
    try {
      const dbString = await readFile(FileManager.dbPath, { encoding: 'utf-8' });
      const db = JSON.parse(dbString);

      let biggestEntry = undefined;
      let biggestWeek = -1;

      for (let i = 0; i < db.entries.length; i++) {
        const entry = db.entries[i];

        if (entry.week > biggestWeek) {
          biggestWeek = entry.week;
          biggestEntry = entry;
        }
      }

      return biggestEntry;
    } catch (error) {
      // TODO: Send error to the client
      console.log(error);
    }
  }

  static async addEntryToDb(entry) {
    let added = false;
    try {
      const dbString = await readFile(FileManager.dbPath, { encoding: 'utf-8' });
      const db = JSON.parse(dbString);

      db.entries.push(entry);

      await writeFile(FileManager.dbPath, JSON.stringify(db), { encoding: 'utf-8' });
      added = true;
    } catch (error) {
      console.log(error);
      added = false; 
    }

    return added;
  }

  static async writeFileContents(contents, name) {
    await writeFile(`${this.dbFolder}\\${name}`, contents, { encoding: 'utf-8' });
  }
}

const fileManager = new FileManager();
fileManager.manageFileEvents = fileManager.manageFileEvents.bind(fileManager);

module.exports = {
  fileManager,
  FileManager
};
