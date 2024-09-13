class NavRail {

  private element: HTMLElement;

  private selectedPage: number = -1;

  constructor() {
    this.init();
  }

  public init(): void {
    this.element = document.getElementById('nav-rail');
    this.listenForEvents();
  }

  public listenForEvents(): void {
    this.element.querySelectorAll('div.item').forEach((item) => {
      item.addEventListener('click', () => {
        const dataIndex = Number.parseInt(item.getAttribute('data-index') || '-1');
        if (dataIndex === -1) {
          window.windowBridge.sendEvent('Main', 'open-window', { targetWindow: 'Settings' });
        } else {
          this.changePage(dataIndex);
        }
      });
    });
  }

  public changePage(pageIndex: number): void {
    
    if (this.selectedPage !== -1) {
      const previousItem = this.element.querySelector(`div.item[data-index="${this.selectedPage}"]`);
      previousItem.classList.remove('active');

      const previousContainer = document.querySelector(`div.content[data-index="${this.selectedPage}"]`);
      previousContainer.classList.remove('active');
    }

    const currentItem = this.element.querySelector(`div.item[data-index="${pageIndex}"]`);
    currentItem.classList.add('active');

    const currentContainer = document.querySelector(`div.content[data-index="${pageIndex}"]`);
    currentContainer.classList.add('active');

    this.selectedPage = pageIndex;

  }
}

export default NavRail;
