/* 
  Raymundo Paz
  September 2024
*/

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onFileEvent: (callback: any) => ipcRenderer.on('file-events', (_event, value) => callback(value)),
  onDataEvent: (callback: any) => ipcRenderer.on('data-events', (_event, value) => callback(value))
});

contextBridge.exposeInMainWorld('windowBridge', {
  sendEvent: (window: string, event: string, args: any) => ipcRenderer.send('window-events', { window: window, event: event, args: args })
});

contextBridge.exposeInMainWorld('fileBridge', {
  sendEvent: (event: string, args: any) => ipcRenderer.send('file-events', { event: event, args: args })
});

contextBridge.exposeInMainWorld('dataBridge', { 
  sendEvent: (event: string, args: any) => ipcRenderer.send('data-events', { event: event, args: args })
});
