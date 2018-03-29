// Client ID and API key from the Developer Console
var CLIENT_ID = '631892542298-kfueo4se68pl5phj4rdrr86a0b7fpfn4.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAHj3_ehr34GWvac6F5BuGslpjIAPgd1Us';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";



var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');
var listMajors = document.getElementById('list-majors');
var clearMajorsButton = document.getElementById('clear-majors');
var preContent = document.getElementById('content');
var dateInput = document.getElementById('date-id');
var dateLabel = document.getElementById('date-label-id');
var rowsButton = document.getElementById('rows-button');
var indexToAppend;


/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    listMajors.onclick = listMajorsFunction;
    clearMajorsButton.onclick = clearMajors;
    dateInput.onchange = listMajorsByDay;
    rowsButton.onclick = getTableRows;


  });
}

function getTableRows() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1ryG-tY-cyAQQ7o5_XK3rNanku1TRuMv90b4N1uItHdc',
    range: 'Controle de Entrada/Saída!A1:A'
  }).then(function (response) {
    var range = response.result;
    var rowsNumber = 0;

    if (range.values.length > 0) {
      for (i = 0; i < range.values.length; i++) {
        var row = range.values[i];

        console.log(row[0]);
        rowsNumber = rowsNumber + 1;
      }
      appendPre('Total number of rows (includind title): ' + rowsNumber);
    } else {
      appendPre('No data found.');
    }
  }, function (response) {
    appendPre('Error: ' + response.result.error.message);
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    listMajors.style.display = 'block';
    dateLabel.style.display = 'block';
    dateInput.style.display = 'block';
    rowsButton.style.display = 'block';

    //listMajors();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    listMajors.style.display = 'none';
    dateLabel.style.display = 'none';
    dateInput.style.display = 'none';
    rowsButton.style.display = 'none';

    clearMajors();
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

function clearMajors() {

  while (preContent.firstChild) {
    preContent.removeChild(preContent.firstChild);
  }

  clearMajorsButton.style.display = 'none';
  listMajors.style.display = 'block';
}


// parse a date in yyyy-mm-dd format
function parseDate(input) {
  var parts = input.match(/(\d+)/g);
  // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString(); // months are 0-based
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajorsFunction() {
  listMajors.style.display = 'none';
  clearMajorsButton.style.display = 'block';
  
  while (preContent.firstChild) {
    preContent.removeChild(preContent.firstChild);
  }
  
  getTableRows();

  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1ryG-tY-cyAQQ7o5_XK3rNanku1TRuMv90b4N1uItHdc',
    range: 'Controle de Entrada/Saída!A2:B'
  }).then(function (response) {
    var range = response.result;
    indexToAppend = range.values.length;
    if (range.values.length > 0) {
      appendPre('Nome, Prontuário:');
      for (i = 0; i < range.values.length; i++) {
        var row = range.values[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        appendPre(row[0] + ' - ' + row[1]);
      }
    } else {
      appendPre('No data found.');
    }
  }, function (response) {
    appendPre('Error: ' + response.result.error.message);
  });
}

function listMajorsByDay() {
  var dateToString = dateInput.value;

  var date = parseDate(dateToString);
  clearMajors();

  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1ryG-tY-cyAQQ7o5_XK3rNanku1TRuMv90b4N1uItHdc',
    range: 'Controle de Entrada/Saída!A2:C'
  }).then(function (response) {
    var range = response.result;
    if (range.values.length > 0) {
      for (i = 0; i < range.values.length; i++) {
        var row = range.values[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        if (row[2] === date) {
          console.log(row[2] + ' - ' + date);
          appendPre(row[0] + ' - ' + row[1] + ' - ' + row[2]);
        }
      }
    } else {
      appendPre('No data found.');
    }
  }, function (response) {
    appendPre('Error: ' + response.result.error.message);
  });

}
