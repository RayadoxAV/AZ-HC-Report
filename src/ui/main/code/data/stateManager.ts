// import Util from '../util/util';
// import { ApplicationState } from './types';
// import ClientLogger, { LogSeverity } from '../util/clientLogger';
// import EventManager from './eventManager';

// class StateManager {

//   public initializeApplicationState(): void {
//     if (window.applicationState === undefined) {
//       const initialState: ApplicationState = {
//         comparator: {
//           currentStep: 0,
//           filePath: '',
//           lastUploadedEntry: undefined,
//           isFirstEntry: false,
//           entries: []
//         },
//         debug: {
//           logging: true
//         }
//       };

//       window.applicationState = Util.proxify(initialState, (object, property, oldValue, newValue) => {

//         switch (property) {
//           case 'filePath': {
//             EventManager.fileEventsEmitter.emit('comparator-events', { name: 'file-provided', value: newValue });
//             break;
//           }

//           case 'lastUploadedEntry': {
//             EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'entry-created', value: newValue });
//             break;
//           }

//           case 'entries': {
//             EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'entries-updated', value: newValue });
//             break;
//           }

//           case 'currentStep': {
//             EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'load-compare-view', value: newValue });
//             break;
//           }

//           default: {
//             // ClientLogger.log(`State change property not associated to event '${property.toString()}'`, LogSeverity.WARNING);
//             break;
//           }
//         }
//       });
//     }

//     ClientLogger.log('Application state initialized', LogSeverity.SUCCESS);
//   }


//   public static setStateProperty(prop: string, value: any): boolean {
//     if (!prop.includes('.')) {
//       ClientLogger.log(`Invalid property format '${prop}'`, LogSeverity.ERROR);
//       return false;
//     }

//     const [category, property] = prop.split('.');

//     if ((window.applicationState as any)[category] === undefined) {
//       ClientLogger.log(`Invalid category name '${category}'`, LogSeverity.ERROR);
//       return false;
//     }

//     if (!Object.keys((window.applicationState as any)[category]).includes(property)) {
//       ClientLogger.log(`Invalid property name '${property}' inside valid category`, LogSeverity.ERROR);
//       return false;
//     }

//     if (value instanceof Array) {
//       (window.applicationState as any)[category][property] = [...value];
//     } else {
//       (window.applicationState as any)[category][property] = value;
//     }

//     return true;
//   }
// }

// export default StateManager;
