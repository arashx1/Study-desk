# ReEntry: research and source-change demo

1. Restart the backend with `scripts/start_backend.ps1`, then reload ReEntry at `chrome://extensions` and reopen its panel.
2. Create a workspace and start a session. Open http://127.0.0.1:8765/fixtures/change-demo. This page is labelled synthetic test content.
3. Select the sentence about Haversian canals and use the right-click **Save selection to ReEntry** action. In Sources, open that saved passage and use **Save linked note**.
4. On Home, expand **Choose a source to watch** and watch the demo page. The first check saves its baseline.
5. Edit `app/fixtures/change-demo.html`: change the sentence to add `and nerves`, then save it. The backend serves the current file, so another restart is unnecessary.
6. Press **Check now**. Inspect the earlier and current wording and the linked note. Exact passage matching can be inconclusive when extraction formats differ.
7. Finish capture and return to the workspace. Home retains the question, stop point, next step and saved pages. History contains captured material, newly linked notes, detected changes and reviewed decisions. Map & reports contains session reports and manually linked evidence.

The core capture, resume, comparison and notes do not require an AI API. AI explanations, Ask and summaries require a working provider. The last live Gemini test returned HTTP 503; this does not by itself mean the key is invalid. Retry later or configure a supported alternative using API_SETUP.md. Rotate credentials shared in chat and save replacements locally, not in the conversation.

Public page checks run while Chrome runs and fetch HTML without login cookies. Dynamic sites, PDFs and authenticated pages may not work. A changed page is not proof of contradiction.

Verification: build, six frontend tests, ten backend tests, and mocked browser enrollment/recovery/watch checks passed. The browser preview confirmed the resume card and linking a note to a saved source. Native unpacked-extension capture, permission prompts, tab restoration, download and the full end-to-end demo still need verification.
