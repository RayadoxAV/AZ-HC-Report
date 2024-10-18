/* 
  Raymundo Paz
  September 2024
*/

import { useContext, useEffect, useState } from 'react';
import './Comparator.css';

import ProgressIndicator from './progress-indicator/ProgressIndicator';
import Uploader from './steps/Uploader';
import Viewer from './steps/Viewer';
import Generator from './steps/Generator';
import { AppContext } from '../../data/ApplicationState';


const Comparator: React.FC = () => {

  const [appState, setState] = useContext(AppContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState(0);

  useEffect(() => {

    if (appState.comparator.comparatorStep > activeStep) {
      setTransitionDirection(1);
    } else {
      setTransitionDirection(-1);
    }

    setActiveStep(appState.comparator.comparatorStep);
  }, [appState.comparator.comparatorStep]);

  function handleStepSelected(index: number) {

    if (index > activeStep) {
      setTransitionDirection(1);
    } else {
      setTransitionDirection(-1)
    }

    // setActiveStep(index);
    setState({ type: 'setComparatorStep', comparatorStep: index });
  }

  function getTransitionClass(): string {
    if (transitionDirection === 0) {
      return '';
    }

    if (transitionDirection === 1) {
      return 'fade-in-x-forwards';
    } else {
      return 'fade-in-x-backwards';
    }
  }

  return (
    <div className="comparator fade-in-up">
      <ProgressIndicator
        currentActiveStep={activeStep}
        onStepSelected={handleStepSelected} />
      <Uploader active={activeStep === 0} className={getTransitionClass()} />
      <Viewer active={activeStep === 1} className={getTransitionClass()} />
      <Generator active={activeStep === 2} className={getTransitionClass()} />
    </div>
  );
};

export default Comparator;
