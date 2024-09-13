import EventManager from '../data/eventManager';
import { Entry } from '../data/types';
import ClientLogger, { LogSeverity } from '../util/clientLogger';
import Util from '../util/util';
// import StateManager from '../data/stateManager';


enum ComparatorError {
  INVALID_FILE_FORMAT = 0
}

class Comparator {
  private element: HTMLElement;

  private progressIndicatorElement: HTMLElement;

  private uploadButton: HTMLButtonElement;
  private compareContinueButton: HTMLButtonElement;

  private currentStep: number = -1;

  // NOTE: Only adding this because I need to remove all listeners later.
  listeners = {
    navigationButtonListener: (event: PointerEvent) => {
      console.log('hola');
      const target = event.target as HTMLButtonElement;
      this.goToComparatorStep(Number.parseInt(target.getAttribute('data-index')));
    },
    uploadFileListener: this.uploadFile
  }

  constructor() {
    // this.init();
  }

  //#region Init
  public init(): void {
    this.element = document.getElementById('comparator');
    this.progressIndicatorElement = this.element.querySelector('div.progress-indicator');
    this.uploadButton = document.getElementById('upload-file-button') as HTMLButtonElement;
    this.compareContinueButton = document.getElementById('compare-continue') as HTMLButtonElement;

    this.listenForEvents();
    this.goToComparatorStep(0);
  }
  //#endregion

  //#region Event handling
  public listenForEvents(): void {
    console.log('ahoaa');
    const buttons = this.progressIndicatorElement.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', this.listeners.navigationButtonListener);
    });

    const uploadArea = this.element.querySelector('div#upload-area') as HTMLElement;
    this.registerUploadAreaEvents(uploadArea);

    this.uploadButton.addEventListener('click', this.uploadFile);
    this.continueComparison = this.continueComparison.bind(this);
    this.compareContinueButton.addEventListener('click', this.continueComparison);

    EventManager.fileEventsEmitter.addListener('comparator-events', (event: { name: string, value: any }) => {
      switch (event.name) {
        case 'file-provided': {
          this.onFileProvided(event.value as string);
          break;
        }

        default: {
          ClientLogger.log(`Comparator file event not managed: '${event.name}'`, LogSeverity.WARNING);
          break;
        }
      }
    });

    EventManager.dataEventsEmmmiter.addListener('comparator-events', (event: { name: string, value: any }) => {
      switch (event.name) {
        case 'entry-created': {
          if (window.applicationState.comparator.isFirstEntry) {
            EventManager.dataEventsEmmmiter.emit('comparator-events', { name: 'load-compare-view', value: 1 });
            return;
          }
          break;
        }

        case 'entries-updated': {
          const entries = event.value as any[];
          this.populateEntrySelects(entries);
          break;
        }

        case 'load-compare-view': {
          console.log('aaa');
          const nextStep = event.value;
          if (nextStep === 1) {
            if (window.applicationState.comparator.isFirstEntry) {
              this.showSingleEntry(window.applicationState.comparator.lastUploadedEntry);
            }
          }

          this.goToComparatorStep(nextStep);
          break;
        }

        default: {
          ClientLogger.log(`Comparator data event not managed: ${event.name}`, LogSeverity.WARNING);
          break;
        }
      }
    });
  }

  private registerUploadAreaEvents(uploadArea: HTMLElement): void {
    uploadArea.addEventListener('click', this.openFileDialog);
    uploadArea.addEventListener('dragenter', () => { uploadArea.classList.add('active'); });
    uploadArea.addEventListener('dragleave', () => { uploadArea.classList.remove('active'); });
    uploadArea.addEventListener('dragover', (event) => { event.preventDefault(); event.stopPropagation(); });
    uploadArea.addEventListener('drop', (event) => { this.onDrop(uploadArea, event); });
  }

  //#endregion

  //#region Steps
  public goToComparatorStep(step: number): void {

    if (this.currentStep === step) {
      return;
    }

    if (this.currentStep !== -1) {
      const previousContainer = this.element.querySelector(`div.comparator-content[data-index="${this.currentStep}"]`) as HTMLElement;

      if (this.currentStep < step) {
        previousContainer.classList.add('fade-out-x-backwards');
      } else if (this.currentStep > step) {
        previousContainer.classList.add('fade-out-x-forwards');
      }

      setTimeout(() => {
        previousContainer.classList.remove('active');
        previousContainer.classList.remove('fade-in-x-backwards');
        previousContainer.classList.remove('fade-in-x-forwards');
        previousContainer.classList.remove('fade-out-x-forwards');
        previousContainer.classList.remove('fade-out-x-backwards');
      }, 300);
    }

    const container = this.element.querySelector(`div.comparator-content[data-index="${step}"]`) as HTMLElement;
    container.classList.add('active');

    if (this.currentStep !== -1) {
      if (this.currentStep < step) {
        container.classList.add('fade-in-x-forwards');
      } else if (this.currentStep > step) {
        container.classList.add('fade-in-x-backwards');
      }
    }

    this.currentStep = step;
    this.moveStepIndicator(step);
  }

  private moveStepIndicator(step: number): void {
    const indicator = this.progressIndicatorElement.querySelector('span.indicator') as HTMLElement;
    indicator.style.left = `${step * 112 + 16}px`;
    indicator.classList.add('shrink-deshrink');
    setTimeout(() => {
      indicator.classList.remove('shrink-deshrink');
    }, 200);
  }
  //#endregion

  //#region File handling
  private openFileDialog(event: PointerEvent): void {
    if (event.currentTarget === event.target) {
      window.fileBridge.sendEvent('file-dialog-open', 'Main');
    }
  }

  private onDrop(uploadArea: HTMLElement, event: any): void {
    event.stopPropagation();
    event.preventDefault();

    uploadArea.classList.remove('active');
  }

  private onFileProvided(filePath: string) {
    const fileExtension = filePath.split('.').pop();

    if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'xlsm') {
      this.displayErrors(ComparatorError.INVALID_FILE_FORMAT);
      return;
    }

    const file = {
      name: filePath.split('\\').pop(),
      path: filePath
    };

    this.displayFile(file);
  }

  private displayFile(file: { name: string, path: string }): void {
    document.getElementById('inline-file-icon').style.display = 'inline-block';
    this.uploadButton.style.display = 'block';
    document.getElementById('file-name').innerText = file.name;
    this.element.querySelector('span.file-icon').setAttribute('data-icon', 'upload');
  }

  private displayErrors(cause: ComparatorError): void {
    switch (cause) {
      case ComparatorError.INVALID_FILE_FORMAT: {
        document.getElementById('file-name').innerText = 'Invalid file format';
        this.element.querySelector('span.file-icon').setAttribute('data-icon', 'upload_error');
        break;
      }

      default:
        break;
    }

    this.uploadButton.style.display = 'none';
  }
  //#endregion

  //#region Entry selection

  private populateEntrySelects(entries: any[]) {
    let optionsHTML = '<option value="">Select an entry</option>';

    for (let i = 0; i < entries.length; i++) {
      const currentEntry = entries[i];
      optionsHTML += `<option value="${currentEntry.week}-${currentEntry.fiscalYear}">WK${currentEntry.week} - FY${currentEntry.fiscalYear}</option>`;
    }

    const firstEntrySelect = document.getElementById('first-entry-select');
    const secondEntrySelect = document.getElementById('second-entry-select');

    firstEntrySelect.innerHTML = optionsHTML;
    secondEntrySelect.innerHTML = optionsHTML;
  }

  //#endregion 

  //#region Upload file
  private uploadFile(): void {
    window.dataBridge.sendEvent('extract-file-information', { type: 0, data: window.applicationState.comparator.filePath });
  }
  //#endregion

  //#region Entry display
  private showSingleEntry(entry: Entry): void {
    ClientLogger.log('Showing single entry', LogSeverity.INFO);
    const tablesContainer = this.element.querySelector('div#tables-container');
    tablesContainer.classList.remove('double-table-view');
    tablesContainer.classList.add('single-table-view');

    const secondTableContainer = this.element.querySelector('div#second-table-container') as HTMLDivElement;
    secondTableContainer.style.display = 'none';

    const zoners = entry.zoners;

    let tableBodyHTML = '';

    for (let i = 0; i < zoners.length; i++) {
      const zoner = zoners[i];
      tableBodyHTML +=
        `<tr>
        <td>${zoner.ignitionId}</td>
        <td>${zoner.cc}</td>
        <td>${zoner.name}</td>
        <td>${Util.getFormattedDate(zoner.hireDate)}</td>
        <td>${zoner.jobCode}</td>
        <td>${zoner.position}</td>
        <td>${zoner.grade}</td>
        <td>${zoner.supervisorId}</td>
        <td>${zoner.supervisorName}</td>
      </tr>`;
    }

    const firstTableBody = this.element.querySelector('table#first-table > tbody');
    firstTableBody.innerHTML = tableBodyHTML;
    this.compareContinueButton.innerText = 'Save file';
  }
  
  private showBothEntries(firstEntry: Entry, secondEntry: Entry): void {
    console.log('TODO: Implement', firstEntry, secondEntry);
  }

  private hideEntries(): void {
    const tablesContainer = this.element.querySelector('div#tables-container');
    tablesContainer.classList.remove('single-table-view');
    tablesContainer.classList.add('double-table-view');
    const secondTableContainer = this.element.querySelector('div#second-table-container') as HTMLDivElement;
    secondTableContainer.style.display = 'unset';

    const firstTableBody = this.element.querySelector('table#first-table > tbody');
    firstTableBody.innerHTML = '<td colspan="9" style="text-align: center;">No entry selected for visualization</td>';
    const secondTableBody = this.element.querySelector('table#second-table > tbody');
    secondTableBody.innerHTML = '<td colspan="9" style="text-align: center;">No entry selected for visualization</td>'
  }

  //#endregion

  //#region Compare
  private continueComparison(): void {
    if (window.applicationState.comparator.isFirstEntry) {
      console.log('Just save the entry and go to step 1. Reset state');
      // window.dataBridge('save-entry', { data: window.applicationState.comparator.lastUploadedEntry });

   
      this.resetComparatorState();
      this.removeAllListeners();
      this.resetComparatorUI();
      this.goToComparatorStep(0);

      EventManager.globalEventsEmitter.emit('global-events', { name: 'comparator-init' });
    }
  }
  //#endregion

  //#region Cleanup
  private resetComparatorState(): void {
    window.applicationState.comparator.currentStep = 0;
    window.applicationState.comparator.filePath = '';
    window.applicationState.comparator.isFirstEntry = false;
    window.applicationState.comparator.lastUploadedEntry = undefined;

  }

  private removeAllListeners(): void {
    /* const buttons = this.progressIndicatorElement.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => {
      button.removeEventListener('click', this.listeners.navigationButtonListener);
    });
    
    this.uploadButton.removeEventListener('click', this.listeners.uploadFileListener); */
  }

  private resetComparatorUI(): void {
    this.hideEntries();
    this.uploadButton.style.display = 'none';
    this.compareContinueButton.innerText = 'Continue';
    const fileNameContainer = document.getElementById('file-name-container');
    fileNameContainer.innerHTML = 'Click this area to continue';
  }

  //#endregion
}

export default Comparator;
