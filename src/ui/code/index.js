const { ipcRenderer } = require('electron');

const uploadArea = document.getElementById('upload-area');
const continueButton = document.getElementById('upload-continue');

function init() {
  uploadArea.addEventListener('click', openFileDialog);
  uploadArea.addEventListener('dragenter', () => { console.log('drag-enter'); });
  uploadArea.addEventListener('dragleave', () => { console.log('drag-leave'); });
  uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  uploadArea.addEventListener('drop', onDrop);

  // NOTE: I'm doing it like this to avoid stateful data. I do not know if this is better or worse than a global variable haha.
  continueButton.addEventListener('click', () => {
    const filePath = continueButton.getAttribute('data-file-path');

    if (filePath) {
      // goToStep(1);
      ipcRenderer.send('data-events', { name: 'file-extract-information', path: filePath });
    }
  });


  listenForIPCEvents();
  ipcRenderer.send('file-events', { name: 'read-entries' });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'f' && event.ctrlKey) {
      toggleSearch();
      
    }
  });

  window.data = {
    entries: [],
    isSearchBoxVisible: false,
    selectedEntryIndex: -1
  };  

}

init();

function listenForIPCEvents() {
  ipcRenderer.on('file-events', (_, args) => {
    switch (args.name) {
      case 'file-path-provided': {
        const filePath = args.value;

        if (filePath.split('.').pop() !== 'xlsx' && filePath.split('.').pop() !== 'xls' && filePath.split('.').pop() !== 'xlsm') {
          displayErrors('invalid-file-format');
          return;
        }

        const file = {
          name: filePath.split('\\').pop(),
          path: filePath
        };

        displayFile(file.name);
        enableNextStep(file.path);
        break;
      }

      case 'file-message': {
        alert(args.message);
        window.location.reload();
        break;
      }

      default: {
        break;
      }
    }
  });

  ipcRenderer.on('data-events', (_, args) => {
    switch (args.name) {
      case 'entry-data-provided': {
        try {
          const response = JSON.parse(args.data);

          goToStep(1);
          initComparator(response);
        } catch (error) {
          // alert(error);
          console.log(error);
        }

        break;
      }

      case 'entry-uploaded': {
        alert('Entry loaded sucessfully');
        if (args.data.isFirst) {
          window.location.reload();
        } else {
          initGenerator(args.data.changes, args.data.currentWeek, args.data.pastWeek);
          goToStep(2);
        }
        break;
      }

      case 'entries-read': {
        // window.data.entries = args.data;
        

        args.data.sort((a, b) => {
          if (a.week < b.week) {
            return 1;
          }
          if (a.week > b.week) {
            return -1;
          }
          return 0;
        });

        window.data.entries = args.data;

        initEntryViewer();
        break;
      }

      case 'entry-deleted': {
        if (args.data.deleted) {
          alert('Entry deleted successfully');
        } else {
          alert('Error while deleting entry');
        }
      }

      default: {
        break;
      }
    }
  });

  ipcRenderer.on('error-events', (_, args) => {
    switch (args.name) {
      case 'data-extraction': {
        alert(args.message)
        break;
      }

      default: {
        alert('There was an error. Please try again.');
        break;
      }
    }
  });
}

function openFileDialog(event) {
  if (event.target.id !== 'upload-continue') {
    ipcRenderer.send('file-events', { name: 'file-open', window: 'Main' });
  }
}

function onDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer.files.length === 1) {
    const resultFile = event.dataTransfer.files.item(0);
    console.log(resultFile);
    if (resultFile.name.split('.').pop() !== 'xlsx' && resultFile.name.split('.').pop() !== 'xls' && resultFile.name.split('.').pop() !== 'xlsm') {
      displayErrors('invalid-file-format');
      return;
    }

    const file = {
      name: resultFile.name.split('\\').pop(),
      path: resultFile.path
    };


    displayFile(file.name);
    enableNextStep(file.path);
  }
}

function displayFile(fileName) {
  const informationText = document.getElementById('information-text');
  informationText.classList.add('file-name');
  informationText.innerText = fileName;
}

function enableNextStep(filePath) {
  continueButton.style.opacity = '1';
  continueButton.style.pointerEvents = 'all';
  continueButton.setAttribute('data-file-path', filePath);
}

function displayErrors(cause) {
  switch (cause) {
    case 'invalid-file-format': {
      // TODO: Implement
      break;
    }
    default:
      break;
  }
}
