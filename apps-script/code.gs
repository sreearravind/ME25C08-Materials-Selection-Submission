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
const MAX_TEXT_CHARS = 25000;
const SHEET_NAME = 'Submissions';
const QUIZ_LIVE_SHEET = 'Quiz Live';
const QUIZ_RESULTS_SHEET = 'Quiz Results';
const QUIZ_EVENTS_SHEET = 'Quiz Events';
const MONITOR_PAGE_URL = 'https://sreearravind.github.io/ME25C08-Materials-Selection-Submission/monitor.html';

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

  props.setProperty('CLASS_CODE', INITIAL_CLASS_CODE);
  Logger.log('Spreadsheet: ' + SpreadsheetApp.openById(spreadsheetId).getUrl());
  Logger.log('PDF folder: ' + DriveApp.getFolderById(folderId).getUrl());
  return { spreadsheetId: spreadsheetId, folderId: folderId };
}

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  if (p.action === 'quizMonitor') return quizMonitorResponse_(p);
  return HtmlService.createHtmlOutput('Materials Selection submission and quiz service is active.');
}

function doPost(e) {
  let result;
  try {
    const p = e && e.parameter ? e.parameter : {};
    if (p.action === 'quizEvent') {
      saveQuizEvent_(p);
      result = { ok: true };
    } else if (p.action === 'quizResult') {
      saveQuizResult_(p);
      result = { ok: true };
    } else {
      result = saveSubmission_(p);
    }
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    result = { ok: false, message: safeErrorMessage_(error) };
  }
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
  const json = JSON.stringify({
    type: 'materials-submission-result',
    ok: Boolean(result.ok),
    message: result.message || '',
    submissionId: result.submissionId || '',
    registrationNumber: result.registrationNumber || '',
    submittedAt: result.submittedAt || ''
  }).replace(/</g, '\\u003c');
  const html = '<!doctype html><html><body><script>' +
    'window.parent.postMessage(' + json + ', "*");' +
    '<\/script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
