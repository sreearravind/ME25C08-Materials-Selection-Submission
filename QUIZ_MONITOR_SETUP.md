# Quiz live-monitor setup

The GitHub Pages files are already deployed. Complete these steps once in the existing Google Apps Script project:

1. Open the Apps Script project used by the submission portal.
2. Replace its `Code.gs` with the current repository file at `apps-script/code.gs`, then save.
3. Select and run `setupQuizMonitoring()` once. Approve permissions if requested.
4. Open **Execution log**. Copy the URL shown after **Private quiz monitor:** and keep it private.
5. Choose **Deploy > Manage deployments > Edit**, select **New version**, and deploy. Keep **Execute as: Me** and **Who has access: Anyone**. Updating the existing deployment preserves the current `/exec` URL in `dist/config.js`.

The private monitor URL contains a key after `#`. The key is not stored in the public GitHub repository. The monitor refreshes every five seconds and shows 30-second heartbeats, page-hidden events, fullscreen exits, and submitted scores.

If the private link is exposed, delete the `QUIZ_MONITOR_KEY` Script Property and run `setupQuizMonitoring()` again to generate a new key.
