# Materials Selection – AI-Assisted Submission Portal

A static, mobile-friendly student submission site designed for GitHub Pages. Google Apps Script receives the form, stores PDF reports in Google Drive, and records submission details in Google Sheets.

## What is included

- Student identity and assigned engineering application
- AI model and complete prompt record
- PDF upload (maximum 3 MB) or direct report text
- Verification sources, corrections and personal reflection
- Student declaration and class submission code
- Server-generated receipt and resubmission status
- Automatic Google Sheet and Drive folder creation

GitHub stores only the website code. Student data and PDFs are sent directly to your Google account.

## 1. Set up Google Apps Script

1. Visit [script.google.com](https://script.google.com) and create a **New project**.
2. Replace the default `Code.gs` with the contents of `apps-script/Code.gs`.
3. In **Project Settings**, enable **Show appsscript.json manifest file in editor**. Replace its contents with `apps-script/appsscript.json`.
4. In `Code.gs`, replace `CHANGE-THIS-CLASS-CODE` with a code known only to your class.
5. Select `setupProject` in the function menu and click **Run**. Approve access to Google Sheets and Google Drive.
6. Open **Execution log** after the run. It gives you the created spreadsheet and Drive-folder links.
7. Click **Deploy → New deployment → Web app**.
8. Set **Execute as** to **Me** and **Who has access** to **Anyone**. Deploy.
9. Copy the Web App URL ending in `/exec`.

Do not place the real class code in the GitHub files. It remains in the private Apps Script project.

## 2. Connect the website

Open `dist/config.js` and replace:

```text
PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE
```

with the `/exec` URL from the Apps Script deployment. You can also edit the course code and institution name in this file.

## 3. Test before sharing

1. Open `dist/index.html` locally or publish the repository.
2. Submit one small test PDF using the class code.
3. Confirm that a new row appears in the Google Sheet.
4. Open the PDF from the Drive link in the sheet.
5. Test once on a mobile phone.

If you modify `Code.gs` later, create a **new Apps Script deployment version** so that the live endpoint receives the update.

## 4. Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and folders from this project, preserving their structure.
3. Commit them to the `main` branch.
4. Open **Repository Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions**.
6. The included workflow publishes the `dist` folder automatically.

The resulting address will normally be:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

## Capacity

For 33 students at 3 MB each, the maximum decoded PDF storage is approximately 99 MB. Browser transfer is temporarily larger because files are Base64-encoded, but Drive stores the original decoded PDF size. This is comfortably below a standard Google account's storage allocation, provided that the account has sufficient free space.

## Operational recommendations

- Keep the Apps Script deployment URL in `config.js`; it is an endpoint, not a password.
- Change the class code for each new assignment.
- Do not make the Drive folder public. The script can save files while the folder remains private to the faculty owner.
- Back up or export the Google Sheet after the deadline.
- Close submissions by changing the Apps Script deployment access or replacing the class code.
- Avoid collecting unnecessary personal information.
- A resubmission is retained as a new row and labeled accordingly; earlier work is not deleted.

## File structure

```text
dist/                       GitHub Pages website
  index.html
  styles.css
  app.js
  config.js
apps-script/                Google Apps Script backend
  Code.gs
  appsscript.json
.github/workflows/          Automated GitHub Pages deployment
  deploy-pages.yml
```
