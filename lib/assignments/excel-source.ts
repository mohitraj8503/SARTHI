import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export interface DailyActionRow {
  day: number;
  date: string; // YYYY-MM-DD (Asia/Kolkata)
  week?: string;
  internName: string;
  internId: string; // e.g. TTI000002
  designation: string;
  campaign: string;
  phase: string;
  whatToPromote: string;
  exactAction: string;
  assetDeliverable: string;
  channel: string;
  cta: string;
  kpi: string;
  submissionEvidence: string;
  status: string;
  rawRow: Record<string, any>;
}

/**
 * Resolves any raw Excel date cell value into a clean YYYY-MM-DD string in Asia/Kolkata timezone.
 */
export function resolveExcelDateToKolkataISO(val: any): string | null {
  if (!val) return null;
  
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(val);
  }

  if (typeof val === 'number') {
    // Excel date serial number to JS Date (epoch offset 25569)
    const date = new Date((val - 25569) * 86400 * 1000);
    // Add timezone offset to obtain exact intended date
    const tzOffset = date.getTimezoneOffset() * 60000;
    const adjusted = new Date(date.getTime() + tzOffset);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(adjusted);
  }

  if (typeof val === 'string') {
    const clean = val.trim();
    if (!clean) return null;

    // YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }

    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(parsed);
    }
  }

  return null;
}

/**
 * Finds and loads the SARTHI master Excel workbook.
 */
export function getExcelWorkbookPath(): string {
  const possiblePaths = [
    '/home/mohitraj8503/Downloads/SARTHI.xlsx',
    path.join(process.cwd(), 'data', 'SARTHI.xlsx'),
    path.join(process.cwd(), 'public', 'SARTHI.xlsx'),
    path.join(process.cwd(), 'SARTHI.xlsx'),
    'C:\\Users\\mohit\\Downloads\\SARTHI.xlsx'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    `Master assignment spreadsheet 'SARTHI.xlsx' not found. Checked paths: ${possiblePaths.join(', ')}`
  );
}

/**
 * Reads all rows from the 'Daily Intern Actions' worksheet in SARTHI.xlsx.
 */
export function readDailyInternActionsSheet(): DailyActionRow[] {
  const workbookPath = getExcelWorkbookPath();
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const sheet = workbook.Sheets['Daily Intern Actions'];

  if (!sheet) {
    throw new Error("Worksheet 'Daily Intern Actions' not found in SARTHI.xlsx");
  }

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);
  const rows: DailyActionRow[] = [];

  for (const row of rawRows) {
    const dateISO = resolveExcelDateToKolkataISO(row['Date']);
    const internId = String(row['Intern ID'] || '').trim();
    const internName = String(row['Intern'] || '').trim();

    if (!dateISO || !internId) {
      continue;
    }

    rows.push({
      day: Number(row['Day'] || 0),
      date: dateISO,
      week: row['Week'] ? String(row['Week']).trim() : undefined,
      internName,
      internId,
      designation: String(row['Designation'] || '').trim(),
      campaign: String(row['Campaign'] || '').trim(),
      phase: String(row['Phase'] || '').trim(),
      whatToPromote: String(row['What to Promote'] || '').trim(),
      exactAction: String(row['How to Promote / Exact Action'] || '').trim(),
      assetDeliverable: String(row['Asset / Deliverable'] || '').trim(),
      channel: String(row['Channel'] || '').trim(),
      cta: String(row['CTA'] || '').trim(),
      kpi: String(row['KPI'] || '').trim(),
      submissionEvidence: String(row['Submission Evidence'] || '').trim(),
      status: String(row['Status'] || 'Not Started').trim(),
      rawRow: row
    });
  }

  return rows;
}

/**
 * Gets daily intern actions for a specific target date (YYYY-MM-DD in Asia/Kolkata).
 */
export function getDailyInternActionsForDate(targetDateISO: string): DailyActionRow[] {
  const allRows = readDailyInternActionsSheet();
  return allRows.filter((r) => r.date === targetDateISO);
}

/**
 * Gets all distinct dates present in the Daily Intern Actions sheet.
 */
export function getAvailableActionDates(): string[] {
  const allRows = readDailyInternActionsSheet();
  const datesSet = new Set<string>();
  allRows.forEach((r) => datesSet.add(r.date));
  return Array.from(datesSet).sort();
}
