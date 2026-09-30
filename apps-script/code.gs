/**
 * Google Apps Script backend for the Materials Selection submission portal.
 *
 * SETUP
 * 1. Change INITIAL_CLASS_CODE below.
 * 2. Run setupProject() once and approve the requested Google permissions.
 * 3. Deploy as Web app: Execute as "Me"; access "Anyone".
 * 4. Copy the /exec URL into dist/config.js.
 */

const INITIAL_CLASS_CODE = 'CHANGE-THIS-CLASS-CODE';
const MAX_PDF_BYTES = 3 * 1024 * 1024;
const MAX_PRESENTATION_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 25000;
const SHEET_NAME = 'Submissions';
const PRESENTATION_SHEET = 'Presentation Submissions';
const PRESENTATION_FOLDER_PROPERTY = 'PRESENTATION_FOLDER_ID';
const QUIZ_LIVE_SHEET = 'Quiz Live';
const QUIZ_RESULTS_SHEET = 'Quiz Results';
const QUIZ_EVENTS_SHEET = 'Quiz Events';
const MONITOR_PAGE_URL = 'https://sreearravind.github.io/ME25C08-Materials-Selection-Submission/monitor.html';
const STUDENT_ACCESS_SHEET = 'Student Access';
const AUTH_SESSIONS_SHEET = 'Auth Sessions';
const STUDENT_RESULTS_SHEET = 'Student Results';
const INITIAL_PINS_SHEET = 'Initial Student PINs';
const STUDENT_SESSION_HOURS = 8;
const FACULTY_SESSION_HOURS = 2;
const LEGACY_PERSONALISATION_COMMIT = 'e32fa1ede81527b13c40bc0f9d48adb351b97360';

function setupProject() {
  if (INITIAL_CLASS_CODE === 'CHANGE-THIS-CLASS-CODE') {
    throw new Error('Change INITIAL_CLASS_CODE before running setupProject().');
  }

  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty('SPREADSHEET_ID');
  let folderId = props.getProperty('DRIVE_FOLDER_ID');

  if (!spreadsheetId) {
    const spreadsheet = SpreadsheetApp.create('Materials Selection – AI Submissions');
    const sheet = spreadsheet.getSheets()[0];
    sheet.setName(SHEET_NAME);
    sheet.appendRow([
      'Server timestamp', 'Submission ID', 'Status', 'Student name', 'Registration number',
      'Engineering application', 'AI model', 'Prompts', 'Report mode', 'PDF file name',
      'PDF Drive URL', 'Direct report text', 'Verification sources', 'Corrections / verification',
      'Reflection / key learning', 'Client timestamp'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#10263f').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, 16);
    spreadsheetId = spreadsheet.getId();
    props.setProperty('SPREADSHEET_ID', spreadsheetId);
  }

  if (!folderId) {
    const folder = DriveApp.createFolder('Materials Selection – Student PDF Reports');
    folderId = folder.getId();
    props.setProperty('DRIVE_FOLDER_ID', folderId);
  }

  const presentation = ensurePresentationResources_(spreadsheetId);
  props.setProperty('CLASS_CODE', INITIAL_CLASS_CODE);
  Logger.log('Spreadsheet: ' + SpreadsheetApp.openById(spreadsheetId).getUrl());
  Logger.log('PDF folder: ' + DriveApp.getFolderById(folderId).getUrl());
  Logger.log('Presentation folder: ' + DriveApp.getFolderById(presentation.folderId).getUrl());
  return { spreadsheetId: spreadsheetId, folderId: folderId, presentationFolderId: presentation.folderId };
}

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  if (p.action === 'quizMonitor') return quizMonitorResponse_(p);
  if (p.action === 'authHealth') return authHealthResponse_();
  return HtmlService.createHtmlOutput('Materials Selection submission and quiz service is active.');
}

function authHealthResponse_() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  let sheetsReady = false;
  try {
    if (spreadsheetId) {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      sheetsReady = Boolean(
        ss.getSheetByName(STUDENT_ACCESS_SHEET) &&
        ss.getSheetByName(AUTH_SESSIONS_SHEET) &&
        ss.getSheetByName(STUDENT_RESULTS_SHEET)
      );
    }
  } catch (_) {}
  const payload = {
    service: 'ME25C08 Phase 4 authentication',
    phase4: true,
    facultyPasswordConfigured: Boolean(
      props.getProperty('FACULTY_PASSWORD_HASH') &&
      props.getProperty('FACULTY_PASSWORD_SALT')
    ),
    authPepperConfigured: Boolean(props.getProperty('AUTH_PEPPER')),
    personalisationSheetsReady: sheetsReady
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result;
  const p = e && e.parameter ? e.parameter : {};
  const action = String(p.action || '');
  console.log('doPost action: ' + action);
  try {
    if (action === 'quizEvent') {
      saveQuizEvent_(p);
      result = { ok: true };
    } else if (action === 'quizResult') {
      saveQuizResult_(p);
      result = { ok: true };
    } else if (action === 'presentationSubmission') {
      result = savePresentationSubmission_(p);
    } else if (action === 'studentLogin') {
      result = studentLogin_(p);
    } else if (action === 'facultyLogin') {
      result = facultyLogin_(p);
    } else if (action === 'studentDashboard') {
      result = studentDashboard_(p);
    } else if (action === 'facultyDashboard') {
      result = facultyDashboard_(p);
    } else if (action === 'changeStudentPin') {
      result = changeStudentPin_(p);
    } else if (action === 'logoutSession') {
      result = logoutSession_(p);
    } else if (action === 'facultySaveStudent') {
      result = facultySaveStudent_(p);
    } else if (action === 'facultyResetStudentPin') {
      result = facultyResetStudentPin_(p);
    } else if (action === 'facultyToggleResult') {
      result = facultyToggleResult_(p);
    } else if (action === 'facultyChangePassword') {
      result = facultyChangePassword_(p);
    } else {
      result = saveSubmission_(p);
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    result = {
      responseType: action === 'presentationSubmission' ? 'presentation-submission-result' :
        (action ? action + '-result' : 'materials-submission-result'),
      ok: false,
      message: safeErrorMessage_(error)
    };
  }
  result.requestId = String(p.requestId || '').slice(0, 100);
  return responsePage_(result);
}

function setupQuizMonitoring() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Run setupProject() first.');
  ensureQuizSheets_(SpreadsheetApp.openById(spreadsheetId));
  let key = props.getProperty('QUIZ_MONITOR_KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '').slice(0, 24);
    props.setProperty('QUIZ_MONITOR_KEY', key);
  }
  const monitorUrl = MONITOR_PAGE_URL + '#' + key;
  Logger.log('Private quiz monitor: ' + monitorUrl);
  Logger.log('Quiz spreadsheet: ' + SpreadsheetApp.openById(spreadsheetId).getUrl());
  return { monitorUrl: monitorUrl };
}

function ensureQuizSheets_(spreadsheet) {
  ensureSheet_(spreadsheet, QUIZ_LIVE_SHEET, [
    'Session ID', 'Registration number', 'Student name', 'Status', 'Current question',
    'Answered', 'Page hidden', 'Fullscreen exits', 'Is fullscreen', 'Last seen',
    'Client timestamp'
  ]);
  ensureSheet_(spreadsheet, QUIZ_RESULTS_SHEET, [
    'Server timestamp', 'Session ID', 'Registration number', 'Student name', 'Score',
    'Total', 'Percentage', 'Duration seconds', 'Page hidden', 'Fullscreen exits',
    'Client timestamp'
  ]);
  ensureSheet_(spreadsheet, QUIZ_EVENTS_SHEET, [
    'Server timestamp', 'Session ID', 'Registration number', 'Student name',
    'Event type', 'Detail', 'Client timestamp'
  ]);
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#10263f').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function quizIdentity_(p) {
  const sessionId = required_(p.sessionId, 'Quiz session ID', 80);
  if (!/^[A-Za-z0-9-]{8,80}$/.test(sessionId)) throw new Error('Invalid quiz session ID.');
  const regNo = required_(p.registrationNumber, 'Registration number', 30);
  if (!/^[A-Za-z0-9._\/-]{3,30}$/.test(regNo)) throw new Error('Invalid registration number.');
  return {
    sessionId: sessionId,
    regNo: regNo,
    studentName: required_(p.studentName, 'Student name', 100)
  };
}

function saveQuizEvent_(p) {
  const identity = quizIdentity_(p);
  const allowed = ['start', 'heartbeat', 'page_hidden', 'fullscreen_exit'];
  const eventType = required_(p.eventType, 'Event type', 40);
  if (allowed.indexOf(eventType) < 0) throw new Error('Invalid quiz event type.');
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('The faculty setup is incomplete.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    ensureQuizSheets_(spreadsheet);
    const live = spreadsheet.getSheetByName(QUIZ_LIVE_SHEET);
    const now = new Date();
    const row = findSessionRow_(live, identity.sessionId);
    const values = [[
      sheetSafe_(identity.sessionId), sheetSafe_(identity.regNo), sheetSafe_(identity.studentName),
      'In progress', boundedNumber_(p.currentQuestion, 1, 40), boundedNumber_(p.answered, 0, 40),
      boundedNumber_(p.pageHidden, 0, 999), boundedNumber_(p.fullscreenExits, 0, 999),
      String(p.isFullscreen) === 'true' ? 'true' : 'false', now,
      sheetSafe_(String(p.clientTimestamp || '').slice(0, 50))
    ]];
    if (row) live.getRange(row, 1, 1, values[0].length).setValues(values);
    else live.getRange(live.getLastRow() + 1, 1, 1, values[0].length).setValues(values);

    if (eventType !== 'heartbeat') {
      spreadsheet.getSheetByName(QUIZ_EVENTS_SHEET).appendRow([
        now, sheetSafe_(identity.sessionId), sheetSafe_(identity.regNo), sheetSafe_(identity.studentName),
        eventType, sheetSafe_(String(p.detail || '').slice(0, 200)),
        sheetSafe_(String(p.clientTimestamp || '').slice(0, 50))
      ]);
    }
  } finally {
    lock.releaseLock();
  }
}

function saveQuizResult_(p) {
  const identity = quizIdentity_(p);
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('The faculty setup is incomplete.');
  const score = boundedNumber_(p.score, 0, 40);
  const total = boundedNumber_(p.total, 1, 40);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    ensureQuizSheets_(spreadsheet);
    const results = spreadsheet.getSheetByName(QUIZ_RESULTS_SHEET);
    if (!findSessionRow_(results, identity.sessionId, 2)) {
      const now = new Date();
      results.appendRow([
        now, sheetSafe_(identity.sessionId), sheetSafe_(identity.regNo), sheetSafe_(identity.studentName),
        score, total, Math.round(score / total * 100), boundedNumber_(p.durationSeconds, 1, 86400),
        boundedNumber_(p.pageHidden, 0, 999), boundedNumber_(p.fullscreenExits, 0, 999),
        sheetSafe_(String(p.clientTimestamp || '').slice(0, 50))
      ]);
      spreadsheet.getSheetByName(QUIZ_EVENTS_SHEET).appendRow([
        now, sheetSafe_(identity.sessionId), sheetSafe_(identity.regNo), sheetSafe_(identity.studentName),
        'submit', 'Score ' + score + '/' + total, sheetSafe_(String(p.clientTimestamp || '').slice(0, 50))
      ]);
    }
    const live = spreadsheet.getSheetByName(QUIZ_LIVE_SHEET);
    const row = findSessionRow_(live, identity.sessionId);
    if (row) {
      live.getRange(row, 4).setValue('Submitted');
      live.getRange(row, 10).setValue(new Date());
    }
  } finally {
    lock.releaseLock();
  }
}

function findSessionRow_(sheet, sessionId, column) {
  const col = column || 1;
  if (sheet.getLastRow() < 2) return 0;
  const finder = sheet.getRange(2, col, sheet.getLastRow() - 1, 1)
    .createTextFinder(sessionId).matchEntireCell(true).findNext();
  return finder ? finder.getRow() : 0;
}

function boundedNumber_(value, min, max) {
  const number = Math.round(Number(value));
  if (!isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function quizMonitorResponse_(p) {
  const callback = /^[A-Za-z_$][A-Za-z0-9_$]{0,60}$/.test(String(p.callback || ''))
    ? String(p.callback) : 'receiveQuizMonitor';
  let payload;
  try {
    const props = PropertiesService.getScriptProperties();
    if (!props.getProperty('QUIZ_MONITOR_KEY') || String(p.key || '') !== props.getProperty('QUIZ_MONITOR_KEY')) {
      throw new Error('Invalid monitor key.');
    }
    const spreadsheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
    ensureQuizSheets_(spreadsheet);
    payload = readQuizMonitor_(spreadsheet);
  } catch (error) {
    payload = { ok: false, message: safeErrorMessage_(error) };
  }
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(payload).replace(/</g, '\\u003c') + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function readQuizMonitor_(spreadsheet) {
  const now = new Date();
  const liveSheet = spreadsheet.getSheetByName(QUIZ_LIVE_SHEET);
  const resultSheet = spreadsheet.getSheetByName(QUIZ_RESULTS_SHEET);
  const eventSheet = spreadsheet.getSheetByName(QUIZ_EVENTS_SHEET);
  const liveValues = liveSheet.getLastRow() > 1 ? liveSheet.getRange(2, 1, liveSheet.getLastRow() - 1, 11).getValues() : [];
  const resultStart = Math.max(2, resultSheet.getLastRow() - 99);
  const resultValues = resultSheet.getLastRow() > 1 ? resultSheet.getRange(resultStart, 1, resultSheet.getLastRow() - resultStart + 1, 11).getValues().reverse() : [];
  const eventStart = Math.max(2, eventSheet.getLastRow() - 99);
  const eventValues = eventSheet.getLastRow() > 1 ? eventSheet.getRange(eventStart, 1, eventSheet.getLastRow() - eventStart + 1, 7).getValues().reverse() : [];
  return {
    ok: true,
    generatedAt: now.toISOString(),
    live: liveValues.map(function(r) {
      const lastSeen = dateIso_(r[9]);
      return {
        sessionId: String(r[0]), registrationNumber: String(r[1]), studentName: String(r[2]),
        status: String(r[3]), currentQuestion: r[4], answered: r[5], pageHidden: r[6],
        fullscreenExits: r[7], isFullscreen: String(r[8]), lastSeen: lastSeen,
        active: String(r[3]) === 'In progress' && now.getTime() - new Date(lastSeen).getTime() < 75000
      };
    }),
    results: resultValues.map(function(r) {
      return {
        serverTimestamp: dateIso_(r[0]), registrationNumber: String(r[2]), studentName: String(r[3]),
        score: r[4], total: r[5], percentage: r[6], durationSeconds: r[7],
        pageHidden: r[8], fullscreenExits: r[9]
      };
    }),
    events: eventValues.map(function(r) {
      return {
        serverTimestamp: dateIso_(r[0]), registrationNumber: String(r[2]), studentName: String(r[3]),
        eventType: String(r[4]), detail: String(r[5])
      };
    })
  };
}

function dateIso_(value) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}


function setupPresentationModule() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Run setupProject() first.');
  const result = ensurePresentationResources_(spreadsheetId);
  Logger.log('Presentation spreadsheet: ' + SpreadsheetApp.openById(spreadsheetId).getUrl());
  Logger.log('Presentation folder: ' + DriveApp.getFolderById(result.folderId).getUrl());
  return result;
}

function ensurePresentationResources_(spreadsheetId) {
  const props = PropertiesService.getScriptProperties();
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  ensureSheet_(spreadsheet, PRESENTATION_SHEET, [
    'Server timestamp', 'Submission ID', 'Status', 'Team number', 'Assigned topic',
    'Submitted by', 'Primary AI tool', 'How AI helped', 'Verified technical claim',
    'Verification source', 'Presentation file name', 'File type', 'File size bytes',
    'Drive URL', 'Client timestamp'
  ]);

  let folderId = props.getProperty(PRESENTATION_FOLDER_PROPERTY);
  if (!folderId) {
    const folder = DriveApp.createFolder('ME25C08 – Student Presentations');
    folderId = folder.getId();
    props.setProperty(PRESENTATION_FOLDER_PROPERTY, folderId);
  }
  return { spreadsheetId: spreadsheetId, folderId: folderId };
}

function savePresentationSubmission_(p) {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  const expectedCode = props.getProperty('CLASS_CODE');
  if (!spreadsheetId || !expectedCode) throw new Error('The faculty setup is incomplete.');
  if (String(p.classCode || '') !== expectedCode) throw new Error('The class submission code is incorrect.');

  const teamNumber = required_(p.teamNumber, 'Team number', 2);
  if (!/^(0[1-9]|1[01])$/.test(teamNumber)) throw new Error('Choose a valid team number from 01 to 11.');
  const topicTitle = required_(p.topicTitle, 'Assigned topic', 220);
  const submitterName = required_(p.submitterName, 'Submitted by', 100);
  const aiModel = required_(p.aiModel, 'Primary AI tool', 80);
  const aiContribution = required_(p.aiContribution, 'AI contribution', 350);
  const verifiedClaim = required_(p.verifiedClaim, 'Verified technical claim', 1000);
  const verificationSource = required_(p.verificationSource, 'Verification source', 1000);
  if (p.declaration !== 'yes') throw new Error('The team declaration must be accepted.');

  const base64 = required_(p.presentationBase64, 'Presentation data', 15 * 1024 * 1024);
  const bytes = Utilities.base64Decode(base64);
  if (!bytes.length || bytes.length > MAX_PRESENTATION_BYTES) {
    throw new Error('The presentation file must be between 1 byte and 10 MB.');
  }

  const original = cleanFileName_(p.presentationFileName || 'presentation.pdf');
  const extension = original.toLowerCase().split('.').pop();
  if (['pdf', 'ppt', 'pptx'].indexOf(extension) < 0) {
    throw new Error('Only PDF, PPT and PPTX presentation files are accepted.');
  }
  if (!validPresentationSignature_(bytes, extension)) {
    throw new Error('The uploaded presentation file does not match the selected file type.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const resources = ensurePresentationResources_(spreadsheetId);
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(PRESENTATION_SHEET);
    const previousCount = countPreviousPresentation_(sheet, teamNumber);
    const status = previousCount ? 'Resubmission ' + (previousCount + 1) : 'First submission';
    const submissionId = 'PRES-' + teamNumber + '-' + Utilities.getUuid().split('-')[0].toUpperCase();
    const now = new Date();
    const fileName = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') +
      '_Team_' + teamNumber + '_' + original;
    const mimeType = presentationMimeType_(extension);
    const teamFolder = getOrCreateSubfolder_(DriveApp.getFolderById(resources.folderId), 'Team_' + teamNumber);
    const file = teamFolder.createFile(Utilities.newBlob(bytes, mimeType, fileName));

    sheet.appendRow([
      now, submissionId, status, sheetSafe_(teamNumber), sheetSafe_(topicTitle),
      sheetSafe_(submitterName), sheetSafe_(aiModel), sheetSafe_(aiContribution),
      sheetSafe_(verifiedClaim), sheetSafe_(verificationSource), sheetSafe_(fileName),
      sheetSafe_(extension.toUpperCase()), bytes.length, file.getUrl(),
      sheetSafe_(String(p.clientTimestamp || '').slice(0, 50))
    ]);

    return {
      responseType: 'presentation-submission-result',
      ok: true,
      submissionId: submissionId,
      teamNumber: teamNumber,
      topicTitle: topicTitle,
      submittedAt: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd MMM yyyy, hh:mm a')
    };
  } finally {
    lock.releaseLock();
  }
}

function countPreviousPresentation_(sheet, teamNumber) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  const values = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getDisplayValues();
  return values.reduce(function(count, row) {
    return count + (String(row[0]) === String(teamNumber) ? 1 : 0);
  }, 0);
}

function getOrCreateSubfolder_(rootFolder, name) {
  const folders = rootFolder.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : rootFolder.createFolder(name);
}

function presentationMimeType_(extension) {
  if (extension === 'pdf') return MimeType.PDF;
  if (extension === 'ppt') return 'application/vnd.ms-powerpoint';
  return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
}

function validPresentationSignature_(bytes, extension) {
  if (extension === 'pdf') {
    return bytes.length >= 4 && bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70;
  }
  if (extension === 'ppt') {
    const signature = [208, 207, 17, 224, 161, 177, 26, 225];
    return bytes.length >= 8 && signature.every(function(value, index) { return bytes[index] === value; });
  }
  return bytes.length >= 4 && bytes[0] === 80 && bytes[1] === 75 &&
    (bytes[2] === 3 || bytes[2] === 5 || bytes[2] === 7) &&
    (bytes[3] === 4 || bytes[3] === 6 || bytes[3] === 8);
}




function setupPersonalisation() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Run setupProject() first.');

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  ensurePersonalisationSheets_(spreadsheet);

  if (!props.getProperty('AUTH_PEPPER')) {
    props.setProperty('AUTH_PEPPER', randomToken_());
  }

  let facultyTemporaryPassword = '';
  if (!props.getProperty('FACULTY_PASSWORD_HASH') || !props.getProperty('FACULTY_PASSWORD_SALT')) {
    facultyTemporaryPassword = generateFacultyPassword_();
    setFacultyPassword_(facultyTemporaryPassword);
  }

  const rosterResult = bootstrapStudentRoster_(spreadsheet);
  const resultImport = importLegacyEvaluations_(spreadsheet);
  cleanupExpiredSessions_(spreadsheet);

  Logger.log('Personalisation spreadsheet: ' + spreadsheet.getUrl());
  Logger.log('Student access rows added: ' + rosterResult.added);
  Logger.log('Legacy evaluations imported: ' + resultImport.added);
  Logger.log('Temporary student PINs are in the "' + INITIAL_PINS_SHEET + '" sheet. Delete that sheet after securely distributing the PINs.');
  if (facultyTemporaryPassword) {
    Logger.log('TEMPORARY FACULTY PASSWORD (save this now): ' + facultyTemporaryPassword);
  } else {
    Logger.log('Faculty password already exists. Run resetFacultyPassword() from the Apps Script editor if it needs to be replaced.');
  }

  return {
    spreadsheetUrl: spreadsheet.getUrl(),
    studentRowsAdded: rosterResult.added,
    resultsImported: resultImport.added,
    facultyPasswordGenerated: Boolean(facultyTemporaryPassword)
  };
}

function resetFacultyPassword() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SPREADSHEET_ID')) throw new Error('Run setupProject() first.');
  if (!props.getProperty('AUTH_PEPPER')) props.setProperty('AUTH_PEPPER', randomToken_());
  const password = generateFacultyPassword_();
  setFacultyPassword_(password);
  const spreadsheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  ensurePersonalisationSheets_(spreadsheet);
  removeSessionsForRole_(spreadsheet, 'faculty');
  Logger.log('NEW TEMPORARY FACULTY PASSWORD (save this now): ' + password);
  return { reset: true };
}

function ensurePersonalisationSheets_(spreadsheet) {
  ensureSheet_(spreadsheet, STUDENT_ACCESS_SHEET, [
    'Registration number', 'Student name', 'Assigned application', 'Team number',
    'PIN salt', 'PIN hash', 'Must change PIN', 'Active', 'Created', 'Updated'
  ]);
  ensureSheet_(spreadsheet, AUTH_SESSIONS_SHEET, [
    'Token hash', 'Role', 'Registration number', 'Created', 'Expires', 'Last seen'
  ]);
  ensureSheet_(spreadsheet, STUDENT_RESULTS_SHEET, [
    'Registration number', 'Student name', 'Application', 'Scores JSON', 'Written total',
    'What went well', 'What to improve', 'Updated', 'Published'
  ]);
  ensureSheet_(spreadsheet, INITIAL_PINS_SHEET, [
    'Registration number', 'Student name', 'Temporary PIN', 'Generated'
  ]);
}

function bootstrapStudentRoster_(spreadsheet) {
  const access = spreadsheet.getSheetByName(STUDENT_ACCESS_SHEET);
  const pins = spreadsheet.getSheetByName(INITIAL_PINS_SHEET);
  const existing = {};
  if (access.getLastRow() > 1) {
    access.getRange(2, 1, access.getLastRow() - 1, 1).getDisplayValues().forEach(function(row) {
      existing[String(row[0]).toUpperCase()] = true;
    });
  }

  const url = 'https://raw.githubusercontent.com/sreearravind/ME25C08-Materials-Selection-Submission/' +
    LEGACY_PERSONALISATION_COMMIT + '/dist/app.js';
  const source = UrlFetchApp.fetch(url).getContentText();
  const match = source.match(/const studentAssignments = (\[[\s\S]*?\n\s*\]);/);
  if (!match) throw new Error('Could not read the legacy student roster for personalisation setup.');
  const roster = JSON.parse(match[1]);
  let added = 0;
  const now = new Date();

  roster.forEach(function(student) {
    const reg = String(student.roll || '').trim().toUpperCase();
    if (!reg || existing[reg]) return;
    const pin = generateStudentPin_();
    const salt = randomToken_().slice(0, 24);
    access.appendRow([
      sheetSafe_(reg),
      sheetSafe_(String(student.name || '').trim()),
      sheetSafe_(String(student.application || '').replace(/^Select a material for /i, '').trim()),
      '',
      salt,
      hashSecret_(pin, salt),
      'true',
      'true',
      now,
      now
    ]);
    pins.appendRow([sheetSafe_(reg), sheetSafe_(String(student.name || '').trim()), pin, now]);
    existing[reg] = true;
    added++;
  });
  return { added: added };
}

function importLegacyEvaluations_(spreadsheet) {
  const results = spreadsheet.getSheetByName(STUDENT_RESULTS_SHEET);
  const existing = {};
  if (results.getLastRow() > 1) {
    results.getRange(2, 1, results.getLastRow() - 1, 1).getDisplayValues().forEach(function(row) {
      existing[String(row[0]).toUpperCase()] = true;
    });
  }

  const url = 'https://raw.githubusercontent.com/sreearravind/ME25C08-Materials-Selection-Submission/' +
    LEGACY_PERSONALISATION_COMMIT + '/dist/results.js';
  const source = UrlFetchApp.fetch(url).getContentText();
  const match = source.match(/const evaluations = (\[[\s\S]*?\n\]);\n\nconst criteria =/);
  if (!match) throw new Error('Could not read the legacy evaluation data for secure migration.');

  // The source is an immutable, repository-owned commit used only for one-time migration.
  const evaluations = eval('(' + match[1] + ')');
  let added = 0;
  const now = new Date();
  evaluations.forEach(function(item) {
    const reg = String(item.reg || '').trim().toUpperCase();
    if (!reg || existing[reg]) return;
    const scores = Array.isArray(item.scores) ? item.scores.map(function(v) { return Number(v) || 0; }) : [];
    const total = scores.reduce(function(sum, value) { return sum + value; }, 0);
    results.appendRow([
      sheetSafe_(reg),
      sheetSafe_(String(item.name || '').trim()),
      sheetSafe_(String(item.application || '').trim()),
      JSON.stringify(scores),
      total,
      sheetSafe_(String(item.good || '').trim()),
      sheetSafe_(String(item.improve || '').trim()),
      now,
      'true'
    ]);
    existing[reg] = true;
    added++;
  });
  return { added: added };
}

function studentLogin_(p) {
  const reg = normaliseRegNo_(p.registrationNumber);
  const pin = required_(p.pin, 'PIN', 64);
  rateLimitCheck_('student:' + reg);

  const spreadsheet = personalisationSpreadsheet_();
  const student = findStudentAccess_(spreadsheet, reg);
  if (!student || !student.active || hashSecret_(pin, student.pinSalt) !== student.pinHash) {
    rateLimitFail_('student:' + reg);
    Utilities.sleep(250);
    throw new Error('Registration number or PIN is incorrect.');
  }
  rateLimitClear_('student:' + reg);
  const session = createAuthSession_(spreadsheet, 'student', reg, STUDENT_SESSION_HOURS);
  return {
    responseType: 'studentLogin-result',
    ok: true,
    token: session.token,
    expiresAt: session.expiresAt,
    mustChangePin: student.mustChangePin,
    student: { registrationNumber: student.reg, name: student.name }
  };
}

function facultyLogin_(p) {
  const password = required_(p.password, 'Faculty password', 128);
  rateLimitCheck_('faculty');
  const props = PropertiesService.getScriptProperties();
  const salt = props.getProperty('FACULTY_PASSWORD_SALT');
  const expected = props.getProperty('FACULTY_PASSWORD_HASH');
  if (!salt || !expected || hashSecret_(password, salt) !== expected) {
    rateLimitFail_('faculty');
    Utilities.sleep(300);
    throw new Error('Faculty password is incorrect.');
  }
  rateLimitClear_('faculty');
  const spreadsheet = personalisationSpreadsheet_();
  const session = createAuthSession_(spreadsheet, 'faculty', '', FACULTY_SESSION_HOURS);
  return {
    responseType: 'facultyLogin-result',
    ok: true,
    token: session.token,
    expiresAt: session.expiresAt
  };
}

function studentDashboard_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  const session = validateSession_(spreadsheet, required_(p.token, 'Session token', 200), 'student');
  const student = findStudentAccess_(spreadsheet, session.reg);
  if (!student || !student.active) throw new Error('Student access is inactive.');

  return {
    responseType: 'studentDashboard-result',
    ok: true,
    expiresAt: session.expiresAt,
    dashboard: buildStudentDashboard_(spreadsheet, student)
  };
}

function facultyDashboard_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  validateSession_(spreadsheet, required_(p.token, 'Session token', 200), 'faculty');
  return {
    responseType: 'facultyDashboard-result',
    ok: true,
    dashboard: buildFacultyDashboard_(spreadsheet)
  };
}

function changeStudentPin_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  const session = validateSession_(spreadsheet, required_(p.token, 'Session token', 200), 'student');
  const newPin = validateNewPin_(p.newPin);
  const access = spreadsheet.getSheetByName(STUDENT_ACCESS_SHEET);
  const row = findRowByValue_(access, 1, session.reg);
  if (!row) throw new Error('Student access record was not found.');
  const salt = randomToken_().slice(0, 24);
  access.getRange(row, 5, 1, 6).setValues([[
    salt, hashSecret_(newPin, salt), 'false',
    access.getRange(row, 8).getDisplayValue() || 'true',
    access.getRange(row, 9).getValue() || new Date(),
    new Date()
  ]]);
  return { responseType: 'changeStudentPin-result', ok: true };
}

function logoutSession_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  const token = required_(p.token, 'Session token', 200);
  const hash = hashSessionToken_(token);
  const sheet = spreadsheet.getSheetByName(AUTH_SESSIONS_SHEET);
  const row = findRowByValue_(sheet, 1, hash);
  if (row) sheet.deleteRow(row);
  return { responseType: 'logoutSession-result', ok: true };
}

function facultySaveStudent_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  validateSession_(spreadsheet, required_(p.token, 'Session token', 200), 'faculty');

  const reg = normaliseRegNo_(p.registrationNumber);
  const name = required_(p.studentName, 'Student name', 100);
  const application = String(p.application || '').trim().slice(0, 300);
  const team = String(p.teamNumber || '').trim();
  if (team && !/^(0[1-9]|1[01])$/.test(team)) throw new Error('Team number must be 01 to 11.');
  const active = String(p.active) !== 'false';

  const sheet = spreadsheet.getSheetByName(STUDENT_ACCESS_SHEET);
  let row = findRowByValue_(sheet, 1, reg);
  let temporaryPin = '';
  const now = new Date();

  if (!row) {
    temporaryPin = generateStudentPin_();
    const salt = randomToken_().slice(0, 24);
    sheet.appendRow([
      sheetSafe_(reg), sheetSafe_(name), sheetSafe_(application), sheetSafe_(team),
      salt, hashSecret_(temporaryPin, salt), 'true', active ? 'true' : 'false', now, now
    ]);
    spreadsheet.getSheetByName(INITIAL_PINS_SHEET)
      .appendRow([sheetSafe_(reg), sheetSafe_(name), temporaryPin, now]);
  } else {
    sheet.getRange(row, 1, 1, 4).setValues([[sheetSafe_(reg), sheetSafe_(name), sheetSafe_(application), sheetSafe_(team)]]);
    sheet.getRange(row, 8).setValue(active ? 'true' : 'false');
    sheet.getRange(row, 10).setValue(now);
  }

  return {
    responseType: 'facultySaveStudent-result',
    ok: true,
    temporaryPin: temporaryPin
  };
}

function facultyResetStudentPin_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  validateSession_(spreadsheet, required_(p.token, 'Session token', 200), 'faculty');
  const reg = normaliseRegNo_(p.registrationNumber);
  const access = spreadsheet.getSheetByName(STUDENT_ACCESS_SHEET);
  const row = findRowByValue_(access, 1, reg);
  if (!row) throw new Error('Student was not found.');

  const pin = generateStudentPin_();
  const salt = randomToken_().slice(0, 24);
  access.getRange(row, 5).setValue(salt);
  access.getRange(row, 6).setValue(hashSecret_(pin, salt));
  access.getRange(row, 7).setValue('true');
  access.getRange(row, 10).setValue(new Date());
  removeSessionsForRegistration_(spreadsheet, reg);

  return {
    responseType: 'facultyResetStudentPin-result',
    ok: true,
    registrationNumber: reg,
    temporaryPin: pin
  };
}

function facultyToggleResult_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  validateSession_(spreadsheet, required_(p.token, 'Session token', 200), 'faculty');
  const reg = normaliseRegNo_(p.registrationNumber);
  const sheet = spreadsheet.getSheetByName(STUDENT_RESULTS_SHEET);
  const row = findRowByValue_(sheet, 1, reg);
  if (!row) throw new Error('No migrated evaluation is available for this student.');
  const published = String(p.published) === 'true';
  sheet.getRange(row, 9).setValue(published ? 'true' : 'false');
  sheet.getRange(row, 8).setValue(new Date());
  return { responseType: 'facultyToggleResult-result', ok: true, published: published };
}

function facultyChangePassword_(p) {
  const spreadsheet = personalisationSpreadsheet_();
  validateSession_(spreadsheet, required_(p.token, 'Session token', 200), 'faculty');
  const password = String(p.newPassword || '');
  if (password.length < 10 || password.length > 128) {
    throw new Error('Faculty password must contain at least 10 characters.');
  }
  setFacultyPassword_(password);
  removeSessionsForRole_(spreadsheet, 'faculty');
  return { responseType: 'facultyChangePassword-result', ok: true, loginAgain: true };
}

function buildStudentDashboard_(spreadsheet, student) {
  const result = {
    profile: {
      registrationNumber: student.reg,
      name: student.name,
      application: student.application,
      teamNumber: student.team,
      mustChangePin: student.mustChangePin
    },
    materials: latestMaterialsSubmission_(spreadsheet, student.reg),
    quiz: latestQuizResult_(spreadsheet, student.reg),
    presentation: latestPresentationSubmission_(spreadsheet, student.team),
    evaluation: secureEvaluation_(spreadsheet, student.reg)
  };
  return result;
}

function buildFacultyDashboard_(spreadsheet) {
  const access = spreadsheet.getSheetByName(STUDENT_ACCESS_SHEET);
  const rows = access.getLastRow() > 1
    ? access.getRange(2, 1, access.getLastRow() - 1, 10).getValues() : [];
  const materialsMap = materialsSummaryMap_(spreadsheet);
  const quizMap = quizSummaryMap_(spreadsheet);
  const presentationMap = presentationSummaryMap_(spreadsheet);
  const resultMap = resultSummaryMap_(spreadsheet);

  const students = rows.map(function(r) {
    const reg = String(r[0]).toUpperCase();
    const team = String(r[3] || '');
    return {
      registrationNumber: reg,
      name: String(r[1]),
      application: String(r[2]),
      teamNumber: team,
      mustChangePin: String(r[6]).toLowerCase() === 'true',
      active: String(r[7]).toLowerCase() !== 'false',
      materials: materialsMap[reg] || { count: 0 },
      quiz: quizMap[reg] || null,
      presentation: team ? (presentationMap[team] || null) : null,
      evaluation: resultMap[reg] || null
    };
  });

  return {
    summary: {
      students: students.length,
      activeStudents: students.filter(function(s) { return s.active; }).length,
      materialsSubmitted: students.filter(function(s) { return s.materials && s.materials.count > 0; }).length,
      quizSubmitted: students.filter(function(s) { return Boolean(s.quiz); }).length,
      evaluationsPublished: students.filter(function(s) { return s.evaluation && s.evaluation.published; }).length
    },
    students: students
  };
}

function latestMaterialsSubmission_(spreadsheet, reg) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return { submitted: false, count: 0 };
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();
  let count = 0;
  let latest = null;
  values.forEach(function(r) {
    if (String(r[4]).toUpperCase() !== reg) return;
    count++;
    latest = {
      submitted: true,
      count: count,
      submittedAt: dateIso_(r[0]),
      submissionId: String(r[1]),
      status: String(r[2])
    };
  });
  return latest || { submitted: false, count: 0 };
}

function latestQuizResult_(spreadsheet, reg) {
  const sheet = spreadsheet.getSheetByName(QUIZ_RESULTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { submitted: false };
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).getValues();
  let latest = null;
  values.forEach(function(r) {
    if (String(r[2]).toUpperCase() !== reg) return;
    latest = {
      submitted: true,
      submittedAt: dateIso_(r[0]),
      score: Number(r[4]) || 0,
      total: Number(r[5]) || 0,
      percentage: Number(r[6]) || 0
    };
  });
  return latest || { submitted: false };
}

function latestPresentationSubmission_(spreadsheet, team) {
  if (!team) return { assigned: false, submitted: false };
  const sheet = spreadsheet.getSheetByName(PRESENTATION_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { assigned: true, teamNumber: team, submitted: false };
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues();
  let latest = null;
  values.forEach(function(r) {
    if (String(r[3]).padStart(2, '0') !== String(team).padStart(2, '0')) return;
    latest = {
      assigned: true,
      submitted: true,
      teamNumber: String(team).padStart(2, '0'),
      submittedAt: dateIso_(r[0]),
      submissionId: String(r[1]),
      status: String(r[2]),
      topic: String(r[4])
    };
  });
  return latest || { assigned: true, teamNumber: String(team).padStart(2, '0'), submitted: false };
}

function secureEvaluation_(spreadsheet, reg) {
  const sheet = spreadsheet.getSheetByName(STUDENT_RESULTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return { available: false };
  const row = findRowByValue_(sheet, 1, reg);
  if (!row) return { available: false };
  const r = sheet.getRange(row, 1, 1, 9).getValues()[0];
  const published = String(r[8]).toLowerCase() === 'true';
  if (!published) return { available: true, published: false };
  let scores = [];
  try { scores = JSON.parse(String(r[3] || '[]')); } catch (_) {}
  return {
    available: true,
    published: true,
    application: String(r[2]),
    scores: scores,
    writtenTotal: Number(r[4]) || 0,
    good: String(r[5]),
    improve: String(r[6]),
    updatedAt: dateIso_(r[7])
  };
}

function materialsSummaryMap_(spreadsheet) {
  const map = {};
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return map;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 16).getValues();
  values.forEach(function(r) {
    const reg = String(r[4]).toUpperCase();
    if (!reg) return;
    if (!map[reg]) map[reg] = { count: 0 };
    map[reg].count++;
    map[reg].submittedAt = dateIso_(r[0]);
    map[reg].status = String(r[2]);
  });
  return map;
}

function quizSummaryMap_(spreadsheet) {
  const map = {};
  const sheet = spreadsheet.getSheetByName(QUIZ_RESULTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return map;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 11).getValues().forEach(function(r) {
    const reg = String(r[2]).toUpperCase();
    if (!reg) return;
    map[reg] = {
      submittedAt: dateIso_(r[0]),
      score: Number(r[4]) || 0,
      total: Number(r[5]) || 0,
      percentage: Number(r[6]) || 0
    };
  });
  return map;
}

function presentationSummaryMap_(spreadsheet) {
  const map = {};
  const sheet = spreadsheet.getSheetByName(PRESENTATION_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return map;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 15).getValues().forEach(function(r) {
    const team = String(r[3]).padStart(2, '0');
    if (!team) return;
    map[team] = {
      submittedAt: dateIso_(r[0]),
      status: String(r[2]),
      topic: String(r[4])
    };
  });
  return map;
}

function resultSummaryMap_(spreadsheet) {
  const map = {};
  const sheet = spreadsheet.getSheetByName(STUDENT_RESULTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return map;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues().forEach(function(r) {
    const reg = String(r[0]).toUpperCase();
    if (!reg) return;
    map[reg] = {
      writtenTotal: Number(r[4]) || 0,
      published: String(r[8]).toLowerCase() === 'true'
    };
  });
  return map;
}

function findStudentAccess_(spreadsheet, reg) {
  const sheet = spreadsheet.getSheetByName(STUDENT_ACCESS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const row = findRowByValue_(sheet, 1, reg);
  if (!row) return null;
  const r = sheet.getRange(row, 1, 1, 10).getValues()[0];
  return {
    row: row,
    reg: String(r[0]).toUpperCase(),
    name: String(r[1]),
    application: String(r[2]),
    team: String(r[3]),
    pinSalt: String(r[4]),
    pinHash: String(r[5]),
    mustChangePin: String(r[6]).toLowerCase() === 'true',
    active: String(r[7]).toLowerCase() !== 'false'
  };
}

function personalisationSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('The faculty setup is incomplete.');
  const spreadsheet = SpreadsheetApp.openById(id);
  ensurePersonalisationSheets_(spreadsheet);
  return spreadsheet;
}

function createAuthSession_(spreadsheet, role, reg, hours) {
  cleanupExpiredSessions_(spreadsheet);
  const token = randomToken_() + randomToken_();
  const now = new Date();
  const expires = new Date(now.getTime() + hours * 60 * 60 * 1000);
  spreadsheet.getSheetByName(AUTH_SESSIONS_SHEET).appendRow([
    hashSessionToken_(token), role, sheetSafe_(reg || ''), now, expires, now
  ]);
  return { token: token, expiresAt: expires.toISOString() };
}

function validateSession_(spreadsheet, token, role) {
  cleanupExpiredSessions_(spreadsheet);
  const sheet = spreadsheet.getSheetByName(AUTH_SESSIONS_SHEET);
  const hash = hashSessionToken_(token);
  const row = findRowByValue_(sheet, 1, hash);
  if (!row) throw new Error('Your session has expired. Please sign in again.');
  const r = sheet.getRange(row, 1, 1, 6).getValues()[0];
  const expires = r[4] instanceof Date ? r[4] : new Date(r[4]);
  if (String(r[1]) !== role || isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
    sheet.deleteRow(row);
    throw new Error('Your session has expired. Please sign in again.');
  }
  sheet.getRange(row, 6).setValue(new Date());
  return { role: String(r[1]), reg: String(r[2]).toUpperCase(), expiresAt: expires.toISOString() };
}

function cleanupExpiredSessions_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(AUTH_SESSIONS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return;
  const now = Date.now();
  const values = sheet.getRange(2, 5, sheet.getLastRow() - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    const date = values[i][0] instanceof Date ? values[i][0] : new Date(values[i][0]);
    if (isNaN(date.getTime()) || date.getTime() <= now) sheet.deleteRow(i + 2);
  }
}

function removeSessionsForRegistration_(spreadsheet, reg) {
  const sheet = spreadsheet.getSheetByName(AUTH_SESSIONS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][1]) === 'student' && String(values[i][2]).toUpperCase() === reg) {
      sheet.deleteRow(i + 2);
    }
  }
}

function removeSessionsForRole_(spreadsheet, role) {
  const sheet = spreadsheet.getSheetByName(AUTH_SESSIONS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return;
  const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]) === role) sheet.deleteRow(i + 2);
  }
}

function findRowByValue_(sheet, column, value) {
  if (!sheet || sheet.getLastRow() < 2) return 0;
  const finder = sheet.getRange(2, column, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(value)).matchEntireCell(true).matchCase(false).findNext();
  return finder ? finder.getRow() : 0;
}

function normaliseRegNo_(value) {
  const reg = required_(value, 'Registration number', 30).toUpperCase();
  if (!/^[A-Z0-9._\/-]{3,30}$/.test(reg)) throw new Error('Registration number format is invalid.');
  return reg;
}

function validateNewPin_(value) {
  const pin = String(value || '');
  if (pin.length < 6 || pin.length > 32 || /\s/.test(pin)) {
    throw new Error('PIN must contain 6–32 characters with no spaces.');
  }
  return pin;
}

function generateStudentPin_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
}

function generateFacultyPassword_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 16) + '!';
}

function setFacultyPassword_(password) {
  const props = PropertiesService.getScriptProperties();
  const salt = randomToken_().slice(0, 32);
  props.setProperty('FACULTY_PASSWORD_SALT', salt);
  props.setProperty('FACULTY_PASSWORD_HASH', hashSecret_(password, salt));
}

function hashSecret_(secret, salt) {
  const props = PropertiesService.getScriptProperties();
  const pepper = props.getProperty('AUTH_PEPPER') || '';
  return digestHex_(String(secret) + '|' + String(salt) + '|' + pepper);
}

function hashSessionToken_(token) {
  const pepper = PropertiesService.getScriptProperties().getProperty('AUTH_PEPPER') || '';
  return digestHex_('session|' + String(token) + '|' + pepper);
}

function digestHex_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    const value = b < 0 ? b + 256 : b;
    return ('0' + value.toString(16)).slice(-2);
  }).join('');
}

function randomToken_() {
  return Utilities.getUuid().replace(/-/g, '');
}

function rateLimitKey_(key) {
  return 'AUTH_FAIL_' + digestHex_(String(key)).slice(0, 24);
}

function rateLimitCheck_(key) {
  const value = Number(CacheService.getScriptCache().get(rateLimitKey_(key)) || 0);
  if (value >= 5) throw new Error('Too many failed sign-in attempts. Please wait 10 minutes and try again.');
}

function rateLimitFail_(key) {
  const cache = CacheService.getScriptCache();
  const name = rateLimitKey_(key);
  const value = Number(cache.get(name) || 0) + 1;
  cache.put(name, String(value), 600);
}

function rateLimitClear_(key) {
  CacheService.getScriptCache().remove(rateLimitKey_(key));
}

function saveSubmission_(p) {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  const folderId = props.getProperty('DRIVE_FOLDER_ID');
  const expectedCode = props.getProperty('CLASS_CODE');
  if (!spreadsheetId || !folderId || !expectedCode) throw new Error('The faculty setup is incomplete.');
  if (String(p.classCode || '') !== expectedCode) throw new Error('The class submission code is incorrect.');

  const studentName = required_(p.studentName, 'Student name', 100);
  const regNo = required_(p.registrationNumber, 'Registration number', 30);
  if (!/^[A-Za-z0-9._\/-]{3,30}$/.test(regNo)) throw new Error('The registration number format is invalid.');
  const application = required_(p.application, 'Engineering application', 180);
  const aiModelBase = required_(p.aiModel, 'AI model', 80);
  const aiModel = aiModelBase === 'Other' ? required_(p.otherModel, 'Other AI model', 80) : aiModelBase;
  const prompts = required_(p.prompts, 'Prompt record', 12000);
  const sources = required_(p.sources, 'Verification sources', 5000);
  const verification = required_(p.verification, 'Corrections and verification', 5000);
  const reflection = required_(p.reflection, 'Reflection', 5000);
  if (p.declaration !== 'yes') throw new Error('The student declaration must be accepted.');

  const reportMode = p.reportMode === 'text' ? 'text' : 'pdf';
  let reportText = '';
  let pdfName = '';
  let pdfUrl = '';

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('The submissions sheet is unavailable.');

    const previousCount = countPrevious_(sheet, regNo);
    const status = previousCount ? 'Resubmission ' + (previousCount + 1) : 'First submission';
    const submissionId = Utilities.getUuid().split('-')[0].toUpperCase();
    const now = new Date();

    if (reportMode === 'pdf') {
      const base64 = required_(p.pdfBase64, 'PDF data', 6 * 1024 * 1024);
      const bytes = Utilities.base64Decode(base64);
      if (!bytes.length || bytes.length > MAX_PDF_BYTES) throw new Error('The PDF must be between 1 byte and 3 MB.');
      if (bytes.length < 4 || bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70) {
        throw new Error('The uploaded file is not a valid PDF.');
      }
      const original = cleanFileName_(p.pdfFileName || 'report.pdf');
      pdfName = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '_' + cleanFileName_(regNo) + '_' + original;
      const blob = Utilities.newBlob(bytes, MimeType.PDF, pdfName);
      pdfUrl = DriveApp.getFolderById(folderId).createFile(blob).getUrl();
    } else {
      reportText = required_(p.reportText, 'Report text', MAX_TEXT_CHARS);
    }

    sheet.appendRow([
      now, submissionId, status, sheetSafe_(studentName), sheetSafe_(regNo), sheetSafe_(application),
      sheetSafe_(aiModel), sheetSafe_(prompts), reportMode, sheetSafe_(pdfName), pdfUrl,
      sheetSafe_(reportText), sheetSafe_(sources), sheetSafe_(verification), sheetSafe_(reflection),
      sheetSafe_(String(p.clientTimestamp || '').slice(0, 50))
    ]);

    return {
      ok: true,
      submissionId: submissionId,
      registrationNumber: regNo,
      submittedAt: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd MMM yyyy, hh:mm a')
    };
  } finally {
    lock.releaseLock();
  }
}

function countPrevious_(sheet, regNo) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, 5, lastRow - 1, 1).getDisplayValues();
  return values.reduce(function (count, row) {
    return count + (String(row[0]).toLowerCase() === String(regNo).toLowerCase() ? 1 : 0);
  }, 0);
}

function required_(value, label, maxLength) {
  const text = String(value == null ? '' : value).trim();
  if (!text) throw new Error(label + ' is required.');
  if (text.length > maxLength) throw new Error(label + ' exceeds the permitted length.');
  return text;
}

function cleanFileName_(value) {
  return String(value).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^\.+/, '').slice(0, 100) || 'file.pdf';
}

function sheetSafe_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeErrorMessage_(error) {
  const message = error && error.message ? String(error.message) : 'The submission could not be saved.';
  return message.slice(0, 300);
}

function responsePage_(result) {
  const response = {};
  Object.keys(result || {}).forEach(function(key) {
    if (key !== 'responseType') response[key] = result[key];
  });
  response.type = result && result.responseType ? result.responseType : 'materials-submission-result';
  response.ok = Boolean(result && result.ok);
  response.message = result && result.message ? String(result.message) : '';
  const json = JSON.stringify(response).replace(/</g, '\\u003c');
  const html = '<!doctype html><html><body><script>' +
    'window.parent.postMessage(' + json + ', "*");' +
    '<\/script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
