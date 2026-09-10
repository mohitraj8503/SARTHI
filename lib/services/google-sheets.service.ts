import { google } from 'googleapis';
import { prisma } from '../prisma';
import { isIilmUniversity } from '../utils/iilm';

export const GOOGLE_SHEET_ID = '1dW9mq6x_-dUkgE6jJEJozGX1YBIJ4XvePArMMFjJwzk';
export const GOOGLE_SHEET_TAB = 'Team Sankalp';
export const TEAM_TABS = [
  'Team Sankalp',
  'Team Alpha',
  'Team Alpha (Template)',
  'Team Beta',
  'Team Beta (Template)',
  'Team Gamma',
  'Team Gamma (Template)',
  'Team Delta',
  'Team Delta (Template)'
];

export const MAX_INTERNS_PER_TEAM = 20;

/**
 * Returns an authenticated Google Sheets API client if service account credentials exist in env.
 */
function getSheetsClient() {
  const email = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    return null;
  }

  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

export interface SheetRowData {
  studentId?: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  courseAndSem?: string;
  track?: string;
  paymentStatus?: 'YES' | 'NO';
  applicationSent?: 'YES' | 'NO';
  applicationAccepted?: 'YES' | 'PENDING';
  offerLetterReceived?: 'RECEIVED' | 'PENDING';
  certificateReceived?: 'IN PROGRESS' | 'COMPLETED';
}

/**
 * Format Prisma InternshipApplication into SheetRowData format
 */
export function formatApplicationToSheetData(app: any): SheetRowData {
  const isAccepted = app.status === 'OFFER_ACCEPTED' || app.status === 'APPROVED' || app.status === 'ACCEPTED';
  const hasOffer = app.offerAcceptedAt || isAccepted;

  const courseStr = [app.course, app.semester ? `(Sem ${app.semester})` : ''].filter(Boolean).join(' ');

  return {
    studentId: app.studentId || app.id,
    name: app.name || app.student?.name || 'Student',
    email: app.email,
    phone: app.student?.phone || app.phone || '',
    college: app.college || app.student?.college || 'IILM University',
    courseAndSem: courseStr || 'B.Tech (Sem 3)',
    track: app.internshipTrack || 'Web Development',
    paymentStatus: isAccepted ? 'YES' : 'NO',
    applicationSent: 'YES',
    applicationAccepted: isAccepted ? 'YES' : 'PENDING',
    offerLetterReceived: hasOffer ? 'RECEIVED' : 'PENDING',
    certificateReceived: app.status === 'COMPLETED' ? 'COMPLETED' : 'IN PROGRESS'
  };
}

/**
 * Sync single application to Google Sheet (IILM University candidates starting from Column B, leaving SR NO untouched)
 */
export async function syncApplicationToSheet(applicationId: string): Promise<{ success: boolean; mode: string; targetTab?: string; message?: string }> {
  try {
    const app = await prisma.internshipApplication.findUnique({
      where: { id: applicationId },
      include: { student: true }
    });
    if (!app) return { success: false, mode: 'error', message: 'Application not found' };

    // Case-insensitive & typo-tolerant IILM University filter
    const isIILM = isIilmUniversity(app.college);

    if (!isIILM) {
      console.log(`[GoogleSheetsSync] Skipped non-IILM candidate: ${app.name} (${app.college})`);
      return { success: true, mode: 'skipped_non_iilm', message: 'Sync strictly applies to IILM University candidates' };
    }

    const data = formatApplicationToSheetData(app);

    // 1. Try Direct Google Sheets API if service account configured
    const sheets = getSheetsClient();
    if (sheets) {
      // Search for candidate across team tabs
      let targetTab = TEAM_TABS[0];
      let targetRowIndex = -1;

      for (const tabName of TEAM_TABS) {
        try {
          const range = `'${tabName}'!B6:L26`;
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range
          });

          const rows = response.data.values || [];
          for (let i = 0; i < rows.length; i++) {
            const rowEmail = rows[i][1]?.toString().trim().toLowerCase(); // Col C = Email (Index 1 of B:L)
            if (rowEmail && rowEmail === data.email.trim().toLowerCase()) {
              targetTab = tabName;
              targetRowIndex = i + 6;
              break;
            }
          }
          if (targetRowIndex > 0) break;
        } catch {}
      }

      if (targetRowIndex < 0) {
        for (const tabName of TEAM_TABS) {
          try {
            const range = `'${tabName}'!B6:L26`;
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId: GOOGLE_SHEET_ID,
              range
            });
            const rows = response.data.values || [];

            const filledCount = rows.filter(r => r && (r[0] || r[1])).length;
            if (filledCount < MAX_INTERNS_PER_TEAM) {
              targetTab = tabName;
              targetRowIndex = 6 + filledCount;
              break;
            }
          } catch {
            targetTab = tabName;
            targetRowIndex = 6;
            break;
          }
        }
      }

      if (targetRowIndex < 6) targetRowIndex = 6;

      // Values starting from Column B (STUDENT NAME) to Column L
      const rowValues = [
        data.name,
        data.email,
        data.phone || '',
        data.college || '',
        data.courseAndSem || '',
        data.track || '',
        data.paymentStatus || 'NO',
        data.applicationSent || 'YES',
        data.applicationAccepted || 'PENDING',
        data.offerLetterReceived || 'PENDING',
        data.certificateReceived || 'IN PROGRESS'
      ];

      // Update Columns B through L only (keeping Column A SR NO intact)
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `'${targetTab}'!B${targetRowIndex}:L${targetRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowValues] }
      });

      console.log(`[GoogleSheetsSync] Synced ${data.email} -> Tab: ${targetTab}, Row: ${targetRowIndex}`);
      return { success: true, mode: 'google_api', targetTab };
    }

    // 2. Try Google Apps Script Webhook URL if configured
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_row', sheetId: GOOGLE_SHEET_ID, data, maxPerTeam: MAX_INTERNS_PER_TEAM })
      });
      if (res.ok) {
        return { success: true, mode: 'apps_script_webhook' };
      }
    }

    console.log(`[GoogleSheetsSync] Mode: Logged (IILM Candidate) for ${data.email}`);
    return { success: true, mode: 'logged_only', message: 'No API credentials set. Logged IILM sync data.' };
  } catch (err: any) {
    console.error('[GoogleSheetsSync] Error during sync:', err?.message || err);
    return { success: false, mode: 'error', message: err?.message };
  }
}

/**
 * Handle incoming edit from Google Sheet Apps Script webhook (Sheet -> DB)
 */
export async function syncStatusFromSheet(sheetPayload: {
  email: string;
  paymentStatus?: string;
  applicationAccepted?: string;
  offerLetterReceived?: string;
}): Promise<{ success: boolean; applicationId?: string; actionTaken?: string }> {
  if (!sheetPayload.email) {
    return { success: false };
  }

  const app = await prisma.internshipApplication.findFirst({
    where: { email: sheetPayload.email.trim().toLowerCase() }
  });

  if (!app) {
    return { success: false };
  }

  let newStatus = app.status;
  const isAcceptedInSheet = sheetPayload.applicationAccepted?.toUpperCase() === 'YES' || sheetPayload.paymentStatus?.toUpperCase() === 'YES';

  if (isAcceptedInSheet && app.status !== 'OFFER_ACCEPTED') {
    newStatus = 'OFFER_ACCEPTED';
  }

  if (newStatus !== app.status) {
    await prisma.internshipApplication.update({
      where: { id: app.id },
      data: {
        status: newStatus,
        offerAcceptedAt: isAcceptedInSheet ? new Date() : app.offerAcceptedAt
      }
    });

    return { success: true, applicationId: app.id, actionTaken: `Updated status to ${newStatus}` };
  }

  return { success: true, applicationId: app.id, actionTaken: 'No status change required' };
}
