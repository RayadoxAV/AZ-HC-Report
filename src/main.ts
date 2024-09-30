/* 
  Raymundo Paz
  September 2024
*/

import { app, BrowserWindow, Menu, screen } from 'electron';
import path from 'path';

import 'dotenv/config';
import ServerLogger, { LogSeverity } from './util/serverLogger';
import DBManager from './data/database/dbManager';
import { manageEvents } from './ui/events/ipcEvents';

function preinit(): void {
  DBManager.initializeDatabase();
}

preinit();

Menu.setApplicationMenu(null);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  ServerLogger.log('Creating window', LogSeverity.INFO);

  const primaryDisplay = screen.getPrimaryDisplay();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300, // TODO: Remove this
    height: 700,
    minWidth: 800,
    minHeight: 600,
    title: 'Headcount Report',
    frame: false,
    x: 3840, // TODO: Remove this
    y: 0, // TODO: Remove this
    // x: primaryDisplay.bounds.x, // NOTE: Uncomment this
    // y: primaryDisplay.bounds.y,// NOTE: Uncomment this
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    ServerLogger.log('Dev environment. Loading URL', LogSeverity.INFO);
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    ServerLogger.log('Prod environment. Loading HTML File', LogSeverity.INFO);
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  mainWindow.maximize();
  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: 'right' });

  // TODO: Remove this!
  {
    mainWindow.webContents.on('devtools-opened', () => {
      const css = `
      :root {
          --sys-color-base: var(--ref-palette-neutral100);
          --source-code-font-family: consolas;
          --source-code-font-size: 12px;
          --monospace-font-family: consolas;
          --monospace-font-size: 12px;
          --default-font-family: system-ui, sans-serif;
          --default-font-size: 12px;
      }
      .-theme-with-dark-background {
          --sys-color-base: var(--ref-palette-secondary25);
      }
      body {
          --default-font-family: system-ui,sans-serif;
      }`;
      mainWindow.webContents.devToolsWebContents.executeJavaScript(`
      const overriddenStyle = document.createElement('style');
      overriddenStyle.innerHTML = '${css.replaceAll('\n', ' ')}';
      document.body.append(overriddenStyle);
      document.body.classList.remove('platform-windows');`);
    });
  }

};

app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

manageEvents();
