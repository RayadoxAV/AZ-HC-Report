import EventEmitter from 'events';
import Comparator from '../ui/comparator';
import ClientLogger, { LogSeverity } from '../util/clientLogger';

// import StateManager from './stateManager';

class EventManager {

  public static globalEventsEmitter: EventEmitter = new EventEmitter();
  public static fileEventsEmitter: EventEmitter = new EventEmitter();
  public static dataEventsEmmmiter: EventEmitter = new EventEmitter();

  constructor() {
    // NOTE: Check if there is something to be done here
  }

  public manageMainEvents(): void {
    EventManager.globalEventsEmitter.addListener('global-events', (args: any) => {
      const { name: eventName } = args;

      switch (eventName) {
        case 'comparator-init': {
          const comparator = new Comparator();
          comparator.init();
          // comparator.goToComparatorStep(0);
          break;
        }

        default: {
          ClientLogger.log(`Global event not handled: '${eventName}'`, LogSeverity.WARNING);
          break;
        }
      }
    });

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
    window.applicationState.comparator.filePath = value;
    EventManager.fileEventsEmitter.emit('comparator-events', { name: 'file-provided', value: value });
  }

  private manageEntryCreatedEvent(value: any): void {

    window.applicationState.comparator.isFirstEntry = value.isFirstEntry;
    window.applicationState.comparator.lastUploadedEntry = value.data;
    EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'entry-created', value: value.data });

    const tempEntries = [...window.applicationState.comparator.entries];
    tempEntries.push(value.data);

    EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'entries-updated', value: tempEntries });

    window.applicationState.comparator.entries = [...tempEntries];

//             EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'entry-created', value: newValue });
//             EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'name:-updated', value: newValue });


    // StateManager.setStateProperty('comparator.isFirstEntry', value.isFirstEntry);
    // StateManager.setStateProperty('comparator.lastUploadedEntry', value.data);

    // const tempEntries = [...window.applicationState.comparator.entries];
    // tempEntries.push(value.data);

    // StateManager.setStateProperty('comparator.entries', tempEntries);
  }
}

export default EventManager;
