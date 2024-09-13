import EventManager from '../data/eventManager';
import StateManager from '../data/stateManager';
import ClientLogger, { LogSeverity } from '../util/clientLogger';
// import StateManager from '../data/stateManager';


enum ComparatorError {
  INVALID_FILE_FORMAT = 0
}

class Comparator {
  private element: HTMLElement;

  private progressIndicatorElement: HTMLElement;

  private uploadButton: HTMLButtonElement;

  private currentStep: number = -1;

  constructor() {
    this.init();
  }

  //#region Init
  public init(): void {
    this.element = document.getElementById('comparator');
    this.progressIndicatorElement = this.element.querySelector('div.progress-indicator');
    this.uploadButton = document.getElementById('upload-file-button') as HTMLButtonElement;
    this.listenForEvents();
  }
  //#endregion

  //#region Event handling
  public listenForEvents(): void {
    const buttons = this.progressIndicatorElement.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', () => {
        this.goToComparatorStep(Number.parseInt(button.getAttribute('data-index')));
      });
    });

    const uploadArea = this.element.querySelector('div#upload-area') as HTMLElement;
    this.registerUploadAreaEvents(uploadArea);

    this.uploadButton.addEventListener('click', this.uploadFile);

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

    EventManager.dataEventsEmmmiter.addListener('comparator-events', (event: { name: string, value: any })=> {
      switch (event.name) {
        case 'entry-created': {
          const { data: entry, isFirstEntry } = event.value;
          if (isFirstEntry) {
            StateManager.setStateProperty('comparator.currentStep', 1);
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
          const nextStep = event.value;
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
    // console.log(window.applicationState.comparator.filePath);
    window.dataBridge.sendEvent('extract-file-information', { type: 0, data: window.applicationState.comparator.filePath });
  }
  //#endregion

}

export default Comparator;
