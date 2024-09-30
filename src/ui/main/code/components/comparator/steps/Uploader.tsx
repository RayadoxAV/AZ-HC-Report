/* 
  Raymundo Paz
  September 2024
*/
import { BaseSyntheticEvent, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../data/ApplicationState';
import { Entry } from '../../../data/types';

interface UploaderProps {
  active: boolean;
  className?: string;
}

const Uploader: React.FC<UploaderProps> = ({ active, className }) => {

  const [appState, setState] = useContext(AppContext);

  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');

  const [entryList, setEntryList] = useState([]);

  const [firstEntryKey, setFirstEntryKey] = useState('');
  const [secondEntryKey, setSecondEntryKey] = useState('');

  useEffect(() => {
    dataBridge.sendEvent('get-all-entries');
  }, []);

  useEffect(() => {
    setEntryList(appState.comparator.entryList);
  }, [appState.comparator.entryList])

  useEffect(() => {
    handlePathChange();
  }, [appState.comparator.filePath]);

  function handlePathChange() {
    const filePath: string = appState.comparator.filePath;
    if (filePath.length > 0) {
      const fileExtension = filePath.split('.').pop();

      if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'xlsm') {
        setFilePath(appState.comparator.filePath);
        setFileName(appState.comparator.fileName);
        return;
      }
      alert('Wrong file format. Try with another file');
    } else {
      setFilePath('');
      setFileName('');
    }
  }

  function handleUploadAreaClick(event: BaseSyntheticEvent) {
    if (event.target === event.currentTarget) {
      window.fileBridge.sendEvent('file-dialog-open', 'Main');
    }
  }

  function uploadFile(): void {
    setState({ type: 'setUploadEntry', uploadEntry: true });
    window.dataBridge.sendEvent('extract-file-information', { type: 0, data: filePath });
  }

  function handleSelectChange(event: React.ChangeEvent<HTMLElement>, selectIndex: number): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectIndex === 0) {
      setFirstEntryKey(selectElement.value);
    } else {
      setSecondEntryKey(selectElement.value);
    }
  }

  function compareSelectedEntries() {
    if (!firstEntryKey || !secondEntryKey) {
      alert('Select two entries to continue');
      return;
    }

    const firstEntry = findEntryById(firstEntryKey);
    const secondEntry = findEntryById(secondEntryKey);
    
    if (!firstEntry || !secondEntry) {
      alert('HUH');
      return;
    }

    setState({ type: 'setFirstEntry', firstEntry });
    setState({ type: 'setSecondEntry', secondEntry });
    setState({ type: 'setIsFirstEntry', isFirstEntry: false });
    setState({ type: 'setComparatorStep', comparatorStep: 1 });
    setFirstEntryKey('');
    setSecondEntryKey('');
  }

  function findEntryById(searchKey: string): Entry {
    for (let i = 0; i < entryList.length; i++) {
      const currentEntry = entryList[i];
      const key = `${currentEntry.week}-${currentEntry.fiscalYear}`;
      if (key === searchKey) {
        return currentEntry;
      }
    }
  }

  return (
    <div style={{ display: active ? 'grid' : 'none' }} className={`uploader ${className}`}>
      <div className="upload-container">
        <span className="title">Upload a file</span>
        <div className="upload-area" onClick={handleUploadAreaClick}>
          <span className="file icon" data-icon="upload"></span>
          <span className="file-name">
            <span className="icon" data-icon="file"></span>
            <span>
              {
                // filePath !== '' ? filePath : 'Click this area to continue'
                filePath !== '' ? fileName : 'Click this area to continue'
              }
            </span>
          </span>
          {
            filePath !== '' ? (<button className="upload" onClick={uploadFile}>Upload</button>) : null
          }
        </div>
      </div>
      <span>or</span>
      <div className="selector-container">
        <span className="title">Select a pair of entries</span>
        <select className="first styled" onChange={(event) => { handleSelectChange(event, 0) }} value={firstEntryKey}>
          <option value="">Select an entry</option>
          {
            entryList.map((entry: Entry, index: number) => (
              <option key={index} value={`${entry.week}-${entry.fiscalYear}`}>WK{entry.week}-FY{entry.fiscalYear}</option>
            ))
          }
        </select>
        <span className="label first">{firstEntryKey || 'No entry selected'}</span>
        <select className="second styled" onChange={(event) => { handleSelectChange(event, 1) }} value={secondEntryKey}>
          <option value="">Select an entry</option>
          {
            entryList.map((entry: Entry, index: number) => (
              <option key={index} value={`${entry.week}-${entry.fiscalYear}`}>WK{entry.week}-FY{entry.fiscalYear}</option>
            ))
          }
        </select>
        <span className="label second">{secondEntryKey || 'No entry selected'}</span>
        <button className="compare" onClick={compareSelectedEntries}>Compare</button>
      </div>
    </div>
  );
}

export default Uploader;
