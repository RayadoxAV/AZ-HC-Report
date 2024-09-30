export enum LogSeverity {
  INFO,
  SUCCESS,
  WARNING,
  ERROR
}

class MainClientLogger {
  static log(message: string, severity: LogSeverity = undefined) {
    // TODO: Check for application state

    const reset = '\x1b[0m';
    switch (severity) {
      case LogSeverity.INFO: {
        console.log(`INFO: ${message}`);
        break;
      }

      case LogSeverity.SUCCESS: {
        const color = '\x1b[32m';
        console.log(`${color}%s${reset}`, `SUCCESS: ${message}`);
        break;
      }

      case LogSeverity.WARNING: {
        const color = '\x1b[33m';
        console.log(`${color}%s${reset}`, `WARNING: ${message}`);
        break;
      }

      case LogSeverity.ERROR: {
        const color = '\x1b[31m';
        console.log(`${color}%s${reset}`, `ERROR: ${message}`);
        break;
      }

      default: {
        console.log(`LOG: ${message}`);
        break;
      }
    }
  }
}

export default MainClientLogger;
