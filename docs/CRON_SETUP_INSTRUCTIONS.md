# Scheduled Task Automation — Production Cron Setup Guide

This document explains how to configure the production cron job for **Scheduled Cohort Assignment Release** on SARTHI servers (Hostinger / Vercel / External Cron Service).

---

## 1. Overview

When a mentor schedules an assignment using the **"Schedule for later"** feature in the Mentor Dashboard:
- The assignment is saved to the database with `status: "scheduled"` and a `releaseAt` timestamp.
- The task is **hidden from interns** and **no emails are dispatched** until the `releaseAt` timestamp is reached.
- When `releaseAt <= NOW()`, the scheduled job flips `status` to `"active"`, issues system notifications to all recipients, and emails each intern their branded assignment details.

---

## 2. Cron Endpoint Details

- **Endpoint URL:** `https://sarthi-woad.vercel.app/api/cron/release-scheduled-assignments`
- **Supported Methods:** `POST` or `GET`
- **Recommended Schedule:** Every 5 minutes (`*/5 * * * *`)
- **Authentication:** Header `x-cron-secret` matching `CRON_SECRET` in `.env` (or query param `?secret=YOUR_CRON_SECRET`).

---

## 3. Configuration Options

### Option A: Hostinger Control Panel (cPanel / hPanel Cron Jobs)

1. Log into your Hostinger Dashboard.
2. Navigate to **Advanced -> Cron Jobs**.
3. Set the schedule to every 5 minutes: `*/5 * * * *`.
4. Enter the command:
   ```bash
   curl -s -X POST -H "x-cron-secret: YOUR_CRON_SECRET_HERE" "https://sarthi-woad.vercel.app/api/cron/release-scheduled-assignments" > /dev/null 2>&1
   ```
5. Save the Cron Job.

---

### Option B: External Cron Service (e.g., cron-job.org / EasyCron)

1. Create a new HTTP job.
2. Set URL: `https://sarthi-woad.vercel.app/api/cron/release-scheduled-assignments`
3. Set Method: `POST` (or `GET`)
4. Add Header: `x-cron-secret: YOUR_CRON_SECRET_HERE` (or append `?secret=YOUR_CRON_SECRET_HERE` to the URL).
5. Set Execution frequency: Every 5 minutes.

---

## 4. Environment Variables

Ensure `.env` contains:
```env
CRON_SECRET="your_secure_cron_secret_key"
NEXT_PUBLIC_APP_URL="https://sarthi-woad.vercel.app"
```

---

## 5. Verification & Testing

To test scheduled task release manually via curl:
```bash
curl -X POST \
  -H "x-cron-secret: YOUR_CRON_SECRET_HERE" \
  "http://localhost:3000/api/cron/release-scheduled-assignments"
```

Expected JSON response when due tasks exist:
```json
{
  "success": true,
  "releasedCount": 1,
  "processedAssignments": [
    {
      "id": "cm...",
      "title": "Task 1 – Mandatory LinkedIn Introduction Post",
      "recipientsCount": 17,
      "emailsSent": 17
    }
  ],
  "executedAt": "2026-07-29T07:50:00.000Z"
}
```
