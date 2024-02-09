// const { ipcRenderer } = require('electron');

const minimizeButton = document.getElementById('titlebar-minimize-button');
const maximizeButton = document.getElementById('titlebar-maximize-button');
const closeButton = document.getElementById('titlebar-close-button');

let lastSelectedIndex = -1;

function goToStep(index) {
  if (lastSelectedIndex === -1) {
    const contentDiv = document.querySelector(`div.content[data-index="${index}"]`);
    contentDiv.style.display = 'flex';

    const stepDiv = document.querySelector(`div.step[data-index="${index}"]`);
    stepDiv.classList.add('active');

    lastSelectedIndex = index;
    return;
  }

  const previousDiv = document.querySelector(`div.content[data-index="${lastSelectedIndex}"]`);
  const contentDiv = document.querySelector(`div.content[data-index="${index}"]`);

  previousDiv.style.display = 'none';
  contentDiv.style.display = 'flex';

  const previousStepDiv = document.querySelector(`div.step[data-index="${lastSelectedIndex}"]`);
  const stepDiv = document.querySelector(`div.step[data-index="${index}"]`);

  previousStepDiv.classList.remove('active');
  stepDiv.classList.add('active');


  lastSelectedIndex = index;
  
}

goToStep(0);

function init() {
  minimizeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'minimize', window: 'Main' });
  });

  maximizeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'maximize', window: 'Main' });
  });

  closeButton.addEventListener('click', () => {
    ipcRenderer.send('window-events', { name: 'close', window: 'Main' });
  });
}

init();