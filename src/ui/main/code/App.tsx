/*
  Raymundo Paz
  September 2024
*/
import { useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import TitleBar from './components/title-bar/TitleBar';
import NavigationRail from './components/nav-rail/NavigationRail';
import Comparator from './components/comparator/Comparator';

import './App.css';
import EventManager from './data/eventManager';
import { AppContext } from './data/ApplicationState';
import Entries from './components/entries/Entries';
import Reports from './components/reports/Reports';

function App() {

  const [state, setApplicationState] = useContext(AppContext);

  useEffect(() => {
    EventManager.manageElectronAPIEvents(setApplicationState);
    EventManager.manageInternalWindowEvents(setApplicationState);
    window.dataBridge.sendEvent('get-all-entries');
  }, []);

  // test();

  return (
    <>
      <TitleBar />
      <NavigationRail />
      <div className="content" style={{ overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Comparator />} />
          <Route path="/entries" element={<Entries></Entries>} />
          <Route path="/reports" element={<Reports></Reports>} />
          <Route path="/settings" element={<div>Settings</div>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
