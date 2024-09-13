/* eslint-disable no-var */
import TitleBar from './ui/title-bar';
import NavRail from './ui/nav-rail';
import Comparator from './ui/comparator';
import EventManager from './data/eventManager';
import { ApplicationState } from './data/types';
// import StateManager from './data/stateManager';
// import Logger from './util/logger';

declare global {
  var electronAPI: any
  var windowBridge: any;
  var fileBridge: any;
  var dataBridge: any;
  var applicationState: ApplicationState
}


init();

function init(): void {
  initializeApplicationState();
  new EventManager().manageMainEvents();
  initializeComponents();
}

function initializeApplicationState() {
  if (window.applicationState === undefined) {
    const initialState: ApplicationState = {
      comparator: {
        currentStep: 0,
        filePath: '',
        lastUploadedEntry: undefined,
        isFirstEntry: false,
        entries: []
      },
      debug: {
        logging: true
      }
    };

    window.applicationState = initialState;
  }
}

function initializeComponents(): void {
  const navRail = new NavRail();
  navRail.changePage(0);

  new TitleBar();

  
  // comparator.goToComparatorStep(window.applicationState.comparator.currentStep);

  EventManager.globalEventsEmitter.emit('global-events', { name: 'comparator-init' });
}
