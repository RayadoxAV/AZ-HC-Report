const { BrowserWindow } = require('electron');

const util = require("../util/util");
const { FileManager } = require("./fileEventsManager");

class DataManager {
  async manageDataEvents(_, args) {
    switch (args.name) {
      case 'file-extract-information': {
        this.extractDataFromFile(args.path);
        break;
      }
    }
  }


  async extractDataFromFile(filePath) {
    const resultWorkbook = await FileManager.readFileFromPath(filePath);

    if (resultWorkbook) {
      try {
        const sheet = resultWorkbook.worksheets[0];
        if (sheet) {
          const week = Number.parseInt(filePath.split('W')[1].split('-')[0]);
          //   // const range = sheet['!ref']; // The complete range of the sheet.

          const lastRowIndex = this.getLastRowIndex(sheet);
          const zoners = this.generateZoners(sheet, lastRowIndex);

          await FileManager.createDBIfNotExists();

          // let currentWeek = util.dateToWeek(new Date());

          const entryToUpload = {
            week: week,
            zoners: zoners
          };

          let pastEntry = await FileManager.getMostRecentEntry();


          const dataResponse = {
            entryToUpload,
            pastEntry,
            isFirstReport: false
          };

          if (!pastEntry) {
            // Not a single entry
            dataResponse.isFirstReport = true;
          }


          // console.log(dataResponse);

          BrowserWindow.getAllWindows()[0].webContents.send('data-events', { name: 'entry-data-provided', data: JSON.stringify(dataResponse) });
        }
      } catch (error) {
        console.log(error);
        BrowserWindow.getAllWindows()[0].webContents.send('error-events', { name: 'data-extraction', message: 'Error reading the file. Make sure is a valid HC file with the appropiate name' });
      }
    }
  }

  getLastRowIndex(sheet) {

    let lastRow = 1;
    sheet.eachRow((_, rowNumber) => {
      lastRow = rowNumber;
    });

    return lastRow;
  }

  generateZoners(sheet, lastRowIndex) {
    const zoners = [];

    for (let i = 1; i < lastRowIndex; i++) {
      const row = sheet['_rows'][i];
      if (row['_cells'][0].value) {
        const zoner = {
          employeeId: row['_cells'][0].value,
          ignitionId: row['_cells'][1].value,
          cc: row['_cells'][2].value,
          name: row['_cells'][3].value,
          hireDate: row['_cells'][4].value,
          jobCode: row['_cells'][5].value,
          position: row['_cells'][6].value,
          grade: row['_cells'][7].value,
          supervisorId: row['_cells'][8].value,
          supervisorName: row['_cells'][9].value,
          manager: util.supervisorMap[row['_cells'][8].value]
        };

        zoners.push(zoner);
      }

    }
    return zoners;
  }

}

const dataManager = new DataManager();
dataManager.manageDataEvents = dataManager.manageDataEvents.bind(dataManager);

module.exports = {
  dataManager
};
