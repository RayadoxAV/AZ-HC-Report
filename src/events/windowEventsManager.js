const { app, BrowserWindow } = require('electron');

module.exports = function windowEventsManager(_, args) {
  switch (args.name) {
    case 'minimize': {
      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];
        if (args.window === window.title) {
          window.minimize();
        }
      }

      break;
    }

    case 'maximize': {
      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];
        if (args.window === window.title) {
          if (window.isMaximized()) {
            window.unmaximize();
          } else {
            window.maximize();
          }
        }
      }
      break;
    }

    case 'close': {
      const windows = BrowserWindow.getAllWindows();

      for (let i = 0; i < windows.length; i++) {
        const window = windows[i];

        if (args.window === window.title) {
          if (args.window === 'Main') {
            app.quit();
          } else {
            window.close();
          }
        }
      }
      break;
    }

    default: {
      break;
    }
  }
}