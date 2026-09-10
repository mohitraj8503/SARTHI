const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const prisma = new PrismaClient();

async function parseDocxParagraphs(filePath) {
  const content = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(content);
  const docXml = await zip.file('word/document.xml').async('text');
  
  const pMatches = docXml.match(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g) || [];
  
  const paragraphs = [];
  for (const p of pMatches) {
    const tMatches = p.match(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g) || [];
    const text = tMatches.map(t => {
      let txt = t.replace(/<[^>]+>/g, '');
      txt = txt.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      return txt;
    }).join('');
    paragraphs.push(text.trim());
  }
  return paragraphs;
}

function makeAsciiTable(headers, rows) {
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    for (const r of rows) {
      if (r[i] && r[i].length > maxLen) {
        maxLen = r[i].length;
      }
    }
    return maxLen;
  });

  const border = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const formatRow = (row) => {
    return '| ' + row.map((cell, i) => {
      const val = cell || '';
      return val.padEnd(colWidths[i]);
    }).join(' | ') + ' |';
  };

  return [
    border,
    formatRow(headers),
    border,
    ...rows.map(r => formatRow(r)),
    border
  ].join('\n');
}

function getCaseStudyPreamble(type) {
  if (type === 'cleaning') {
    const table = makeAsciiTable(
      ['Customer_Name', 'Order_Date', 'Product_Metadata', 'Revenue'],
      [
        ['   rAhUl   sInGh  ', '12/31/2025', 'LAPTOP|DELL|XPS15|PROMO', '$ 1,500.00 USD'],
        ['!@#Priya_Sharma', '31/12/2025', 'PHONE|APPLE|IPHONE15|NO_PROMO', '€ 1.200,50 EUR'],
        ['  sMiTh,   jOhN ', '01-15-26', 'TABLET|SAMSUNG|TAB_S9|PROMO', 'Rs. 45,000 INR'],
        ['cHEn, wEI', '15/01/2026', 'MONITOR|LG|ULTRAWIDE|NO_PROMO', '¥ 3,000.00 CNY']
      ]
    );
    return `### 🔍 Master Case Study: The 'ElectroWorld' Global Merger Dump\n\n` +
      `🎯 **Context:**\n'ElectroWorld' has recently acquired a European and an Asian retail chain. As the Lead Data Analyst, you receive a system export named 'Global_Merged_Sales_FY26.csv' containing 150,000 rows. Because the data is merged from three different regional ERP systems, it is severely corrupted. Below is a real snapshot of the raw data anomalies you must resolve in Power Query before building the Data Model.\n\n` +
      `📊 **Raw Data Snapshot (First 4 Rows):**\n` +
      `\`\`\`text\n${table}\n\`\`\`\n\n` +
      `⚠️ **Business Problem:**\nRegionally fragmented ERP systems have dumped inconsistent names, mixed date configurations, uncleaned spaces, and currency symbols into a single text matrix, preventing accurate regional reporting.\n\n`;
  }
  
  if (type === 'lookups') {
    const tableA = makeAsciiTable(
      ['Internal_ID', 'Date', 'Recorded_Amount', 'Status'],
      [
        ['TXN-9001', '04-Jan', '₹ 45,000', 'Pending'],
        ['TXN-9002', '06-Jan', '₹ 12,500', 'Pending'],
        ['TXN-9003', '11-Jan', '₹ 8,900', 'Cleared']
      ]
    );
    const tableB = makeAsciiTable(
      ['Bank_Ref', 'Clear_Date', 'Cleared_Amount', 'Notes'],
      [
        ['TXN-9001', '05-Jan', '₹ 45,000', 'OK'],
        ['TXN-9005', '08-Jan', '₹ 3,200', 'Fee'],
        ['TXN-9002', '09-Jan', '₹ 12,000', 'Shortfall']
      ]
    );
    return `### 📈 Master Case Study: The Financial Reconciliation Project\n\n` +
      `🎯 **Context:**\nThe Finance Department has asked you to reconcile two mismatched ledgers for Q1. Table A is the 'Internal Accounting Ledger' and Table B is the external 'Bank Statement'. Transaction IDs do not always align perfectly, some transactions are missing entirely, and you need to build dynamic reporting dashboards that auto-update as new data drops in. You must rely on modern array math and advanced lookup logic to identify discrepancies.\n\n` +
      `📊 **Table A Snapshot (Internal Ledger):**\n` +
      `\`\`\`text\n${tableA}\n\`\`\`\n\n` +
      `📊 **Table B Snapshot (Bank Statement):**\n` +
      `\`\`\`text\n${tableB}\n\`\`\`\n\n` +
      `📌 **Business Requirement:**\nYou must construct dynamic formulas that lookup clear dates and reconciliation notes, handling mismatches gracefully without generating empty or error cells (#N/A).\n\n`;
  }
  
  if (type === 'model') {
    const tableSales = makeAsciiTable(
      ['Order_ID', 'Order_Date', 'Product_ID', 'Units_Sold'],
      [
        ['ORD-1001', '2026-02-15', 'PROD-A', '45'],
        ['ORD-1002', '2026-02-15', 'PROD-B', '12'],
        ['ORD-1003', '2026-02-16', 'PROD-A', '100']
      ]
    );
    const tableProducts = makeAsciiTable(
      ['Product_ID', 'Product_Name', 'Category', 'Unit_Price'],
      [
        ['PROD-A', 'Cloud Server Rack', 'Hardware', '₹ 2,50,000'],
        ['PROD-B', 'Firewall Appliance', 'Security', '₹ 85,000']
      ]
    );
    return `### 🌍 Master Case Study: The 3-Million Row Performance Crash\n\n` +
      `🎯 **Context:**\n'SARTHI Logistics' handles vast supply chain data. The Operations Director tried to analyze 3 million rows of sales data using standard VLOOKUPs to pull in Product Costs and Dates. The Excel file ballooned to 200MB, constantly crashes, and takes 15 minutes to calculate. As the Lead Analyst, you must discard the VLOOKUP approach, load the raw tables into the Excel Data Model (Power Pivot), build a relational Star Schema, and write DAX formulas to generate instant, scalable Pivot Table insights.\n\n` +
      `📊 **Fact Table Snapshot (fct_Sales):**\n` +
      `\`\`\`text\n${tableSales}\n\`\`\`\n\n` +
      `📊 **Dimension Table Snapshot (dim_Products):**\n` +
      `\`\`\`text\n${tableProducts}\n\`\`\`\n\n` +
      `⚠️ **Business Problem:**\nStandard formulas like VLOOKUP cannot scale to multi-million rows in Excel. A proper high-performance data model with optimized relationships and DAX measures must be built to restore calculations to sub-second speeds.\n\n`;
  }

  if (type === 'dashboards') {
    const table1 = makeAsciiTable(
      ['Control_Element', 'Linked_Cell', 'Output_Value', 'Drives_Chart?'],
      [
        ['Combo Box (Region)', '$Z$1', '2 (Index Number)', 'Yes (Revenue Trend)'],
        ['Option Button (YTD)', '$Z$2', '1', 'Yes (KPI Cards)'],
        ['Checkbox (Show Targets)', '$Z$3', 'TRUE', 'Yes (Target Line)']
      ]
    );
    const table2 = makeAsciiTable(
      ['Macro_Name', 'Trigger_Mechanism', 'Core_Action'],
      [
        ['Daily_Refresh', "Click 'Update' Shape", 'ActiveWorkbook.RefreshAll'],
        ['Clear_UI_Filters', "Click 'Reset' Button", 'SlicerCaches.ClearManualFilter'],
        ['Auto_Archive', 'Workbook_BeforeClose', 'Saves copy as timestamped PDF']
      ]
    );
    return `### 💻 Master Case Study: The 'C-Suite Command Center' Project\n\n` +
      `🎯 **Context:**\nThe CEO of SARTHI has commissioned you to build the 'C-Suite Command Center'. This must be a zero-maintenance, highly interactive executive dashboard. The CEO despises complex filter menus and wants to use simple 'app-like' buttons (Form Controls) to toggle between Global, APAC, and EMEA views. Furthermore, the daily data dump must be processed automatically. You need to architect a 3-layer workbook (Data, Calculation, UI), build dynamic charts that expand automatically as new data drops, and write a seamless VBA macro that refreshes everything with a single click at 8:00 AM.\n\n` +
      `📊 **Snapshot 1: Dashboard UI Mapping (Calc Layer):**\n` +
      `\`\`\`text\n${table1}\n\`\`\`\n\n` +
      `📊 **Snapshot 2: VBA Automation Schema:**\n` +
      `\`\`\`text\n${table2}\n\`\`\`\n\n` +
      `📌 **Business Requirement:**\nBuild an interactive dashboard with no manual filtering, fully automated with custom VBA scripting and form-linked controls to render instantaneous KPIs.\n\n`;
  }

  if (type === 'forecasting') {
    const table1 = makeAsciiTable(
      ['Month', 'Mktg_Spend', 'CAC (Avg)', 'New_Users'],
      [
        ['Jan-26', '₹ 50,000', '₹ 250', '200'],
        ['Feb-26', '₹ 75,000', '₹ 240', '312'],
        ['Mar-26', '₹ 1,00,000', '₹ 235', '425']
      ]
    );
    const table2 = makeAsciiTable(
      ['Parameter', 'Value'],
      [
        ['Principal Loan Amount', '₹ 50,00,000'],
        ['Annual Interest Rate', '9.50%'],
        ['Term (Years)', '5']
      ]
    );
    return `### 📈 Master Case Study: Project - Bharatiya (Skill Match Expansion)\n\n` +
      `🎯 **Context:**\nYou are modeling the financial forecast for 'Project - Bharatiya' (Bharatiya Skill Match), a nationwide initiative connecting blue-collar workers with government-level stakeholders and employers. You need to present a scalable growth model to investors. The model must calculate exact loan amortization for the seed capital, run Scenario Manager for Optimistic/Pessimistic user adoption, utilize Two-Variable Data Tables to predict profit margins based on fluctuating Customer Acquisition Costs (CAC), and use the Solver Add-in to optimize the marketing budget strictly across 5 states without exceeding the total fund.\n\n` +
      `📊 **Snapshot 1: Growth Model Inputs:**\n` +
      `\`\`\`text\n${table1}\n\`\`\`\n\n` +
      `📊 **Snapshot 2: Operations Loan Terms:**\n` +
      `\`\`\`text\n${table2}\n\`\`\`\n\n` +
      `⚠️ **Business Problem:**\nInvestors require optimized scenarios demonstrating maximum yield while maintaining low acquisition rates and high retention curves under dynamic resource allocations.\n\n`;
  }

  if (type === 'final') {
    return `### 🛡️ Master Case Study: The 'Day 1 Office Survival' Protocol\n\n` +
      `🎯 **Context:**\nYou have been hired as the Supreme Executive Data Commander. The stakes are incredibly high, and a single mistake could cost the company millions. However, the tasks you must perform are so universally basic that literally a kindergarten child could do them with their eyes closed. These are the absolute basics of Excel navigation and formatting that we didn't cover in the advanced modules. Can you survive?\n\n`;
  }

  return '';
}

const fileMapping = [
  { requested: 'Data Cleaning Questions MCQ.docx', actual: 'Data Cleaning Questions MCQ.docx', type: 'cleaning' },
  { requested: 'Advance Lookups MCQ.docx', actual: 'Advance Lookups MCQ.docx', type: 'lookups' },
  { requested: 'Data Model MCQ.docx', actual: 'Data Model MCQ .docx', type: 'model' },
  { requested: 'Dashboards MCQ.docx', actual: 'Dashboards MCQ.docx', type: 'dashboards' },
  { requested: 'Forecasting MCQ.docx', actual: 'Forecasting MCQ.docx', type: 'forecasting' },
  { requested: 'Final Assessment.docx', actual: 'Final Assesment.docx', type: 'final' }
];

async function parseFile(dir, fileObj) {
  const filePath = path.join(dir, fileObj.actual);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${fileObj.actual} (Requested: ${fileObj.requested})`);
  }
  
  const paragraphs = await parseDocxParagraphs(filePath);
  
  // Find answer key index
  let answerKeyIdx = -1;
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].toLowerCase();
    if (text.includes('answer key') || text.includes('official answer')) {
      answerKeyIdx = i;
      break;
    }
  }
  
  if (answerKeyIdx === -1) {
    throw new Error(`Could not find Answer Key section in ${fileObj.actual}`);
  }
  
  const questionParagraphs = paragraphs.slice(0, answerKeyIdx);
  const answerParagraphs = paragraphs.slice(answerKeyIdx);
  
  // Parse answer key
  const answerMap = new Map();
  for (const p of answerParagraphs) {
    const match = p.match(/^Q(\d+)\s*[:\.-]\s*([A-D])/i);
    if (match) {
      const qNum = parseInt(match[1], 10);
      const answer = match[2].toUpperCase();
      answerMap.set(qNum, answer);
    }
  }
  
  // Parse questions
  const questions = [];
  let currentQuestion = null;
  
  for (let i = 0; i < questionParagraphs.length; i++) {
    const p = questionParagraphs[i];
    if (!p) continue;
    
    const qMatch = p.match(/^Q(\d+)\s*[\.\:-]\s*(.*)/i);
    if (qMatch) {
      const qNum = parseInt(qMatch[1], 10);
      let qText = qMatch[2].trim();
      
      currentQuestion = {
        number: qNum,
        questionText: qText,
        options: [],
        correctAnswer: null
      };
      questions.push(currentQuestion);
      continue;
    }
    
    const optMatch = p.match(/^([A-D])\s*[\)\.\:-]\s*(.*)/i);
    if (optMatch && currentQuestion) {
      const letter = optMatch[1].toUpperCase();
      const text = optMatch[2].trim();
      currentQuestion.options.push(`${letter}) ${text}`);
      continue;
    }
    
    if (currentQuestion && currentQuestion.options.length === 0) {
      currentQuestion.questionText += '\n' + p;
    }
  }
  
  // Prepend preamble to each question & Match answers
  const preamble = getCaseStudyPreamble(fileObj.type);
  for (const q of questions) {
    q.questionText = preamble + `❓ **Question:**\n${q.questionText.trim()}`;
    const ans = answerMap.get(q.number);
    q.correctAnswer = ans || 'A';
  }
  
  return {
    filename: fileObj.actual,
    questionsCount: questions.length,
    questions
  };
}

async function main() {
  console.log('🌱 Starting Advanced Excel Certification seeding...');
  
  const dir = "/home/mohit8503/Documents/Advance Excel";
  const certId = 'advanced-excel-certification-exam';
  const certSlug = 'advanced-excel-certification-exam';
  const certTitle = 'Advanced Excel Certification Exam';
  
  // 1. Gather instructor details
  let instructor = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'TEACHER'] } }
  });

  if (!instructor) {
    console.log('No instructor found, creating a default admin...');
    instructor = await prisma.user.create({
      data: {
        email: 'admin@sarthi.in',
        name: 'Mohit Raj',
        role: 'ADMIN',
        status: 'ACTIVE',
        onboarded: true
      }
    });
  }
  console.log(`Using Instructor: ${instructor.name} (ID: ${instructor.id})`);
  
  // 2. Parse all questions
  const allQuestions = [];
  const errors = [];
  let paperCount = 0;
  
  for (const fileObj of fileMapping) {
    try {
      const result = await parseFile(dir, fileObj);
      console.log(`Parsed ${result.questionsCount} questions from ${result.filename}`);
      allQuestions.push(...result.questions);
      paperCount++;
    } catch (e) {
      console.error(`Error processing file ${fileObj.requested}:`, e.message);
      errors.push({ file: fileObj.requested, error: e.message });
    }
  }
  
  if (errors.length > 0) {
    console.warn(`⚠️ Warning: Completed parsing with errors. See summary.`);
  }
  
  // 3. Clean up existing questions
  console.log('Cleaning up existing questions for advanced excel certification...');
  const existingCert = await prisma.certification.findUnique({
    where: { slug: certSlug }
  });
  
  if (existingCert) {
    await prisma.certificationQuestion.deleteMany({
      where: { certificationId: existingCert.id }
    });
    console.log('Deleted existing certification questions.');
  }
  
  // 4. Upsert the Certification
  const certData = {
    title: certTitle,
    slug: certSlug,
    description: 'Master advanced Microsoft Excel methodologies, data modeling techniques, business forecasting models, and interactive dashboard creation.',
    duration: 60,
    passingScore: 85,
    price: 39,
    premiumPrice: 49,
    proPrice: 99,
    difficulty: 'Advanced',
    assessmentDurationMinutes: 60,
    status: 'PUBLISHED',
    instructorId: instructor.id,
    thumbnail: '/images/certification-exams/advanced-excel.png',
    questions: '[]'
  };

  const excelCert = await prisma.certification.upsert({
    where: { id: certId },
    update: certData,
    create: {
      id: certId,
      ...certData
    }
  });
  
  console.log(`Upserted Certification: "${excelCert.title}" with ID: ${excelCert.id}`);
  
  // 5. Seed questions
  console.log(`Inserting ${allQuestions.length} questions into DB...`);
  let order = 1;
  for (const q of allQuestions) {
    await prisma.certificationQuestion.create({
      data: {
        id: `excel-q-${order}`,
        certificationId: excelCert.id,
        questionText: q.questionText,
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: 'For details, refer to advanced training materials.',
        marks: 5,
        marksCorrect: 5,
        marksWrong: -1,
        orderNumber: order,
        order: order
      }
    });
    order++;
  }
  
  console.log('✅ Seeding completed successfully!');
  
  // Display the Summary format required by the user
  console.log('\n=======================================');
  console.log('            IMPORT SUMMARY             ');
  console.log('=======================================');
  console.log(`Certification ID:                   ${excelCert.id}`);
  console.log(`Certification Name:                 ${excelCert.title}`);
  console.log(`Slug:                               ${excelCert.slug}`);
  console.log(`Number of question papers imported: ${paperCount}`);
  console.log(`Total questions imported:           ${allQuestions.length}`);
  
  if (errors.length > 0) {
    console.log('\n=======================================');
    console.log('            IMPORT ERRORS              ');
    console.log('=======================================');
    errors.forEach(err => {
      console.log(`File: ${err.file}\nError: ${err.error}\n`);
    });
  } else {
    console.log('No errors or missing files encountered.');
  }
  console.log('=======================================');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
