const { ipcMain } = require('electron');

const windowEventsManager = require('./windowEventsManager');
const { fileManager } = require('./fileEventsManager');
const { dataManager } = require('./dataEventsManager');

ipcMain.on('window-events', windowEventsManager);
ipcMain.on('data-events', dataManager.manageDataEvents);
ipcMain.on('file-events', fileManager.manageFileEvents);
