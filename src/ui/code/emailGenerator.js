
function initGenerator(changes, currentEntryWeek, pastEntryWeek) {
  const generateButton = document.getElementById('generate-email-button');

  generateButton.onclick = () => {
    const changesObject = generateChangesByCategory(changes);

    let hasChanged = false;

    Object.keys(changesObject).forEach((key) => {
      Object.keys(changesObject[key]).forEach((manager) => {
        if (!hasChanged) {
          hasChanged = changesObject[key][manager].length > 0;
        }
      });
    });
    console.log(hasChanged);
    console.log(currentEntryWeek);
    const emailString = generateEmail(changesObject, currentEntryWeek, pastEntryWeek, hasChanged);

    // TODO: Check for no changes at all.

    ipcRenderer.send('file-events', { name: 'file-write', data: { contents: emailString, fileName: 'hc-report.eml' } });
  };
}

/* NOTE: Changes are broken into categories:
  - New Comers:
      Split by manager
  - Cambios en HC:
      Split by manager
  - Bajas? (I do not know the name)
      Split by manager
  
*/

function generateChangesByCategory(changes) {
  const changesObject = {
    down: {
      'Corina': [],
      'Gema': [],
      'Javier': [],
      'Laura': [],
      'Marisol': [],
      'Teresa': [],
    },
    up: {
      'Corina': [],
      'Gema': [],
      'Javier': [],
      'Laura': [],
      'Marisol': [],
      'Teresa': [],
    },
    changes: {
      'Corina': [],
      'Gema': [],
      'Javier': [],
      'Laura': [],
      'Marisol': [],
      'Teresa': [],
    }
  };

  const [changedZoners1, changedZoners2] = changes;

  for (let i = 0; i < changedZoners2.length; i++) {
    const changedZoner1 = changedZoners1[i];
    const changedZoner2 = changedZoners2[i];

    if (changedZoner2.isOld) {
      changesObject.down[changedZoner2.manager].push({ before: changedZoner1, after: changedZoner2 });
    } else if (changedZoner2.isNew) {
      changesObject.up[changedZoner2.manager].push({ before: changedZoner1, after: changedZoner2 });
    } else {
      changesObject.changes[changedZoner2.manager].push({ before: changedZoner1, after: changedZoner2 });
    }
  }

  return changesObject;
}

function generateEmail(changesObject, currentEntryWeek, pastEntryWeek, hasChanged) {
  // const currentWeek = dateToWeek(new Date());
  const emailString = 
  `To: <>
Subject: Cambios HC WK${currentEntryWeek} | Practicantes
X-Unsent: 1
Content-Type: text/html\n
<html>
<head>
  <style>
    body {
      display: flex;
      flex-direction: column;
    }

    * {
      font-family: 'Calibri', serif;
      font-size: 14px;
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
      background-color: #EFEFEF;
    }

    table {
      border-collapse: collapse;
      border: 1px solid black;
      width: 100%;
    }

    table th {
      background-color: #234C76;
      color: #FFFFFF;
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
    
    table td.child-4{
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
  <span>Hello managers!</span>
  <br>
  ${hasChanged ? generateGreeting(currentEntryWeek, pastEntryWeek) : `<span>No hay cambios en el HC de la WK${currentEntryWeek} con respecto a la WK${pastEntryWeek}.</span><br><br>`}
  ${generateChangesHTML(changesObject, pastEntryWeek)}
</body>
</html>`;

  return emailString;
}

function generateChangesHTML(changesObject, pastEntryWeek) {

  let downHTML = '';
  let upHTML = '';
  let changesHTML = ''

  let downHeaderAdded = false;
  let upHeaderAdded = false;
  let changesHeaderAdded = false;

  Object.keys(changesObject).forEach((category) => {
    if (category === 'down') {
      Object.keys(changesObject[category]).forEach((manager) => {
        if (changesObject[category][manager].length > 0) {
          if (!downHeaderAdded) {
            downHTML += 
            `<span class="title">Bajas:</span>
            <br>
            `;
            downHeaderAdded = true;
          }
          downHTML += 
          `<span class="manager">${manager}:</span>
          <br>
          <table class="downs">
            <thead>
              <tr>
                <th>EMP ID</th>
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
            <tbody>
            `;
          for (let i = 0; i < changesObject[category][manager].length; i++) {
            const { before, _ } = changesObject[category][manager][i];
            downHTML += 
            `<tr>
              <td style="text-align: center;" class="child-1">${before.employeeId}</td>
              <td style="text-align: center;" class="child-2">${before.ignitionId}</td>
              <td style="text-align: center;" class="child-3">${before.cc}</td>
              <td class="child-4">${before.name}</td>
              <td style="text-align: center;" class="child-5">${before.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
              <td style="text-align: center;" class="child-6">${before.jobCode}</td>
              <td class="child-7">${before.position}</td>
              <td style="text-align: center;" class="child-8">${before.grade}</td>
              <td style="text-align: center;" class="child-9">${before.supervisorId}</td>
              <td class="child-10">${before.supervisorName}</td>
            </tr>`;
            
          }
          downHTML += `</tbody></table><br>`;
        }
      });
    }
  
    if (category === 'up') {
      Object.keys(changesObject[category]).forEach((manager) => {
        if (changesObject[category][manager].length > 0) {
          if (!upHeaderAdded) {
            upHTML +=
            `<span class="title">New Comers:</span>
            <br>
            `;
            upHeaderAdded = true;
          }

          upHTML +=
          `<span class="manager">${manager}:</span>
          <br>
          <table class="ups">
            <thead>
              <tr>
                <th>EMP ID</th>
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
            <tbody>
              `;
          for (let i = 0; i < changesObject[category][manager].length; i++) {
            const { _, after } = changesObject[category][manager][i];
            upHTML +=
            `<tr>
              <td style="text-align: center;" class="child-1">${after.employeeId}</td>
              <td style="text-align: center;" class="child-2">${after.ignitionId}</td>
              <td style="text-align: center;" class="child-3">${after.cc}</td>
              <td class="child-4">${after.name}</td>
              <td style="text-align: center;" class="child-5">${after.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
              <td style="text-align: center;" class="child-6">${after.jobCode}</td>
              <td class="child-7">${after.position}</td>
              <td style="text-align: center;" class="child-8">${after.grade}</td>
              <td style="text-align: center;" class="child-9">${after.supervisorId}</td>
              <td class="child-10">${after.supervisorName}</td>
            </tr>
            `;
          }

          upHTML += `</tbody></table><br>`;
        }
      });
    }

    if (category === 'changes') {
      Object.keys(changesObject[category]).forEach((manager) => {
        if (changesObject[category][manager].length > 0) {
          if (!changesHeaderAdded) {
            changesHTML +=
            `<span class="title">Cambios en HC:</span>
            <br>
            `;
            changesHeaderAdded = true;
          }

          // console.log(changesObject[category][manager]);
          
          changesHTML +=
          `<span class="manager">${manager}:</span>
          `;

          const casesObject = {
            'CC': [],
            'Job Code, Position and Grade': [],
            'Job Code, Position': [],
            'Supervisor Change': [],
            'Position and team change': []
          };

          for (let i = 0; i < changesObject[category][manager].length; i++) {
            const { before, after } = changesObject[category][manager][i];

            const changedFields = getChangedFields(after.changes);
            
            if (changedFields.length > 3) {
              casesObject['Position and team change'].push({ before, after });
            } else {
              if (changedFields.includes('jobCode') && changedFields.includes('position') && changedFields.includes('grade')) {
                casesObject['Job Code, Position and Grade'].push({ before, after });
              } else if (changedFields.includes('jobCode') && changedFields.includes('position')) {
                casesObject['Job Code, Position'].push({ before, after });
              } else if (changedFields.includes('supervisorId') || changedFields.includes('supervisorName')) {
                casesObject['Supervisor Change'].push({ before, after });
              } else if (changedFields.includes('cc')) {
                casesObject['CC'].push({ before, after });
              }
            }
          }

          // Necesitamos agrupar a los cambiados en categorias de cambios, porque 
          // puede haber 10 cambios en zoners que sean iguales yno quiero poner el titulo
          // Cambio a job position 10 veces jaja

          Object.keys(casesObject).forEach((caseName) => {
            if (casesObject[caseName].length > 0) {
              changesHTML +=
            `${generateChangesTable(casesObject[caseName], caseName, pastEntryWeek)}<br>`;
            }
          });

          changesHTML +=
          ``;
        }
      });
    }
  });

  const htmlString = 
  `${downHTML}
  ${upHTML}
  ${changesHTML}
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
`;
  
  return htmlString;
}

function getChangedFields(changesArray) {
  const changedFields = [];

  for (let i = 0; i < changesArray.length; i++) {
    changedFields.push(changesArray[i].name);
  }

  return changedFields;
}

function generateChangesTable(changes, caseName, pastEntryWeek) {

  // let rowsHTML = [];
  let afterHTML = '';
  let beforeHTML = '';

  for (let i = 0; i < changes.length; i++) {
    const { before, after } = changes[i];
    // background-color: #b7ffb7;
    afterHTML += 
      `<tr>
        <td style="text-align: center; ${after.employeeId !== before.employeeId ? 'background-color: #b7FFb7;' : ''}" class="child-1">${after.employeeId}</td>
        <td style="text-align: center; ${after.ignitionId !== before.ignitionId ? 'background-color: #b7FFb7;' : ''}" class="child-2">${after.ignitionId}</td>
        <td style="text-align: center; ${after.cc !== before.cc ? 'background-color: #b7FFb7;' : ''}" class="child-3">${after.cc}</td>
        <td style="${after.name !== before.name ? 'background-color: #b7FFb7;' : ''}" class="child-4">${after.name}</td>
        <td style="text-align: center; ${after.hireDate !== before.hireDate ? 'background-color: #b7FFb7;' : ''}" class="child-5">${after.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
        <td style="text-align: center; ${after.jobCode !== before.jobCode ? 'background-color: #b7FFb7;' : ''}" class="child-6">${after.jobCode}</td>
        <td style="${after.position !== before.position ? 'background-color: #b7FFb7;' : ''}" class="child-7">${after.position}</td>
        <td style="text-align: center; ${after.grade !== before.grade ? 'background-color: #b7FFb7;' : ''}" class="child-8">${after.grade}</td>
        <td style="text-align: center; ${after.supervisorId !== before.supervisorId ? 'background-color: #b7FFb7;' : ''}" class="child-9">${after.supervisorId}</td>
        <td style="${after.supervisorName !== before.supervisorName ? 'background-color: #b7FFb7;' : ''}" class="child-10">${after.supervisorName}</td>
      </tr>`;

    beforeHTML += 
      `<tr>
        <td style="text-align: center; ${after.employeeId !== before.employeeId ? 'background-color: #ffb7bd;' : ''}" class="child-1">${before.employeeId}</td>
        <td style="text-align: center; ${after.ignitionId !== before.ignitionId ? 'background-color: #ffb7bd;' : ''}" class="child-2">${before.ignitionId}</td>
        <td style="text-align: center; ${after.cc !== before.cc ? 'background-color: #ffb7bd;' : ''}" class="child-3">${before.cc}</td>
        <td style="${after.name !== before.name ? 'background-color: #ffb7bd;' : ''}" class="child-4">${before.name}</td>
        <td style="text-align: center; ${after.hireDate !== before.hireDate ? 'background-color: #ffb7bd;' : ''}" class="child-5">${before.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
        <td style="text-align: center; ${after.jobCode !== before.jobCode ? 'background-color: #ffb7bd;' : ''}" class="child-6">${before.jobCode}</td>
        <td style="${after.position !== before.position ? 'background-color: #ffb7bd;' : ''}" class="child-7">${before.position}</td>
        <td style="text-align: center; ${after.grade !== before.grade ? 'background-color: #ffb7bd;' : ''}" class="child-8">${before.grade}</td>
        <td style="text-align: center; ${after.supervisorId !== before.supervisorId ? 'background-color: #ffb7bd;' : ''}" class="child-9">${before.supervisorId}</td>
        <td style="${after.supervisorName !== before.supervisorName ? 'background-color: #ffb7bd;' : ''}" class="child-10">${before.supervisorName}</td>
      </tr>`;
  }

  const tableHTML = `
  <br>
  <span class="subtitle">${caseName}</span>
  <br>
  <span class="week">WK${dateToWeek(new Date())}</span>
  <br>
  <table>
    <thead>
        <tr>
        <th>EMP ID</th>
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
    <tbody>
      ${afterHTML}
    </tbody>
  </table>
  <br>
  <span class="week">WK${pastEntryWeek}</span>
  <table>
    <thead>
      <tr>
        <th>EMP ID</th>
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
    <tbody>
      ${beforeHTML}
    </tbody>
  </table>`;

  return tableHTML;
}

function generateGreeting(currentEntryWeek, pastEntryWeek) {
  const changesString = 
  `<span>Estos son los cambios que hay en la WK${currentEntryWeek} respecto a la WK${pastEntryWeek}${(currentEntryWeek - pastEntryWeek > 1) ? ` (No hubo reporte en la WK${currentEntryWeek - 1}).` : '.'} Si los cambios son correctos favor de ignorar este correo. De lo contrario, favor de hacer las acciones pertinentes:</span>
  <br><br>`;

  return changesString;

}
