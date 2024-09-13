/* eslint-disable no-var */
import TitleBar from './ui/title-bar';
import NavRail from './ui/nav-rail';
import Comparator from './ui/comparator';
import EventManager from './data/eventManager';
import { ApplicationState } from './data/types';
import StateManager from './data/stateManager';
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
  const stateManager = new StateManager();
  stateManager.initializeApplicationState();
  initializeComponents();
  new EventManager().manageMainEvents();
}

function initializeComponents(): void {
  const navRail = new NavRail();
  navRail.changePage(0);

  new TitleBar();

  const comparator = new Comparator();
  comparator.goToComparatorStep(window.applicationState.comparator.currentStep);
}
