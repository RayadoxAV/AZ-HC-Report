
function initComparator(entryData) {
  if (entryData.isFirstReport) {
    const diffViewer = document.getElementById('diff-viewer');
    diffViewer.classList.add('single-view');

    const entry = entryData.entryToUpload;
    const week = dateToWeek(new Date());

    fillFirstDiffView(`First HC File Load - WK${week}`, entry.zoners, '');

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
    console.log(entryData);


    compare(entryData.pastEntry, entryData.entryToUpload);

    const continueButton = document.getElementById('continue-comparator');

    continueButton.innerText = 'Continue';
    continueButton.onclick = () => {
      initGenerator();
      goToStep(2);
    };
  }
}

function fillFirstDiffView(title, zoners, cssClass) {
  let viewHTML = '';

  const fields = ['employeeId', 'ignitionId', 'cc', 'name', 'hireDate', 'jobCode', 'position', 'grade', 'supervisorId', 'supervisorName'];

  for (let i = 0; i < zoners.length; i++) {
    const zoner = zoners[i];
    viewHTML += `<tr>`;
    if (zoner.changes.length > 0) {

      fields.forEach((field) => {

        if (isChanged(field, zoner.changes)) {
          viewHTML += `<td class="before">${zoner[field]}</td>`
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

  const diffView = document.getElementById('diff-view-1');

  const titleSpan = diffView.querySelector('span.title');
  titleSpan.innerText = title;

  const tableBody = diffView.querySelector('table > tbody');
  tableBody.innerHTML = viewHTML;
}

function fillSecondDiffView(title, zoners, cssClass) {
  let viewHTML = '';
  const fields = ['employeeId', 'ignitionId', 'cc', 'name', 'hireDate', 'jobCode', 'position', 'grade', 'supervisorId', 'supervisorName'];

  for (let i = 0; i < zoners.length; i++) {
    const zoner = zoners[i];
    viewHTML += `<tr>`;
    if (zoner.changes.length > 0) {

      fields.forEach((field) => {

        if (isChanged(field, zoner.changes)) {
          viewHTML += `<td class="after">${zoner[field]}</td>`
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
  tableBody.innerHTML = viewHTML;
}

function compare(firstEntry, secondEntry) {
  console.log(firstEntry, secondEntry);

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
    console.log('Same length. Same people');
    // TODO: Check for differences.

    const changedFolks = [];

    for (let i = 0; i < firstZoners.length; i++) {
      const zoner = firstZoners[i];

      for (let j = 0; j < secondZoners.length; j++) {
        const zoner2 = secondZoners[j];

        if (zoner.ignitionId === zoner2.ignitionId) {
          const changes = getChangedFieldsArray(zoner, zoner2);

          if (changes.length > 0) {
            changedFolks.push( { zoner, zoner2, changes} );
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

    fillFirstDiffView(`HC Report from WK${firstEntry.week}`, changedZoners1, 'before');

    const currentWeek = dateToWeek(new Date());

    fillSecondDiffView(`HC Report from WK${currentWeek}`, changedZoners2, 'after');
  } else {
    const [matches, downs, ups] = setTheory(firstZoners, secondZoners);

    console.log(matches, downs, ups);

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
        beofre: zoner.manager,
        after: zoner2.manager
      }
    );
  }

  return changes;
}

function isChanged(field, changes) {
  console.log(changes);
  let changed = false;
  for (let i = 0; i < changes.length; i++) {
    if (field === changes[i].name) {
      changed = true;
      break;
    }
  }

  return changed;
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
            fist: elementA,
            second: elementB
          }
        );
        found = true;
        break;
      }
    }

    if (!found) {
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
      ups.push(elementB);
    }
  }

  return [matches, downs, ups];
}