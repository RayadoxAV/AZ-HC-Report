/* 
  Raymundo Paz
  September 2024
*/

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../data/ApplicationState';
import { AutoZoner, Entry } from '../../../data/types';

interface ViewerProps {
  active: boolean;
  className?: string;
}

const Viewer: React.FC<ViewerProps> = ({ active, className }) => {

  const [appState, setState] = useContext(AppContext);

  const [isFirstEntry, setIsFirstEntry] = useState(false);
  const [firstEntry, setFirstEntry] = useState(undefined);
  // const [secondEntry, setSecondEntry] = useState(undefined);
  const [firstChangedZoners, setFirstChangedZoners] = useState([]);
  const [secondChangedZoners, setSecondChangedZoners] = useState([]);

  useEffect(() => {

    setIsFirstEntry(appState.comparator.isFirstEntry);
    setFirstEntry(appState.comparator.firstEntry);
    // setFirstEntry(appState.comparator.firstEntry);
    // setSecondEntry(appState.comparator.secondEntry);
    compareEntries(appState.comparator.firstEntry, appState.comparator.secondEntry);
  }, [appState.comparator.firstEntry, appState.comparator.secondEntry]);

  function formatDate(date: Date): string {
    return `${date.getFullYear()}/${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}/${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
  }

  function generateEmail(): void {
    if (appState.comparator.isFirstEntry) {
      window.dataBridge.sendEvent('save-entry', { data: { entry: appState.comparator.firstEntry, isFirstEntry: true } });
    } else {
      // Check if we are just comparing or we are also uploading
      if (appState.comparator.uploadEntry) {
        window.dataBridge.sendEvent('save-entry', { data: { entry: appState.comparator.secondEntry, isFirstEntry: false } });
      } else {
        setState({ type: 'setIsFirstEntry', isFirstEntry: false });
        setState({ type: 'setComparatorStep', comparatorStep: 2 });
      }
    }
  }

  function compareEntries(firstEntry: Entry, secondEntry: Entry): void {
    if (!firstEntry || !secondEntry) {
      return;
    }

    const firstZoners = firstEntry.zoners;
    const secondZoners = secondEntry.zoners;

    const { matches, ups, downs } = setTheory(firstZoners, secondZoners);

    const changedZoners = [];

    for (let i = 0; i < matches.length; i++) {
      const firstZoner = matches[i].first;
      const secondZoner = matches[i].second;

      const changes = getChangedFieldsArray(firstZoner, secondZoner);

      if (changes.size > 0) {
        changedZoners.push({ firstZoner, secondZoner, changes });
      }
    }

    const tempFirstChangedZoners = changedZoners.map((value) => {
      const zoner = { ...value.firstZoner };
      zoner.changes = value.changes;
      return zoner;
    });

    const tempSecondChangedZoners = changedZoners.map((value) => {
      const zoner = { ...value.secondZoner };
      zoner.changes = value.changes;
      return zoner;
    });

    tempFirstChangedZoners.push(...downs);
    tempFirstChangedZoners.push(...ups);

    tempSecondChangedZoners.push(...downs);
    tempSecondChangedZoners.push(...ups);

    setFirstChangedZoners([...tempFirstChangedZoners]);
    setSecondChangedZoners([...tempSecondChangedZoners]);

    setState({ type: 'setComparatorChanges', changes: { hasBeenModified: true, firstChangedZoners: [...tempFirstChangedZoners], secondChangedZoners: [...tempSecondChangedZoners] } });
  }

  function setTheory(a: AutoZoner[], b: AutoZoner[]): { matches: { first: AutoZoner, second: AutoZoner }[], ups: AutoZoner[], downs: AutoZoner[] } {
    const matches: { first: AutoZoner, second: AutoZoner }[] = [];
    const ups = [];
    const downs = [];

    for (let i = 0; i < a.length; i++) {
      const elementA = a[i];
      let found = false;

      for (let j = 0; j < b.length; j++) {
        const elementB = b[j];
        if (elementA.ignitionId === elementB.ignitionId) {
          matches.push({
            first: elementA,
            second: elementB
          });
          found = true;
          break;
        }
      }

      if (!found) {
        elementA.isOld = true;
        downs.push(elementA);
      }
    }

    for (let i = 0; i < b.length; i++) {
      const elementB = b[i];
      let found = false;

      for (let j = 0; j < a.length; j++) {
        const elementA = a[j];

        if (elementB.ignitionId === elementA.ignitionId) {
          found = true;
          break;
        }
      }

      if (!found) {
        elementB.isNew = true;
        ups.push(elementB);
      }
    }

    return {
      matches,
      ups,
      downs
    };
  }


  function getChangedFieldsArray(firstZoner: AutoZoner, secondZoner: AutoZoner): Map<string, { name: string, displayName: string, before: unknown, after: unknown }> {
    const changes = new Map<string, { name: string, displayName: string, before: unknown, after: unknown }>();

    if (firstZoner.ignitionId !== secondZoner.ignitionId) {
      changes.set('ignitionId', {
        name: 'ignitionId',
        displayName: 'Ignition Id',
        before: firstZoner.ignitionId,
        after: secondZoner.ignitionId
      });
    }

    if (firstZoner.cc !== secondZoner.cc) {
      changes.set('cc', {
        name: 'cc',
        displayName: 'Cost Center',
        before: firstZoner.cc,
        after: secondZoner.cc
      });
    }
    // const firstDate = `${firstZoner.hireDate.getFullYear()}/${firstZoner.hireDate.getMonth()}/${firstZoner.hireDate.getDate()}`;
    // const secondDate = `${secondZoner.hireDate.getFullYear()}/${secondZoner.hireDate.getMonth()}/${secondZoner.hireDate.getDate()}`;

    // console.log(firstDate, secondDate);

    // // if (firstZoner.hireDate !== secondZoner.hireDate) {
    // //   changes.push({
    // //     name: 'hireDate',
    // //     displayName: 'Hire date',
    // //     before: firstZoner.hireDate,
    // //     after: secondZoner.hireDate
    // //   });
    // // }

    if (firstZoner.jobCode !== secondZoner.jobCode) {
      changes.set('jobCode', {
        name: 'jobCode',
        displayName: 'Job Code',
        before: firstZoner.jobCode,
        after: secondZoner.jobCode
      });
    }

    if (firstZoner.position !== secondZoner.position) {
      changes.set('position', {
        name: 'position',
        displayName: 'Position',
        before: firstZoner.position,
        after: secondZoner.position
      });
    }

    if (firstZoner.grade !== secondZoner.grade) {
      changes.set('grade', {
        name: 'grade',
        displayName: 'grade',
        before: firstZoner.grade,
        after: secondZoner.grade
      });
    }

    if (firstZoner.supervisorId !== secondZoner.supervisorId) {
      changes.set('supervisorId', {
        name: 'supervisorId',
        displayName: 'Supervisor Id',
        before: firstZoner.supervisorId,
        after: secondZoner.supervisorId
      });
    }

    if (firstZoner.manager !== secondZoner.manager) {
      changes.set('manager', {
        name: 'manager',
        displayName: 'Manager',
        before: firstZoner.manager,
        after: secondZoner.manager
      });
    }

    return changes;
  }

  function fillDiffView(zoners: AutoZoner[], tableNumber: number) {
    const rows = [];

    for (let i = 0; i < zoners.length; i++) {
      const zoner = zoners[i];
      if (zoner.isNew) {
        if (tableNumber === 1) {
          rows.push(
            <tr key={i}>
              <td className="new">{zoner.ignitionId}</td>
              <td className="new">{zoner.cc}</td>
              <td className="new">{zoner.name}</td>
              <td className="new">{formatDate(zoner.hireDate)}</td>
              <td className="new">{zoner.jobCode}</td>
              <td className="new">{zoner.position}</td>
              <td className="new">{zoner.grade}</td>
              <td className="new">{zoner.supervisorId}</td>
              <td className="new">{zoner.supervisorName}</td>
            </tr>
          );
        }
      } else if (zoner.isOld) {
        if (tableNumber === 0) {
          rows.push(
            <tr key={i}>
              <td className="old">{zoner.ignitionId}</td>
              <td className="old">{zoner.cc}</td>
              <td className="old">{zoner.name}</td>
              <td className="old">{formatDate(zoner.hireDate)}</td>
              <td className="old">{zoner.jobCode}</td>
              <td className="old">{zoner.position}</td>
              <td className="old">{zoner.grade}</td>
              <td className="old">{zoner.supervisorId}</td>
              <td className="old">{zoner.supervisorName}</td>
            </tr>
          );
        }
      } else if (zoner.changes) {
        if (zoner.changes.size > 0) {
          rows.push(
            <tr key={i}>
              <td className={`${zoner.changes.has('ignitionId') ? tableNumber === 0 ? 'old' : 'new' : ''}`}>{zoner.ignitionId}</td>
              <td className={`${zoner.changes.has('cc') ? tableNumber === 0 ? 'old' : 'new' : ''}`}>{zoner.cc}</td>
              <td>{zoner.name}</td>
              <td>{formatDate(zoner.hireDate)}</td>
              <td className={`${zoner.changes.has('jobCode') ? tableNumber === 0 ? 'old' : 'new' : ''}`}>{zoner.jobCode}</td>
              <td className={`${zoner.changes.has('position') ? tableNumber === 0 ? 'old' : 'new' : ''}`}>{zoner.position}</td>
              <td className={`${zoner.changes.has('grade') ? tableNumber === 0 ? 'old' : 'new' : ''}`}>{zoner.grade}</td>
              <td className={`${zoner.changes.has('supervisorId') ? tableNumber === 0 ? 'old' : 'new' : ''}`}>{zoner.supervisorId}</td>
              <td className={`${zoner.changes.has('supervisorId') ? tableNumber === 0 ? 'old' : 'new' : ''}`}>{zoner.supervisorName}</td>
            </tr>
          );
        }
      } else {
        rows.push(
          <tr key={i}>
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
        )
      }

    }
    return rows;

  }

  return (
    <div style={{ display: active ? 'grid' : 'none' }} className={`viewer ${className}`}>
      <div className={`tables-container ${isFirstEntry ? 'single-table-view' : 'double-table-view'}`}>
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
                appState.comparator.firstEntry ?
                  (
                    appState.comparator.isFirstEntry ?
                      (
                        fillDiffView(appState.comparator.firstEntry.zoners, 0)
                      ) : (
                        fillDiffView(firstChangedZoners, 0)
                      )
                  ) : (
                    <tr style={{ textAlign: 'center' }}>
                      <td colSpan={9}>Select an entry to continue</td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
        <div className="table-container" style={{ display: isFirstEntry ? 'none' : '' }}>
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
                appState.comparator.secondEntry ?
                  (
                    fillDiffView(secondChangedZoners, 1)
                  ) : (
                    <tr style={{ textAlign: 'center' }}>
                      <td colSpan={9}>No data for display</td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
      </div>
      <button className="compare-button" onClick={generateEmail}>{isFirstEntry ? 'Upload' : 'Continue'}</button>
    </div>
  );
}

export default Viewer;
