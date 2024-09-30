/* 
  Raymundo Paz
  September 2024
*/

import { useContext } from 'react';
import './TitleBar.css';
import { AppContext } from '../../data/ApplicationState';

const TitleBar: React.FC = () => {

  const [state] = useContext(AppContext);

  function handleMinimize(): void {
    window.windowBridge.sendEvent('Main', 'minimize');
  }

  function handleMaximize(): void {
    window.windowBridge.sendEvent('Main', 'maximize');
  }

  function handleClose(): void {
    window.windowBridge.sendEvent('Main', 'close');
  }

  return (
    <div className="title-bar">
      <img className="icon" />
      <span className="title">{state.title}</span>
      <div className="window-controls">
        <button data-action="minimize" className="codicon codicon-chrome-minimize" onClick={handleMinimize}></button>
        <button data-action="maximize" className="codicon codicon-chrome-maximize" onClick={handleMaximize}></button>
        <button data-action="close" className="codicon codicon-chrome-close" onClick={handleClose}></button>
      </div>
    </div>
  )
};

export default TitleBar;
