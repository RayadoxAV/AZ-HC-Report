/* 
  Raymundo Paz
  September 2024
*/

export enum LogSeverity {
  INFO,
  SUCCESS,
  WARNING,
  ERROR
}

class ServerLogger {
  /**
   * Log a message to the console. (Only if logging is activated for the environment)
   * @param {string} message - A message to log to stdout.
   * @param {LogSeverity} severity - A level of severity for the message
  */
  static log(message: string, severity: LogSeverity = undefined): void {
    if (process.env.DEBUG_LOGS === 'on') {
      if (process.env.CURRENT_ENV === 'development') {
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
      } else {
        // TODO: Log to file
        // NOTE: Probably should queue log messages from minute to minute and write them all each minute into a big file.
        // Maybe before closing the application, the logger is forced to write messages.
        // Should do this in a separate process probably.
        console.log('Log to file');
      }
    }
  }
}

export default ServerLogger;
