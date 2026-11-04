---
name: reentry-bug-hunter
description: Reproduces and fixes ReEntry extension or backend failures. Use for broken capture, restore, evidence checks, review persistence or build errors.
---

# reentry-bug-hunter

Record the expected and observed behavior. Reproduce with the smallest workspace and inspect the relevant extension/content-script/backend logs without exposing source content or credentials unnecessarily. Identify the cause before patching. Consider service-worker termination, denied permission, late page loading, stale revisions and backend unavailability. Fix the cause, run a meaningful regression check and report remaining limits in STATUS.md. Do not turn off validation or fabricate model output to make a demo pass.
