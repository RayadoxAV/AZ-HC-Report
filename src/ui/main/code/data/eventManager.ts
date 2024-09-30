import MainClientLogger, { LogSeverity } from '../util/clientLogger';
import { Entry } from './types';

class EventManager {

  public static manageElectronAPIEvents(setState: any): void {
    window.electronAPI.onFileEvent((args: { name: string, value: any }): void => {
      const { name: eventName, value } = args;

      switch (eventName) {
        case 'file-path-provided': {
          const filePath = value;
          const fileName = value.split('\\').pop();

          setState({ type: 'setFilePath', filePath: filePath });
          setState({ type: 'setFileName', fileName: fileName });
          break;
        }

        default: {
          MainClientLogger.log(`Electron API File Event not managed: '${eventName}'`, LogSeverity.WARNING);
          break;
        }
      }
    });

    window.electronAPI.onDataEvent((args: { name: string, value: any }) => {
      const { name: eventName, value } = args;
      switch (eventName) {
        case 'first-entry-created': {
          setState({ type: 'setComparatorStep', comparatorStep: 1 });
          setState({ type: 'setIsFirstEntry', isFirstEntry: true });
          setState({ type: 'setFirstEntry', firstEntry: value as Entry });
          break;
        }

        case 'entry-created': {
          window.dataBridge.sendEvent('request-entry', { entryNumber: 0, param: 'last' });

          setState({ type: 'setComparatorStep', comparatorStep: 1 });
          setState({ type: 'setIsFirstEntry', isFirstEntry: false });
          setState({ type: 'setSecondEntry', secondEntry: value as Entry });
          break;
        }

        case 'entry-saved': {
          const isFirstEntry: boolean = value.isFirstEntry;
          if (isFirstEntry) {
            // Reset comparator state
            setState({ type: 'setFilePath', filePath: '' });
            setState({ type: 'setFileName', fileName: '' });
            setState({ type: 'setIsFirstEntry', isFirstEntry: false });
            setState({ type: 'setFirstEntry', firstEntry: undefined });
            setState({ type: 'setComparatorStep', comparatorStep: 0 });
            setState({ type: 'setUploadEntry', uploadEntry: false });
            dataBridge.sendEvent('get-all-entries');

            alert('Entry saved successfully!');
          } else {
            setState({ type: 'setIsFirstEntry', isFirstEntry: false });
            setState({ type: 'setComparatorStep', comparatorStep: 2 });
          }
          break;
        }

        case 'entry-provided': {
          if (value.entryNumber === 0) {
            setState({ type: 'setFirstEntry', firstEntry: value.entry });
          } else if (value.entryNumber === 1) {
            setState({ type: 'setSecondEntry', secondEntry: value.entry });
          }
          break;
        }

        case 'reset-comparator': {
          setState({ type: 'setFilePath', filePath: ''});
          setState({ type: 'setFileName', fileName: '' });
          setState({ type: 'setIsFirstEntry', isFirstEntry: false });
          setState({ type: 'setFirstEntry', firstEntry: undefined });
          setState({ type: 'setSecondEntry', secondEntry: undefined });
          setState({ type: 'setComparatorStep', comparatorStep: 0 });
          setState({ type: 'setUploadEntry', uploadEntry: false });
          setState({ type: 'setComparatorChanges', changes: { hasBeenModified: false, firstChangedZoners: [], secondChangedZoners: [] }});
          dataBridge.sendEvent('get-all-entries');
          break;
        }

        case 'provide-entries-list': {
          const list = value.list;
          setState({ type: 'setEntryList', list: list });
          break;
        }

        default: {
          MainClientLogger.log(`Unmanaged event '${eventName}'`, LogSeverity.WARNING);
          break;
        }
      }
    });
  }
}

export default EventManager;
