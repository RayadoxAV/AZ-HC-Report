const { app, BrowserWindow } = require('electron');

require('dotenv').config();

if (process.env.CURR_ENV === 'development') {
  const path = require('path');

  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../', 'node_modules', '.bin', 'electron')
  });
}

function createWindow() {
  const window = new BrowserWindow({
    icon: '',
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 400,
    frame: false,
    title: 'Main',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  window.loadFile('./src/ui/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

require('./events/bridge');
