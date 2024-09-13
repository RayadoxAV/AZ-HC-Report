/* 
  Raymundo Paz
  September 2024
*/

import { BrowserWindow, app } from 'electron';
import path from 'path';

import ServerLogger, { LogSeverity } from '../../util/serverLogger';

export function manageWindowEvents(_: any, ...args: any[]): void {
  const { window: windowName, event } = args[0];

  const windows = BrowserWindow.getAllWindows();
  let actualWindow: BrowserWindow = undefined;

  for (let i = 0; i < windows.length; i++) {
    const currentWindow = windows[i];

    if (windowName === currentWindow.title) {
      actualWindow = currentWindow;
      break;
    }
  }

  if (actualWindow) {
    switch (event) {
      case 'minimize': {
        actualWindow.minimize();
        break;
      }

      case 'maximize': {
        if (actualWindow.isMaximized()) {
          actualWindow.unmaximize();
        } else {
          actualWindow.maximize();
        }
        break;
      }

      case 'close': {
        if (windowName === 'Main') {
          app.quit();
        } else {
          actualWindow.close();
        }
        break;
      }

      case 'open-window': {
        const { targetWindow } = args[0].args;
        ServerLogger.log(`Trying to open window '${targetWindow}'`, LogSeverity.INFO);

        if (targetWindow === 'Settings') {
          const settingsWindow = new BrowserWindow({
            width: 1280,
            height: 720,
            minWidth: 800,
            minHeight: 600,
            frame: false,
            title: 'AZ-HC-Report Settings',
            webPreferences: {
              preload: path.join(__dirname, 'preload.js')
            }
          });

          if (SETTINGS_WINDOW_VITE_DEV_SERVER_URL) {
            ServerLogger.log('Dev environment. Loading URL', LogSeverity.INFO);
            settingsWindow.loadURL(SETTINGS_WINDOW_VITE_DEV_SERVER_URL);
          } else {
            ServerLogger.log('Prod environment. Loading HTML File', LogSeverity.INFO);
            settingsWindow.loadFile(path.join(__dirname, `../ui/settings/${SETTINGS_WINDOW_VITE_NAME}/index.html`));
          }

          // settingsWindow.webContents.openDevTools({ mode: 'right' });

        } else if (targetWindow === 'Help') {
          // TODO: Not implement
          ServerLogger.log('Help window not implemented', LogSeverity.WARNING);
        }

        break;
      }

      default: {
        break;
      }
    }
  }
}