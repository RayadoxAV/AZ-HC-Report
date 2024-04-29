const searchDialogInnerHTML = 
`
  <input type="text" placeholder="Search">
  <span class="indicator">0 / 0</span>
  <button data-action="up">
    <i class="icon" data-icon="up"></i>
  </button>
  <button data-action="down">
    <i class="icon" data-icon="down"></i>
  </button>
  <button data-action="close">
    <i class="icon" data-icon="close"></i>
  </button>
`;

  const entryTable = document.getElementById('entry-table')
  const entryTableBody = entryTable.querySelector('tbody');

const searchState = {
  matches: [],
  currentMatch: -1,
  currentRow: -1,
};

function toggleSearch() {
  if (window.data.selectedEntryIndex !== -1) {
    if (window.data.isSearchBoxVisible) {
      document.querySelector('div.search-dialog').remove();
      window.data.isSearchBoxVisible = false;
    } else {
      const searchDialog = document.createElement('div');
      searchDialog.classList.add('search-dialog');
  
      searchDialog.innerHTML = searchDialogInnerHTML;
  
      document.querySelector('body').appendChild(searchDialog);
  
      window.data.isSearchBoxVisible = true;
  
      const closeButton = searchDialog.querySelector('button[data-action="close"]');
      closeButton.addEventListener('click', () => {
        cleanRow(searchState.currentRow);
        toggleSearch();
      });
  
      const upButton = searchDialog.querySelector('button[data-action="up"]');
      const downButton = searchDialog.querySelector('button[data-action="down"]');
  
      upButton.addEventListener('click', () => {
        cleanRow(searchState.currentRow);
        if (searchState.currentMatch - 1 > -1) {
          searchState.currentMatch = searchState.currentMatch - 1;
        } else {
          searchDialog.currentMatch = searchState.matches.length - 1;
        }

        searchState.currentRow = searchState.matches[searchState.currentMatch].row;

        goToMatch(searchState.currentRow);
      });

      downButton.addEventListener('click', () => {
        cleanRow(searchState.currentRow);
        if (searchState.currentMatch + 1 < searchState.matches.length) {
          searchState.currentMatch = searchState.currentMatch + 1;
        } else {
          searchState.currentMatch = 0;
        }
        searchState.currentRow = searchState.matches[searchState.currentMatch].row;
        
        goToMatch(searchState.currentRow);
      });

      const input = searchDialog.querySelector('input');
      input.addEventListener('keyup', (event) => {
        handleSearchEvent(event);
      });
      input.focus();
    }
  }
}

function handleSearchEvent(event) {

  if (event.target.value === '') {
    cleanRow(searchState.currentRow);
    searchState.matches = [];
    searchState.currentMatch = -1;
    searchState.currentRow = -1;
    const indicator = document.querySelector('div.search-dialog > span.indicator');
    indicator.innerText = `${searchState.currentMatch + 1} / ${searchState.matches.length}`;

    return;
  }
  
  if (event.key === 'Shift') {
    return;
  }

  if (event.ctrlKey) {
    return;
  }

  if (event.key === 'Enter') {
    cleanRow(searchState.currentRow);
    if (searchState.currentMatch + 1 < searchState.matches.length) {
      searchState.currentMatch = searchState.currentMatch + 1;
    } else {
      searchState.currentMatch = 0;
    }
    searchState.currentRow = searchState.matches[searchState.currentMatch].row;
    
    goToMatch(searchState.currentRow);
  } else {
    if (event.target.value.length > 3) {
      const matches = searchTable(event.target.value.toLocaleLowerCase());
      searchState.matches = [...matches];

      if (searchState.matches.length > 0) {
        cleanRow(searchState.currentRow);
        searchState.currentMatch = 0;
        searchState.currentRow = searchState.matches[searchState.currentMatch].row;
        
        goToMatch(searchState.currentRow);
      }
    }
  }
}

function goToMatch(matchRowIndex) {
  const rows = [...entryTableBody.querySelectorAll('tr')];

  const row = rows[matchRowIndex];
  row.scrollIntoView({block: 'center', behavior: 'smooth' });
  row.style.backgroundColor = '#fff4f4';
  row.style.border = '1px solid #ec6b68';

  const indicator = document.querySelector('div.search-dialog > span.indicator');
  indicator.innerText = `${searchState.currentMatch + 1} / ${searchState.matches.length}`;
}

function searchTable(searchValue) {
  const entry = window.data.entries[window.data.selectedEntryIndex];

  const matches = [];

  for (let i = 0; i < entry.zoners.length; i++) {
    const zoner = entry.zoners[i];
    const ignition = zoner.ignitionId;
    const name = zoner.name;
    const jobCode = zoner.name;
    const position = zoner.position;
    const supervisorIgnition = zoner.supervisorId;
    const supervisorName = zoner.supervisorName;

    const match = {
      row: i,
      cols: []
    };

    if (ignition.toString().includes(searchValue)) {
      match.cols.push(1);
    }

    if (name.toLocaleLowerCase().includes(searchValue)) {
      match.cols.push(3);
    }

    if (jobCode.toLocaleLowerCase().includes(searchValue)) {
      match.cols.push(5);
    }
  
    if (position.toLocaleLowerCase().includes(searchValue)) {
      match.cols.push(6);
    }

    if (supervisorIgnition.toString().includes(searchValue)) {
      match.cols.push(8);
    }

    if (supervisorName.toLocaleLowerCase().includes(searchValue)) {
      match.cols.push(9);
    }

    if (match.cols.length > 0) {
      matches.push(match);
    }
  }

  return matches;
}

function cleanRow(previousRowIndex) {
  if (previousRowIndex === -1) {
    return;
  }
  const rows = [...entryTableBody.querySelectorAll('tr')];
  const row = rows[previousRowIndex];
  row.style.backgroundColor = 'unset';
  row.style.border = 'unset';
}

function cleanTable() {
  entryTableBody.innerHTML = '';
}

function hideSearch() {
  const searchDialog = document.querySelector('div.search-dialog');

  if (searchDialog) {
    searchDialog.remove();
    window.data.isSearchBoxVisible = false;
  }
}