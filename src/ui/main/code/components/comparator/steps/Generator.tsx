/* 
  Raymundo Paz
  September 2024
*/

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../data/ApplicationState';
import { AutoZoner } from '../../../data/types';

interface GeneratorProps {
  active: boolean;
  className?: string;
}

interface ChangesArray {
  down: {
    'Corina': { before: AutoZoner, after: AutoZoner }[];
    'Gema': { before: AutoZoner, after: AutoZoner }[];
    'Javier': { before: AutoZoner, after: AutoZoner }[];
    'Laura': { before: AutoZoner, after: AutoZoner }[];
    'Marisol': { before: AutoZoner, after: AutoZoner }[];
    'Teresa': { before: AutoZoner, after: AutoZoner }[];
  };
  up: {
    'Corina': { before: AutoZoner, after: AutoZoner }[];
    'Gema': { before: AutoZoner, after: AutoZoner }[];
    'Javier': { before: AutoZoner, after: AutoZoner }[];
    'Laura': { before: AutoZoner, after: AutoZoner }[];
    'Marisol': { before: AutoZoner, after: AutoZoner }[];
    'Teresa': { before: AutoZoner, after: AutoZoner }[];
  };
  changes: {
    'Corina': { before: AutoZoner, after: AutoZoner }[];
    'Gema': { before: AutoZoner, after: AutoZoner }[];
    'Javier': { before: AutoZoner, after: AutoZoner }[];
    'Laura': { before: AutoZoner, after: AutoZoner }[];
    'Marisol': { before: AutoZoner, after: AutoZoner }[];
    'Teresa': { before: AutoZoner, after: AutoZoner }[];
  }
}

const Generator: React.FC<GeneratorProps> = ({ active, className }) => {

  const [appState] = useContext(AppContext);
  const [firstEntry, setFirstEntry] = useState(undefined);
  const [secondEntry, setSecondEntry] = useState(undefined);

  const [changes, setChanges] = useState(undefined);

  useEffect(() => {
    setChanges(appState.comparator.changes);
    setFirstEntry(appState.comparator.firstEntry);
    setSecondEntry(appState.comparator.secondEntry);
  }, [appState.comparator.firstEntry, appState.comparator.secondEntry, appState.comparator.changes]);

  function handleGenerate(): void {
    if (!changes.hasBeenModified) {
      alert('Select an entry or upload a file to continue');
      return;
    }
    const changesObject: ChangesArray = generateChangesByCategory(changes);

    let hasChanged = false;
    Object.keys(changesObject).forEach((key: string) => {
      Object.keys((changesObject as any)[key]).forEach((manager: string) => {
        if (!hasChanged) {
          hasChanged = (changesObject as any)[key][manager].length > 0;
        }
      });
    });

    const emailString: string = generateEmailString(changesObject, hasChanged);
    window.dataBridge.sendEvent('write-email-file', { data: emailString });
  }

  function generateChangesByCategory(changes: { hasBeenModified: boolean, firstChangedZoners: AutoZoner[], secondChangedZoners: AutoZoner[] }): ChangesArray {
    const changesObject: ChangesArray = {
      down: {
        'Corina': [],
        'Gema': [],
        'Javier': [],
        'Laura': [],
        'Marisol': [],
        'Teresa': []
      },
      up: {
        'Corina': [],
        'Gema': [],
        'Javier': [],
        'Laura': [],
        'Marisol': [],
        'Teresa': []
      },
      changes: {
        'Corina': [],
        'Gema': [],
        'Javier': [],
        'Laura': [],
        'Marisol': [],
        'Teresa': []
      }
    };

    const { firstChangedZoners, secondChangedZoners } = changes;

    for (let i = 0; i < secondChangedZoners.length; i++) {
      const firstZoner = firstChangedZoners[i];
      const secondZoner = secondChangedZoners[i];

      if (secondZoner.isOld) {
        if ((changesObject.down as any)[secondZoner.manager]) {
          (changesObject.down as any)[secondZoner.manager].push({ before: firstZoner, after: secondZoner });
        }
      } else if (secondZoner.isNew) {
        if ((changesObject.up as any)[secondZoner.manager]) {
          (changesObject.up as any)[secondZoner.manager].push({ before: firstZoner, after: secondZoner });
        }
      } else {
        if ((changesObject.changes as any)[secondZoner.manager]) {
          (changesObject.changes as any)[secondZoner.manager].push({ before: firstZoner, after: secondZoner });
        }
      }
    }

    return changesObject;
  }

  function generateEmailString(changesObject: ChangesArray, hasChanged: boolean): string {
    const headerString = `To: <>\nSubject: Cambios HC WK${secondEntry.week} | Practicantes\nX-Unsent: 1\nContent-Type: text/html\n`;

    const emailString =
      `${headerString}\n<html>
      <head>
        <style>
          * {
            font-family: 'Aptos', serif;
            font-size: 12px;
          }

          body {
            display: flex;
            flex-direction: column;
          }
          
          span.title {
            font-weight: bold;
            font-size: 16px;
          }

          span.manager {
            font-weight: bold;
            font-size: 14px;
          }
          
          span.subtitle {
            font-weight: bold;
            font-size: 13px;
          }
          span.week {
            font-weight: bold;
            font-size: 13px;
            background-color: #efefef;
          }

          table {
            border-collapse: collapse;
            border: 1px solid black;
            width: 100%;
          }

          table th {
            background-color: #234c76;
            color: #ffffff;
            border: 1px solid black;
            font-size: 13px;
          }

          table td {
            border: 1px solid black;
            padding-left: 8px;
            font-size: 13px;
          }

          table td.center {
            text-align: center;
            background-color: red;
          }

          table td.child-1 {
            width: 7.34%;
          }

          table td.child-2 {
            width: 7.94%;
          }

          table td.child-3 {
            width: 4.94%;
          }

          table td.child-4 {
            width: 19.02%;
          }

          table td.child-5 {
            width: 7.94%;
          }

          table td.child-6 {
            width: 7.26%;
          }

          table td.child-7 {
            width: 15.8%;
          }

          table td.child-8 {
            width: 6.44%;
          }

          table td.child-9 {
            width: 7.79%;
          }

          table td.child-10 {
            width: 16.17%;
          }
          
          div.signature {
            font-family: 'Arial', serif;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <span>Hello Managers!</span>
        <br>
        ${hasChanged ?
        `<span>Estos son los cambios que hay en la WK${secondEntry.week} respecto a la WK${firstEntry.week}. Si los cambios son correctos favor de ignorar este correo. De lo contrario, favor de hacer las acciones pertinentes:</span><br><br>`
        :
        `<span>No hubo cambios en el HC de la WK${secondEntry.week} con respecto a la WK${firstEntry.week}.</span><br><br>`
      }
        ${generateChangesHTML(changesObject)}
        <span>===================================================================================================================================================================================================================</span><br>
        <span class="title">Status practicantes:</span>
        <br>
        <br>
        <span>Gracias!</span>
        <br>
        <br>
        <span>Paco</span>
        <br>
        <br>
        <div class="signature">
          <span>Francisco Ortiz</span><br>
          <span>Project Management Supervisor</span><br>
          <span>Customer Satisfaction</span><br>
          <span>Av Hemingway 11517-A, Complejo Industrial</span><br>
          <span>Chihuahua, Chihuahua 31136, MX</span><br>
          <a href="mailto:francisco.ortiz@autozone.com">francisco.ortiz@autozone.com</a><br>
        <span>AutoZone.com</span><br>
        </div>
      </body>
    </html>`

    return emailString;
  }

  function generateChangesHTML(changesObject: ChangesArray): string {
    let downHTML = '';
    let upHTML = '';
    let changesHTML = '';

    let downHeaderAdded = false;
    let upHeaderAdded = false;
    let changesHeaderAdded = false;

    Object.keys(changesObject).forEach((category: string) => {
      if (category === 'down') {
        Object.keys(changesObject[category]).forEach((manager: string) => {
          if ((changesObject as any)[category][manager].length > 0) {
            if (!downHeaderAdded) {
              downHTML += `<span class="title" style="color: red">Bajas</span><br>`;
              downHeaderAdded = true;
            }
            downHTML +=
              `<span class="manager">${manager}:</span>
            <br>
            <table class="downs">
              <thead>
                <tr>
                  <th>IGNITION ID</th>
                  <th>CC</th>
                  <th>NAME</th>
                  <th>HIRE DATE</th>
                  <th>JOB CODE</th>
                  <th>POSITION</th>
                  <th>GRADE</th>
                  <th>SUPERVISOR ID</th>
                  <th>SUPERVISOR NAME</th>
                </tr>
              </thead>
              <tbody>`;

            for (let i = 0; i < (changesObject as any)[category][manager].length; i++) {
              const before: AutoZoner = (changesObject as any)[category][manager][i].before;

              downHTML +=
                `<tr>
                <td style="text-align: center;" class="child-2">${before.ignitionId}</td>
                <td style="text-align: center;" class="child-3">${before.cc}</td>
                <td class="child-4">${before.name}</td>
                <td style="text-align: center;" class="child-5">${formatDate(before.hireDate)}</td>
                <td style="text-align: center;" class="child-6">${before.jobCode}</td>
                <td class="child-7">${before.position}</td>
                <td style="text-align: center;" class="child-8">${before.grade}</td>
                <td style="text-align: center;" class="child-9">${before.supervisorId}</td>
                <td class="child-10">${before.supervisorName}</td>
              </tr>`;
            }
            downHTML += '</tbody></table><br>';
          }
        });
      }

      if (category === 'up') {
        Object.keys((changesObject as any)[category]).forEach((manager: string) => {
          if ((changesObject as any)[category][manager].length > 0) {
            if (!upHeaderAdded) {
              upHTML +=
                `<span class="title" style="color: green">New Comers:</span><br>`;
              upHeaderAdded = true;
            }

            upHTML +=
              `<span class="manager">${manager}</span>
            <br>
            <table class="ups">
              <thead>
                <tr>
                  <th>IGNITION ID</th>
                  <th>CC</th>
                  <th>NAME</th>
                  <th>HIRE DATE</th>
                  <th>JOB CODE</th>
                  <th>POSITION</th>
                  <th>GRADE</th>
                  <th>SUPERVISOR NAME</th>
                  <th>SUPERVISOR ID</th>
                </tr>
              </thead>
              <tbody>`;

            for (let i = 0; i < (changesObject as any)[category][manager].length; i++) {
              const after: AutoZoner = (changesObject as any)[category][manager][i].after;
              upHTML +=
                `<tr>
              <td style="text-align: center;" class="child-2">${after.ignitionId}</td>
              <td style="text-align: center;" class="child-3">${after.cc}</td>
              <td class="child-4">${after.name}</td>
              <td style="text-align: center;" class="child-5">${formatDate(after.hireDate)}</td>
              <td style="text-align: center;" class="child-6">${after.jobCode}</td>
              <td class="child-7">${after.position}</td>
              <td style="text-align: center;" class="child-8">${after.grade}</td>
              <td style="text-align: center;" class="child-9">${after.supervisorId}</td>
              <td class="child-10">${after.supervisorName}</td>
            </tr>`;
            }
            upHTML += '</tbody></table><br>';
          }
        });
      }

      if (category === 'changes') {
        Object.keys((changesObject as any)[category]).forEach((manager: string) => {
          if ((changesObject as any)[category][manager].length > 0) {
            if (!changesHeaderAdded) {
              changesHTML += '<span>Cambios en HC:</span><br>';
              changesHeaderAdded = true;
            }
            changesHTML += `<span class="manager">${manager}</span><br>`;
            const casesObject = {
              'CC': [] as { before: AutoZoner, after: AutoZoner }[],
              'Job Code, Position and Grade': [] as { before: AutoZoner, after: AutoZoner }[],
              'Job Code, Position': [] as { before: AutoZoner, after: AutoZoner }[],
              'Supervisor Change': [] as { before: AutoZoner, after: AutoZoner }[],
              'Position and team change': [] as { before: AutoZoner, after: AutoZoner }[]
            };

            for (let i = 0; i < (changesObject as any)[category][manager].length; i++) {
              const { before, after }: { before: AutoZoner, after: AutoZoner } = (changesObject as any)[category][manager][i];

              const changedFields = Array.from(after.changes.keys());

              if (changedFields.length > 3) {
                casesObject['Position and team change'].push({ before, after });
              } else {
                if (changedFields.includes('jobCode') && changedFields.includes('position') && changedFields.includes('grade')) {
                  casesObject['Job Code, Position and Grade'].push({ before, after });
                } else if (changedFields.includes('jobCode') && changedFields.includes('position')) {
                  casesObject['Job Code, Position'].push({ before, after });
                } else if (changedFields.includes('supervisorId')) {
                  casesObject['Supervisor Change'].push({ before, after });
                } else if (changedFields.includes('cc')) {
                  casesObject['CC'].push({ before, after });
                }
              }
            }

            Object.keys(casesObject).forEach((caseName: string) => {
              if ((casesObject as any)[caseName].length > 0) {
                changesHTML += `${generateChangesTable((casesObject as any)[caseName], caseName)}<br>`;
              }
            });

            changesHTML += '';
          }
        });
      }
    });

    return `${downHTML}\n${upHTML}\n${changesHTML}`;
  }

  function generateChangesTable(changes: { before: AutoZoner, after: AutoZoner }[], caseName: string): string {
    let afterHTML = '';
    let beforeHTML = '';

    for (let i = 0; i < changes.length; i++) {
      const { before, after } = changes[i];
      afterHTML +=
        `<tr>
          <td style="text-align: center; ${after.changes.has('ignitionId') ? 'background-color: #b7ffb7;' : ''}" class="child-2">${after.ignitionId}</td>
          <td style="text-align: center; ${after.changes.has('cc') ? 'background-color: #b7ffb7;' : ''}" class="child-3">${after.cc}</td>
          <td style="${after.changes.has('name') ? 'background-color: #b7ffb7;' : ''}" class="child-4">${after.name}</td>
          <td style="text-align: center; ${after.changes.has('hireDate') ? 'background-color: #b7ffb7;' : ''}" class="child-5">${formatDate(after.hireDate)}</td>
          <td style="text-align: center; ${after.changes.has('jobCode') ? 'background-color: #b7ffb7;' : ''}" class="child-6">${after.jobCode}</td>
          <td style="${after.changes.has('position') ? 'background-color: #b7ffb7;' : ''}" class="child-7">${after.position}</td>
          <td style="text-align: center; ${after.changes.has('grade') ? 'background-color: #b7ffb7;' : ''}" class="child-8">${after.grade}</td>
          <td style="text-align: center; ${after.changes.has('supervisorId') ? 'background-color: #b7ffb7;' : ''}" class="child-9">${after.supervisorId}</td>
          <td style="${after.changes.has('supervisorId') ? 'background-color: #b7ffb7;' : ''}" class="child-10">${after.supervisorName}</td>
        </tr>`;

      beforeHTML +=
        `<tr>
          <td style="text-align: center; ${before.changes.has('ignitionId') ? 'background-color: #ffb7bd' : ''}" class="child-2">${before.ignitionId}</td>
          <td style="text-align: center; ${before.changes.has('cc') ? 'background-color: #ffb7bd' : ''}" class="child-3">${before.cc}</td>
          <td style="${before.changes.has('name') ? 'background-color: #ffb7bd' : ''}" class="child-4">${before.name}</td>
          <td style="text-align: center; ${before.changes.has('hireDate') ? 'background-color: #ffb7bd' : ''}" class="child-5">${formatDate(before.hireDate)}</td>
          <td style="text-align: center; ${before.changes.has('jobCode') ? 'background-color: #ffb7bd' : ''}" class="child-6">${before.jobCode}</td>
          <td style="${before.changes.has('background-color: #ffb7bd') ? 'position' : ''}" class="child-7">${before.position}</td>
          <td style="text-align: center; ${before.changes.has('grade') ? 'background-color: #ffb7bd' : ''}" class="child-8">${before.grade}</td>
          <td style="text-align: center; ${before.changes.has('supervisorId') ? 'background-color: #ffb7bd' : ''}" class="child-9">${before.supervisorId}</td>
          <td style="${before.changes.has('supervisorId') ? 'background-color: #ffb7bd' : ''}" class="child-10">${before.supervisorName}</td>
        </tr>`;
    }

    const tableHTML =
      `<br>
    <span class="subtitle">${caseName}</span>
    <br>
    <span class="week">WK${secondEntry.week}</span>
    <br>
    <table>
      <thead>
        <tr>
          <th>IGNITION ID</th>
          <th>CC</th>
          <th>NAME</th>
          <th>HIRE DATE</th>
          <th>JOB CODE</th>
          <th>POSITION</th>
          <th>GRADE</th>
          <th>SUPERVISOR ID</th>
          <th>SUPERVISOR NAME</th>
        </tr>
      </thead>
      <tbody>${afterHTML}</tbody>
    </table>
    <br>
    <span class="week">WK${firstEntry.week}</span>
    <br>
    <table>
      <thead>
        <tr>
          <th>IGNITION ID</th>
          <th>CC</th>
          <th>NAME</th>
          <th>HIRE DATE</th>
          <th>JOB CODE</th>
          <th>POSITION</th>
          <th>GRADE</th>
          <th>SUPERVISOR ID</th>
          <th>SUPERVISOR NAME</th>
        </tr>
      </thead>
      <tbody>${beforeHTML}</tbody>
    </table>
    `;

    return tableHTML;
  }

  function formatDate(date: Date): string {
    return `${date.getFullYear()}/${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}/${date.getDate() + 1 < 10 ? '0' : ''}${date.getDate()}`;
  }

  return (
    <div style={{ display: active ? 'flex' : 'none' }} className={`generator ${className}`}>
      <button className="generate-email" onClick={handleGenerate}>Generate</button>
    </div>
  );
};

export default Generator;
