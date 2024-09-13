/* 
  Raymundo Paz
  September 2024
*/

import { BrowserWindow, dialog } from 'electron';

export async function manageFileEvents(_: any, ...args: any[]): Promise<void> {
  const { event, args: eventArgs } = args[0];


  switch (event) {
    case 'file-dialog-open': {
      const windowName = eventArgs as string;
      openFileDialog(windowName);
      break;
    }
  }

  function openFileDialog(windowTitle: string): void {
    const windows = BrowserWindow.getAllWindows();

    for (let i = 0; i < windows.length; i++) {
      const window = windows[i];

      if (window.title === windowTitle) {
        dialog.showOpenDialog(window, { properties: ['openFile'] }).then((value) => {
          if (!value.canceled) {
            window.webContents.send('file-events', { name: 'file-path-provided', value: value.filePaths[0] });
          }
        }).catch((error) => {
          console.log(error);
        });
      }
    }
  }

}