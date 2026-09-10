import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workbook = XLSX.readFile('C:\\Users\\mohit\\Downloads\\SARTHI.xlsx');
  const sheet = workbook.Sheets['Daily Intern Actions'];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  
  const excelIds = new Set<string>();
  for (const r of rows) {
    if (r['Intern ID']) excelIds.add(r['Intern ID']);
  }

  const members = await prisma.batchMember.findMany();
  const dbIds = new Set(members.map(m => m.permanentInternId).filter(Boolean));

  console.log("Unique Intern IDs in Excel:", excelIds.size, Array.from(excelIds));
  console.log("Unique Intern IDs in DB:", dbIds.size, Array.from(dbIds));

  const missingInDb = Array.from(excelIds).filter(id => !dbIds.has(id));
  console.log("Missing Intern IDs in DB:", missingInDb.length, missingInDb);
}

main().finally(() => prisma.$disconnect());
