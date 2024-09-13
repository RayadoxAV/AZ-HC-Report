/* 
  Raymundo Paz
  September 2024
*/

import { ipcMain } from 'electron';
import { manageWindowEvents } from './windowEventsManager';
import { manageFileEvents } from './fileEventsManager';
import { manageDataEvents } from './dataEventsManager';

export function manageEvents(): void {
  ipcMain.on('window-events', manageWindowEvents);
  ipcMain.on('window-keyboard-events', () => { console.log('keyboard-events'); });

  ipcMain.on('file-events', manageFileEvents);
  ipcMain.on('data-events', manageDataEvents);
}
