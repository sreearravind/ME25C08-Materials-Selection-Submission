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

function doGet() {
  return HtmlService.createHtmlOutput('Materials Selection submission service is active.');
}

function doPost(e) {
  let result;
  try {
    result = saveSubmission_(e && e.parameter ? e.parameter : {});
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    result = { ok: false, message: safeErrorMessage_(error) };
  }
  return responsePage_(result);
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
