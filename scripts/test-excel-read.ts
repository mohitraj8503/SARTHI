import * as XLSX from 'xlsx';

try {
  const workbook = XLSX.readFile('C:\\Users\\mohit\\Downloads\\SARTHI.xlsx');
  console.log("SheetNames:", workbook.SheetNames);
  const sheet = workbook.Sheets['Daily Intern Actions'];
  if (!sheet) {
    console.error("Sheet not found!");
  } else {
    // Read raw rows
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    console.log("Raw rows count:", rows.length);
    console.log("Row 0 keys:", Object.keys(rows[0] || {}));
    console.log("Row 0:", JSON.stringify(rows[0]));
    console.log("Row 1:", JSON.stringify(rows[1]));
    console.log("Row 2:", JSON.stringify(rows[2]));
  }
} catch (err: any) {
  console.error("Error reading file:", err.message);
}
