const entryContainer = document.getElementById('entries-sidebar');

function initEntryViewer() {
  generateEntriesHTML(window.data.entries);

  document.querySelectorAll('div.entry-item').forEach((entryItem) => {
    entryItem.addEventListener('click', (event) => {
      const entryId = event.currentTarget.getAttribute('data-entry-id');

      if (!event.target.classList.contains('delete')) {
        showEntry(entryId);
      }
    });
  });

  document.querySelectorAll('div.entry-item > button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const entryId = button.getAttribute('data-entry-id');

      const response = confirm('Are you sure you want to delete this entry?');

      if (response) {
        ipcRenderer.send('file-events', { name: 'delete-entry', data: { id: entryId } });
        let deleteIndex = -1;
        for (let i = 0; i < window.data.entries.length; i++) {
          const entry = window.data.entries[i];

          if (entry.id === entryId) {
            deleteIndex = i;
          }
          window.data.selectedEntryIndex = -1;
          cleanTable();
          hideSearch();

          window.data.entries.splice(deleteIndex, 1);
          generateEntriesHTML(window.data.entries);

        }


      }

    });
  })
}

function generateEntriesHTML(entries) {
  let html = '';

  // Sort entries


  // Render HTML
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    html +=
      `
    <div class="entry-item" data-entry-id="${entry.id}">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;>
        <span class="title">Week ${entry.week}</span>
        <span class="subtitle">AutoZoners: ${entry.zoners.length}</span>
      </div>
      <button class="delete" data-entry-id="${entry.id}">
        <i class="icon" data-icon="delete"></i>
      </button>
    </div>`;
  }

  entryContainer.innerHTML = html;
}

function showEntry(entryId) {
  let entry = undefined;

  for (let i = 0; i < window.data.entries.length; i++) {
    const currentEntry = window.data.entries[i];

    if (currentEntry.id === entryId) {
      entry = currentEntry;
      window.data.selectedEntryIndex = i;
    }

  }

  if (entry) {
    let html = '';
    const entryTable = document.getElementById('entry-table');
    const entryTableBody = entryTable.querySelector('tbody');

    entryTableBody.innerHTML = '';

    for (let i = 0; i < entry.zoners.length; i++) {
      const zoner = entry.zoners[i];

      html +=
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

    entryTableBody.innerHTML = html;
  }
}
