
function initComparator(entryData) {
  if (entryData.isFirstReport) {
    const diffViewer = document.getElementById('diff-viewer');
    diffViewer.classList.add('single-view');

    const entry = entryData.entryToUpload;
    const week = dateToWeek(new Date());

    fillFirstDiffView(`First HC File Load - WK${week}`, generateTableHTML(entry.zoners, 0));

    const continueButton = document.getElementById('continue-comparator');

    continueButton.innerText = 'Upload';
    continueButton.onclick = () => {
      const entry = {
        week: dateToWeek(new Date()),
        zoners: zoners
      };
      ipcRenderer.send('file-events', { name: 'add-entry', data: { entry, isFirst: isFirst } });
    };
  } else {
    // TODO: Compare entries and show differences
    const diffViewer = document.getElementById('diff-viewer');
    diffViewer.classList.remove('single-view');

    const result = compare(entryData.pastEntry, entryData.entryToUpload);

    const continueButton = document.getElementById('continue-comparator');

    continueButton.innerText = 'Continue';
    continueButton.onclick = () => {
      ipcRenderer.send('file-events', {name: 'add-entry', data: { entry: entryData.entryToUpload, isFirst: false, changes: result } });
      // initGenerator();
      // goToStep(2);
    };
  }
}

function fillFirstDiffView(title, zonersHTML) {

  // let viewHTML = '';

  // const fields = ['employeeId', 'ignitionId', 'cc', 'name', 'hireDate', 'jobCode', 'position', 'grade', 'supervisorId', 'supervisorName'];

  // for (let i = 0; i < zoners.length; i++) {
  //   const zoner = zoners[i];
  //   viewHTML += `<tr>`;
  //   if (zoner.changes.length > 0) {

  //     fields.forEach((field) => {

  //       if (isChanged(field, zoner.changes)) {
  //         viewHTML += `<td class="${cssClass}">${zoner[field]}</td>`
  //       } else {
  //         if (field === 'hireDate') {
  //           viewHTML += `<td>${zoner[field].split('T')[0].replace(/\-/g, '/')}</td>`;
  //         } else {
  //           viewHTML += `<td>${zoner[field]}</td>`;
  //         }
  //       }

  //     });

  //     viewHTML += `</tr>`;
  //   } else {
  //     viewHTML +=
  //       `<tr>
  //     <td>${zoner.employeeId}</td>
  //     <td>${zoner.ignitionId}</td>
  //     <td>${zoner.cc}</td>
  //     <td>${zoner.name}</td>
  //     <td>${zoner.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
  //     <td>${zoner.jobCode}</td>
  //     <td>${zoner.position}</td>
  //     <td>${zoner.grade}</td>
  //     <td>${zoner.supervisorId}</td>
  //     <td>${zoner.supervisorName}</td>
  //   </tr>`;
  //   }
  // }

  const diffView = document.getElementById('diff-view-1');

  const titleSpan = diffView.querySelector('span.title');
  titleSpan.innerText = title;

  const tableBody = diffView.querySelector('table > tbody');
  tableBody.innerHTML = zonersHTML;
}

function fillSecondDiffView(title, zonersHTML) {
  const diffView = document.getElementById('diff-view-2');

  const titleSpan = diffView.querySelector('span.title');
  titleSpan.innerText = title;

  const tableBody = diffView.querySelector('table > tbody');
  tableBody.innerHTML = zonersHTML;
  /* let viewHTML = '';
  const fields = ['employeeId', 'ignitionId', 'cc', 'name', 'hireDate', 'jobCode', 'position', 'grade', 'supervisorId', 'supervisorName'];

  for (let i = 0; i < zoners.length; i++) {
    const zoner = zoners[i];
    viewHTML += `<tr>`;
    if (zoner.changes.length > 0) {

      fields.forEach((field) => {

        if (isChanged(field, zoner.changes)) {
          viewHTML += `<td class="${cssClass}">${zoner[field]}</td>`
        } else {
          if (field === 'hireDate') {
            viewHTML += `<td>${zoner[field].split('T')[0].replace(/\-/g, '/')}</td>`;
          } else {
            viewHTML += `<td>${zoner[field]}</td>`;
          }
        }

      });

      viewHTML += `</tr>`;
    } else {
      viewHTML +=
        `<tr>
      <td>${zoner.employeeId}</td>
      <td>${zoner.ignitionId}</td>
      <td>${zoner.cc}</td>
      <td>${zoner.name}</td>
      <td>${zoner.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
      <td>${zoner.jobCode}</td>
      <td>${zoner.position}</td>
      <td>${zoner.grade}</td>
      <td>${zoner.supervisorId}</td>
      <td>${zoner.supervisorName}</td>
    </tr>`;
    }
  }

  const diffView = document.getElementById('diff-view-2');

  const titleSpan = diffView.querySelector('span.title');
  titleSpan.innerText = title;

  const tableBody = diffView.querySelector('table > tbody');
  tableBody.innerHTML = viewHTML; */
}

function compare(firstEntry, secondEntry) {

  const firstZoners = firstEntry.zoners;
  const secondZoners = secondEntry.zoners;

  let matchedZoners = 0;

  for (let i = 0; i < firstZoners.length; i++) {
    const zoner = firstZoners[i];

    for (let j = 0; j < secondZoners.length; j++) {
      const zoner2 = secondZoners[j];

      if (zoner.ignitionId === zoner2.ignitionId) {
        matchedZoners++;
      }
    }
  }

  if (matchedZoners === firstZoners.length) {

    const changedFolks = [];

    for (let i = 0; i < firstZoners.length; i++) {
      const zoner = firstZoners[i];

      for (let j = 0; j < secondZoners.length; j++) {
        const zoner2 = secondZoners[j];

        if (zoner.ignitionId === zoner2.ignitionId) {
          const changes = getChangedFieldsArray(zoner, zoner2);

          if (changes.length > 0) {
            changedFolks.push({ zoner, zoner2, changes });
          }
        }
      }
    }

    const changedZoners1 = changedFolks.map((value) => {
      const zoner = { ...value.zoner };

      zoner.changes = value.changes;
      return zoner;
    });
    const changedZoners2 = changedFolks.map((value) => {
      const zoner = { ...value.zoner2 };

      zoner.changes = value.changes;
      return zoner;
    });

    console.log(changedZoners1);
    console.log(changedZoners2);

    const currentWeek = dateToWeek(new Date());

    fillFirstDiffView(`HC Report from WK${firstEntry.week}`, generateTableHTML(changedZoners1, 0));
    fillSecondDiffView(`HC Report from WK${currentWeek}`, generateTableHTML(changedZoners2, 1));
    return [changedZoners1, changedZoners2];
  } else {
    const [matches, downs, ups] = setTheory(firstZoners, secondZoners);

    console.log(matches, downs, ups);

    // For the matches we have to compare them to see if they have changes.
    // It is guaranteed to have the same number of elements to compare so it should be the same as the comparison above.

    const changedZoners = [];

    for (let i = 0; i < matches.length; i++) {
      const zoner = matches[i].first;
      const zoner2 = matches[i].second;

      const changes = getChangedFieldsArray(zoner, zoner2);

      if (changes.length > 0) {
        changedZoners.push({ zoner, zoner2, changes });
      }
    }

    const changedZoners1 = changedZoners.map((value) => {
      const zoner = { ...value.zoner };
      zoner.changes = value.changes;
      return zoner;
    });

    const changedZoners2 = changedZoners.map((value) => {
      const zoner = { ...value.zoner2 };
      zoner.changes = value.changes;
      return zoner;
    });

    changedZoners1.push(...downs);
    changedZoners1.push(...ups);

    changedZoners2.push(...downs);
    changedZoners2.push(...ups);

    const currentWeek = dateToWeek(new Date());

    fillFirstDiffView(`HC Report from WK${firstEntry.week}`, generateTableHTML(changedZoners1, 0));
    fillSecondDiffView(`HC Report from WK${currentWeek}`, generateTableHTML(changedZoners2, 1));
    return [changedZoners1, changedZoners2];
    // const sameEmployees = [];

    // for (let i = 0; i < firstZoners.length; i++) {
    //   const zoner = firstZoners[i];

    //   for (let j = 0; j < secondZoners.length; j++) {
    //     const zoner2 = secondZoners[j];

    //     if (zoner.ignitionId === zoner2.ignitionId) {
    //       sameEmployees.push({zoner, zoner2});
    //     }
    //   }
    // }

    // // Compare same employees the same way we compare in the first half of this function

    // const changedFolks = [];

    // for (let i = 0; i < firstZoners.length; i++) {
    //   const zoner = firstZoners[i];

    //   for (let j = 0; j < secondZoners.length; j++) {
    //     const zoner2 = secondZoners[j];

    //     if (zoner.ignitionId === zoner2.ignitionId) {
    //       const changes = getChangedFieldsArray(zoner, zoner2);

    //       if (changes.length > 0) {
    //         changedFolks.pop( { zoner, zoner2, changes } );
    //       }
    //     }
    //   }
    // }

    // // Get Zoners that are not in the new array. (They were deleted)
    // for (let i = 0; i < firstZoners.length; i++) {
    //   const zoner = firstZoners[i];
    //   let found = true;

    //   for (let j = 0; j < secondZoners.length; j++) {
    //     const zoner2 = secondZoners[j];

    //     if (zoner.ignitionId === zoner2.ignitionId) {
    //       found = true;
    //     }
    //   }

    //   if (!found) {
    //     console.log(zoner);
    //   }
    // }

    // // Get Zoner that are not in the old array. (They were added)

    // for (let i = 0; i < firstZoners.length; i++) {
    //   const zoner = firstZoners[i];

    //   let found = false;

    //   for (let j = 0; j < secondZoners.length; j++) {
    //     const zoner2 = secondZoners[j];

    //     if (zoner2.ignitionId === zoner.ignitionId) {
    //       found = true;
    //     }
    //   }

    //   if (!found) {
    //     console.log(zoner);
    //   }
    // }

    // const changedZoners1 = changedFolks.map((value) => {
    //   const zoner = { ...value.zoner };

    //   zoner.changes = value.changes;
    //   return zoner;
    // });

    // const changedZoners2 = changedFolks.map((value) => {
    //   const zoner = { ...value.zoner2 };

    //   zoner.changes = value.changes;
    //   return zoner;
    // });



    // fillFirstDiffView(`HC Report from WK${firstEntry.week}`, changedZoners1, 'before');

    // const currentWeek = dateToWeek(new Date());
    // fillSecondDiffView(`HC Report from WK${currentWeek}`, changedZoners2, 'after');


  }
}

function getChangedFieldsArray(zoner, zoner2) {

  const changes = [];

  if (zoner.employeeId !== zoner2.employeeId) {
    changes.push(
      {
        name: 'employeeId',
        displayName: 'Employee ID',
        before: zoner.employeeId,
        after: zoner.employeeId
      }
    );
  }

  if (zoner.ignitionId !== zoner2.ignitionId) {
    changes.push(
      {
        name: 'ignitionId',
        displayName: 'Ignition ID',
        before: zoner.ignitionId,
        after: zoner2.ignitionId
      }
    );
  }

  if (zoner.cc !== zoner2.cc) {
    changes.push(
      {
        name: 'cc',
        displayName: 'Cost Center',
        before: zoner.cc,
        after: zoner2.cc
      }
    );
  }

  if (zoner.name !== zoner2.name) {
    changes.push(
      {
        name: 'name',
        displayName: 'Name',
        before: zoner.name,
        after: zoner2.name
      }
    );
  }

  if (zoner.hireDate !== zoner2.hireDate) {
    changes.push(
      {
        name: 'hireDate',
        displayName: 'Hire date',
        before: zoner.hireDate,
        after: zoner2.hireDate
      }
    );
  }

  if (zoner.jobCode !== zoner2.jobCode) {
    changes.push(
      {
        name: 'jobCode',
        displayName: 'Job Code',
        before: zoner.jobCode,
        after: zoner2.jobCode
      }
    );
  }

  if (zoner.position !== zoner2.position) {
    changes.push(
      {
        name: 'position',
        displayName: 'Position',
        before: zoner.position,
        after: zoner2.position
      }
    );
  }

  if (zoner.grade !== zoner2.grade) {
    changes.push(
      {
        name: 'grade',
        displayName: 'Grade',
        before: zoner.grade,
        after: zoner2.grade
      }
    );
  }

  if (zoner.supervisorId !== zoner2.supervisorId) {
    changes.push(
      {
        name: 'supervisorId',
        displayName: 'Supervisor Id',
        before: zoner.supervisorId,
        after: zoner2.supervisorId
      }
    );
  }

  if (zoner.supervisorName !== zoner2.supervisorName) {
    changes.push(
      {
        name: 'supervisorName',
        displayName: 'Supervisor Name',
        before: zoner.supervisorName,
        after: zoner2.supervisorName
      }
    );
  }

  if (zoner.manager !== zoner2.manager) {
    changes.push(
      {
        name: 'manager',
        displayName: 'Manager',
        before: zoner.manager,
        after: zoner2.manager
      }
    );
  }

  return changes;
}

function isChanged(field, changes) {

  if (changes) {
    let changed = false;
    for (let i = 0; i < changes.length; i++) {
      if (field === changes[i].name) {
        changed = true;
        break;
      }
    }

    return changed;
  }

  return false;
}

function setTheory(a, b) {
  const matches = [];
  const ups = [];
  const downs = [];

  for (let i = 0; i < a.length; i++) {
    const elementA = a[i];
    let found = false;

    for (let j = 0; j < b.length; j++) {
      const elementB = b[j];

      if (elementA.ignitionId === elementB.ignitionId) {
        matches.push(
          {
            first: elementA,
            second: elementB
          }
        );
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

  return [matches, downs, ups];
}

function generateTableHTML(zoners, diffEditorId) {
  let tableHTML = '';
  const fields = ['employeeId', 'ignitionId', 'cc', 'name', 'hireDate', 'jobCode', 'position', 'grade', 'supervisorId', 'supervisorName'];

  for (let i = 0; i < zoners.length; i++) {
    const zoner = zoners[i];

    tableHTML += '<tr>';
    if (zoner.isNew) {
      if (diffEditorId === 1) {
        tableHTML +=
          `
        <td class="after">${zoner.employeeId}</td>
        <td class="after">${zoner.ignitionId}</td>
        <td class="after">${zoner.cc}</td>
        <td class="after">${zoner.name}</td>
        <td class="after">${zoner.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
        <td class="after">${zoner.jobCode}</td>
        <td class="after">${zoner.position}</td>
        <td class="after">${zoner.grade}</td>
        <td class="after">${zoner.supervisorId}</td>
        <td class="after">${zoner.supervisorName}</td>
        `;
      }
    } else if (zoner.isOld) {

      tableHTML +=
        `
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.employeeId}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.ignitionId}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.cc}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.name}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.jobCode}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.position}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.grade}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.supervisorId}</td>
      <td class="${diffEditorId === 0 ? '' : 'before'}">${zoner.supervisorName}</td>`;

    } else if (zoner.changes) {
      for (let j = 0; j < fields.length; j++) {
        const field = fields[j];
        if (isChanged(field, zoner.changes)) {
          if (field === 'hireDate') {
            tableHTML += `<td class="${diffEditorId === 0 ? 'before' : 'after'}">${zoner[field].split('T')[0].replace(/\-/g, '/')}</td>`;
          } else {
            tableHTML += `<td class="${diffEditorId === 0 ? 'before' : 'after'}">${zoner[field]}</td>`;
          }
        } else {
          if (field === 'hireDate') {
            tableHTML += `<td>${zoner[field].split('T')[0].replace(/\-/g, '/')}</td>`;
          } else {
            tableHTML += `<td>${zoner[field]}</td>`;
          }
        }
      }
    } else {
      tableHTML +=
        `<td>${zoner.employeeId}</td>
        <td>${zoner.ignitionId}</td>
        <td>${zoner.cc}</td>
        <td>${zoner.name}</td>
        <td>${zoner.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
        <td>${zoner.jobCode}</td>
        <td>${zoner.position}</td>
        <td>${zoner.grade}</td>
        <td>${zoner.supervisorId}</td>
        <td>${zoner.supervisorName}</td>`;
      //   </tr>`;
    }

    // for (let j = 0; j < fields.length; j++) {
    //   const field = fields[j];

    //   if (zoner.isNew) {
    //     tableHTML +=
    //       `<tr>-==
    //       <td classs="before">${zoner.employeeId}</td>
    //       <td classs="before">${zoner.ignitionId}</td>
    //       <td classs="before">${zoner.cc}</td>
    //       <td classs="before">${zoner.name}</td>
    //       <td classs="before">${zoner.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
    //       <td classs="before">${zoner.jobCode}</td>
    //       <td classs="before">${zoner.position}</td>
    //       <td classs="before">${zoner.grade}</td>
    //       <td classs="before">${zoner.supervisorId}</td>
    //       <td classs="before">${zoner.supervisorName}</td>
    //     </tr>`;
    //   } else if (zoner.isOld) {

    //   } else if (isChanged(field, zoner.changes)) {

    //   } else {
    //     showAsIs = true;
    //   }
    // }

    // if (showAsIs) {
    //   tableHTML += 
    //   `<tr>
    //     <td>${zoner.employeeId}</td>
    //     <td>${zoner.ignitionId}</td>
    //     <td>${zoner.cc}</td>
    //     <td>${zoner.name}</td>
    //     <td>${zoner.hireDate.split('T')[0].replace(/\-/g, '/')}</td>
    //     <td>${zoner.jobCode}</td>
    //     <td>${zoner.position}</td>
    //     <td>${zoner.grade}</td>
    //     <td>${zoner.supervisorId}</td>
    //     <td>${zoner.supervisorName}</td>
    //   </tr>`;
    // }

    tableHTML += '</tr>';
  }


  return tableHTML;
}