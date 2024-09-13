import EventEmitter from 'events';

import StateManager from './stateManager';

class EventManager {

  public static fileEventsEmitter: EventEmitter = new EventEmitter();
  public static dataEventsEmmmiter: EventEmitter = new EventEmitter();

  constructor() {
    // NOTE: Check if there is something to be done here
  }

  public manageMainEvents(): void {
    window.electronAPI.onFileEvent((args: { name: string, value: any }) => {
      switch (args.name) {
        case 'file-path-provided': {
          this.manageFileProvidedEvent(args.value as string);
          break;
        }
      }
    });

    window.electronAPI.onDataEvent((args: any) => {
      switch (args.name) {
        case 'first-entry-created': {
          this.manageEntryCreatedEvent({ data: args.value, isFirstEntry: true });
          break;
        }

        case 'entry-created': {
          this.manageEntryCreatedEvent({ data: args.value, isFirstEntry: false });
          break;
        }

        default: {
          console.log('hola');
          break;
        }
      }
    });
  }

  private manageFileProvidedEvent(value: string): void {
    StateManager.setStateProperty('comparator.filePath', value);
  }

  private manageEntryCreatedEvent(value: any): void {
    StateManager.setStateProperty('comparator.lastUploadedEntry', value);

    const tempEntries = [...window.applicationState.comparator.entries];
    tempEntries.push(value.data);

    StateManager.setStateProperty('comparator.entries', tempEntries);
  }
}

export default EventManager;
