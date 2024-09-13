
class TitleBar {

  private element: HTMLElement;

  constructor() {
    this.init();
  }

  private init(): void {
    this.element = document.getElementById('title-bar');
    this.listenForEvents();
  }

  private listenForEvents(): void {
    const minimizeButton = this.element.querySelector('button[data-action="minimize"]');
    const maximizeButton = this.element.querySelector('button[data-action="maximize"]');
    const closeButton = this.element.querySelector('button[data-action="close"]');

    minimizeButton.addEventListener('click', () => {
      window.windowBridge.sendEvent('Main', 'minimize');
    });

    maximizeButton.addEventListener('click', () => {
      window.windowBridge.sendEvent('Main', 'maximize');
    });

    closeButton.addEventListener('click', () => {
      window.windowBridge.sendEvent('Main', 'close');
    });
  }
}

export default TitleBar;
