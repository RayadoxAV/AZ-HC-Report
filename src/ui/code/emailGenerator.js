
function initGenerator(changes) {
  const generateButton = document.getElementById('generate-email-button');

  generateButton.onclick = () => {
    const changesObject = generateChangesByCategory(changes);
    const emailString = generateEmail(changesObject);

    console.log(emailString);
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

function generateEmail(changesObject) {
  const emailString = 
  `To: <>
Subject: HC Something Something
X-Unsent: 1
Content-Type: text/html\n
<html>
<head></head>
<body>
  ${generateChangesHTML(changesObject)}
</body>
</html>`;

  return emailString;
}

function generateChangesHTML(changesObject) {
  let changesHTML = '';

  let downHTML = '';

  let titleAdded = false;

  Object.keys(changesObject).forEach((category) => {
    if (category === 'down') {
      Object.keys(changesObject[category]).forEach((manager) => {
        if (changesObject[category][manager].length > 0) {
          if (!titleAdded) {
            downHTML += '<span class="category-title">Bajas:</span>';
            titleAdded = true;
          }
          console.log(changesObject[category][manager]);
          downHTML += `<span class="manager-name">${manager}</span>`;
          for (let i = 0; i < changesObject[category][manager].length; i++) {
            const { before, after } = changesObject[category][manager][i];

            downHTML += `<span>${before.name}</span>`;
          }
        }
      });
    }  
  });
  
  console.log(downHTML);

  return changesHTML;
}
