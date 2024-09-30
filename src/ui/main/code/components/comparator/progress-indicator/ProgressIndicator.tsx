/* 
  Raymundo Paz
  September 2024
*/

import { useRef } from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  currentActiveStep: number;
  onStepSelected: any;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentActiveStep, onStepSelected }) => {

  const indicatorRef = useRef();

  function handleSelect(step: number): void {
    if (onStepSelected) {
      onStepSelected(step);
    }
  }
  
  return (
    <div className="progress-indicator">
      <button className={`${currentActiveStep === 0 ? 'active' : ''}`} onClick={() => { handleSelect(0); }}>Select</button>
      <button className={`${currentActiveStep === 1 ? 'active' : ''}`} onClick={() => { handleSelect(1); }}>Compare</button>
      <button className={`${currentActiveStep === 2 ? 'active' : ''}`} onClick={() => { handleSelect(2); }}>Generate</button>
      <span ref={indicatorRef} className="indicator" style={{ left: `${currentActiveStep * 112 + 16}px` }}></span>
    </div>
  );
}

export default ProgressIndicator;