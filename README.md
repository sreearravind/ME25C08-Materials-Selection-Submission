# NE25C08 Course Hub

A mobile-friendly GitHub Pages course hub for **ME25C08 – Metallurgy and Materials Science**. The site combines course activities, student submissions, MCQ assessment and published results in one place.

> The displayed site name is **NE25C08 Course Hub** as requested. The configured course code remains **ME25C08**.

## Current modules

- **Course Hub** – central landing page for all activities
- **AI-Assisted Materials Selection** – individual report submission with AI-use, verification and reflection record
- **Student Technical Presentation** – 11 group-presentation topics, team allocation and one-file team submission
- **MCQ Test** – existing assessment module
- **Evaluation Results** – existing student result/feedback module
- **Course Materials** – placeholder for future Unit I–V PDFs
- **Question Bank** – placeholder for a future centralized question bank

GitHub stores only the website code. Student submission files are sent to the faculty Google Drive through Google Apps Script, while submission metadata is stored in Google Sheets.

## Website structure

```text
dist/
  index.html                 NE25C08 Course Hub
  hub.css
  materials-selection.html   Existing individual AI-assisted assignment
  app.js
  styles.css
  presentation.html          New group presentation module
  presentation.css
  presentation.js
  presentation-data.js       Faculty-editable team/topic allocation
  quiz.html
  quiz.css
  quiz.js
  results.html
  results.css
  results.js
  monitor.html
  monitor.css
  monitor.js
  config.js

apps-script/
  code.gs                    Shared backend for assignment, presentation and quiz
  appsscript.json

.github/workflows/
  deploy-pages.yml           Publishes dist/ to GitHub Pages
```

## Student Technical Presentation module

### Design

- 33 students → **11 teams × 3 students**
- 11 technical topics spanning the four course-file presentation themes
- Team selector from **Team 01** to **Team 11**
- One final file per submission
- Accepted formats: **PDF, PPT and PPTX**
- Strict maximum file size: **10 MB**
- Short AI-use and verification record
- Class submission code
- Team declaration
- Server-generated submission receipt
- Resubmissions retained as separate records
- Dedicated Drive folder with **Team_01 … Team_11** subfolders

### Presentation themes

1. Materials selection for automotive, aerospace and energy applications
2. Nickel-based superalloys and shape-memory alloys
3. Engineering polymers, ceramics and composites in modern products
4. Industrial fatigue, creep and fracture case studies

### Faculty shuffle / allocation

The presentation page is intentionally shipped with team allocations unpublished.

Edit only `dist/presentation-data.js` after the final shuffle.

Example:

```js
window.PRESENTATION_DATA = {
  assignmentsPublished: true,
  topics: [
    // keep the existing topic list
  ],
  teams: [
    {
      team: "01",
      members: ["Student A", "Student B", "Student C"],
      topicId: 7
    }
    // Teams 02–11
  ]
};
```

Set:

```js
assignmentsPublished: true
```

only after all 11 teams and topic IDs are finalized. Until then, students can view the topic list but presentation upload remains disabled.

## Google Apps Script setup

The existing Apps Script deployment is reused, but the deployed script must be updated once to enable presentation uploads.

### Existing installation

1. Open the Google Apps Script project currently used by this course portal.
2. Replace its `Code.gs` with the latest `apps-script/code.gs` from this repository.
3. Confirm that your private `INITIAL_CLASS_CODE` remains set correctly.
4. Run **`setupPresentationModule()`** once.
5. Approve permissions if Google requests them.
6. Open the execution log. It will show:
   - the existing spreadsheet URL
   - the new presentation Drive folder URL
7. Choose **Deploy → Manage deployments**.
8. Edit the existing Web App deployment and create a **New version**.
9. Keep **Execute as: Me** and the same access setting used by the existing portal.
10. Deploy.

The Web App URL normally remains unchanged, so `dist/config.js` does not need to be changed if the same deployment is updated.

### Fresh installation

For a completely new Apps Script project:

1. Change `INITIAL_CLASS_CODE` in `apps-script/code.gs`.
2. Run **`setupProject()`**.
3. Deploy the project as a Web App.
4. Put the resulting `/exec` URL in `dist/config.js`.

`setupProject()` now prepares both the original Materials Selection resources and the presentation resources.

## Presentation storage and record

The presentation backend creates/uses:

### Google Sheet tab

`Presentation Submissions`

Recorded fields include:

- server timestamp
- submission ID
- first submission / resubmission status
- team number
- assigned topic
- submitted-by student
- primary AI tool
- AI contribution
- independently verified technical claim
- verification source
- file name and type
- file size
- Google Drive URL
- client timestamp

### Google Drive

```text
ME25C08 – Student Presentations/
  Team_01/
  Team_02/
  ...
  Team_11/
```

The backend independently enforces the **10 MB** limit and validates PDF/PPT/PPTX signatures. The browser also checks size and extension before upload.

Maximum storage if every team uploads one 10 MB file is approximately **110 MB**. Resubmissions add additional storage because earlier versions are intentionally retained.

## Original Materials Selection module

The original submission form is preserved at:

```text
materials-selection.html
```

It continues to support:

- assigned engineering application
- AI model and prompts
- PDF report up to 3 MB or direct report text
- verification sources
- corrections and reflection
- class submission code
- Drive/Sheet storage
- submission receipt and resubmission tracking

## Configuration

`dist/config.js` contains:

- Apps Script Web App endpoint
- course code
- department/institution label
- 3 MB Materials Selection PDF limit
- 10 MB Presentation file limit
- course-hub display name

Do **not** put the private class submission code in GitHub. It must remain in the Apps Script project properties/setup.

## GitHub Pages deployment

The existing GitHub Actions workflow publishes the `dist` folder whenever changes reach `main`.

Live site pattern:

```text
https://sreearravind.github.io/ME25C08-Materials-Selection-Submission/
```

## Recommended next expansion

The Course Hub already contains placeholders for:

- Unit I PDF materials
- Unit II PDF materials
- Unit III PDF materials
- Unit IV PDF materials
- Unit V PDF materials
- centralized question bank

These can be added later without changing the assignment, presentation, quiz or results modules.
