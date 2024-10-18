/* 
  Raymundo Paz
  October 2024
*/

import { useContext, useEffect, useState } from 'react';
import './Entries.css';

import Entry from './Entry';
import { AppContext } from '../../data/ApplicationState';
import * as types from '../../data/types';
import SearchDialog from '../searchDialog/SearchDialog';

const Entries: React.FC = () => {

  const [appState, setState] = useContext(AppContext);
  const [entryList, setEntryList] = useState([] as types.Entry[]);
  const [currentEntry, setCurrentEntry] = useState(undefined);

  useEffect(() => {
    const tempList: types.Entry[] = [...appState.comparator.entryList];

    tempList.sort((a: types.Entry, b: types.Entry) => {
      if (a.fiscalYear > b.fiscalYear) {
        return -1;
      } else if (a.fiscalYear < b.fiscalYear) {
        return 1;
      } else {
        return 0;
      }
    });

    setEntryList(tempList);
    setCurrentEntry(undefined);
  }, [appState.comparator.entryList]);

  function handleEntryClick(week: number, year: number): void {
    const entry = getEntryByWeekAndYear(week, year);
    if (!entry) {
      return;
    }

    setCurrentEntry(entry);
  }

  function handleDeleteClick(week: number, year: number): void {
    const shoulDelete = confirm('Are you sure you want to delete this entry? This action cannot be undone.');
    if (shoulDelete) {
      window.dataBridge.sendEvent('delete-entry', { data: { week: week, fiscalYear: year } });
    }
  }

  function getEntryByWeekAndYear(week: number, year: number): types.Entry {

    for (let i = 0; i < entryList.length; i++) {
      const currentEntry = entryList[i];

      if (currentEntry.week === week && currentEntry.fiscalYear === year) {
        return currentEntry;
      }
    }

    return null;
  }

  function formatDate(date: Date): string {
    return '';
  }

  return (
    <>
      <div className="entries fade-in-up">
        <div className="header">
          <span className="title">Entries</span>
        </div>
        <div className="body">
          <div className="entries-list">
            {
              entryList.map((entry: types.Entry, index: number) => (
                <Entry
                  key={index}
                  week={entry.week}
                  year={entry.fiscalYear}
                  autozonerCount={entry.zoners.length}
                  onClick={handleEntryClick}
                  onDelete={handleDeleteClick}
                  listIndex={index} />
              ))
            }
          </div>
          <div className="table-container">
            <table className="styled">
              <thead>
                <tr>
                  <th>Ignition Id</th>
                  <th>CC</th>
                  <th>Name</th>
                  <th>Hire Date</th>
                  <th>Job Code</th>
                  <th>Position</th>
                  <th>Grade</th>
                  <th>Supervisor Id</th>
                  <th>Supervisor</th>
                </tr>
              </thead>
              <tbody>
                {
                  currentEntry ?
                    (
                      currentEntry.zoners.map((zoner: types.AutoZoner, index: number) => (
                        <tr key={index}>
                          <td>{zoner.ignitionId}</td>
                          <td>{zoner.cc}</td>
                          <td>{zoner.name}</td>
                          <td>{formatDate(zoner.hireDate)}</td>
                          <td>{zoner.jobCode}</td>
                          <td>{zoner.position}</td>
                          <td>{zoner.grade}</td>
                          <td>{zoner.supervisorId}</td>
                          <td>{zoner.supervisorName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center' }}>Select an entry to fill this list</td>
                      </tr>
                    )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SearchDialog />
    </>
  );
}

export default Entries;