import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, AlignmentType, HeadingLevel, BorderStyle, PageBreak, 
  ImageRun, Header, Footer, PageNumber, NumberFormat, ShadingType, UnderlineType,
  PageBorderOffsetFrom
} from 'docx';
import fs from 'fs';
import path from 'path';

async function generateIILMReport() {
  console.log('🚀 Generating perfect replica IILM Internship Report for Keshav Ruhela...');

  const iilmLogoPath = '/tmp/iilm_logo.png';
  let iilmLogoBuffer: Buffer | null = null;
  if (fs.existsSync(iilmLogoPath)) {
    iilmLogoBuffer = fs.readFileSync(iilmLogoPath);
  }

  const FONT_FAMILY = 'Times New Roman';

  // Standard Page Border matching original IILM template (<w:pgBorders w:offsetFrom="page">)
  const standardPageBorders = {
    pageBorders: {
      offsetFrom: PageBorderOffsetFrom.PAGE,
    },
    pageBorderTop: { style: BorderStyle.SINGLE, size: 24, space: 24, color: 'auto' },
    pageBorderBottom: { style: BorderStyle.SINGLE, size: 24, space: 24, color: 'auto' },
    pageBorderLeft: { style: BorderStyle.SINGLE, size: 24, space: 24, color: 'auto' },
    pageBorderRight: { style: BorderStyle.SINGLE, size: 24, space: 24, color: 'auto' },
  };

  // Standard paragraph helper
  const createPara = (text: string, options: {
    bold?: boolean;
    size?: number; // half-points (24 = 12pt, 28 = 14pt)
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spaceBefore?: number;
    spaceAfter?: number;
    italic?: boolean;
    color?: string;
    lineSpacing?: number;
  } = {}) => {
    return new Paragraph({
      alignment: options.align || AlignmentType.JUSTIFIED,
      spacing: {
        before: options.spaceBefore !== undefined ? options.spaceBefore : 120,
        after: options.spaceAfter !== undefined ? options.spaceAfter : 120,
        line: options.lineSpacing || 360, // 1.5 line spacing (240 * 1.5 = 360)
      },
      children: [
        new TextRun({
          text: text,
          bold: !!options.bold,
          size: options.size || 24, // 12pt
          font: FONT_FAMILY,
          italics: !!options.italic,
          color: options.color || '000000',
        }),
      ],
    });
  };

  // Heading 1 (Chapter Title - 14pt Bold)
  const createHeading1 = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      spacing: { before: 280, after: 160, line: 360 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 28, // 14pt
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    });
  };

  // Heading 2 (Sub-section - 12pt Bold)
  const createHeading2 = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 120, line: 360 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 24, // 12pt
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    });
  };

  // Heading 3 (Sub-sub-section - 12pt Bold Italic)
  const createHeading3 = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_3,
      alignment: AlignmentType.LEFT,
      spacing: { before: 160, after: 100, line: 360 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          italics: true,
          size: 24, // 12pt
          font: FONT_FAMILY,
          color: '000000',
        }),
      ],
    });
  };

  // Bullet Point
  const createBullet = (label: string, text: string) => {
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      bullet: { level: 0 },
      spacing: { before: 80, after: 80, line: 360 },
      children: [
        new TextRun({
          text: label + (label ? ': ' : ''),
          bold: true,
          size: 24,
          font: FONT_FAMILY,
        }),
        new TextRun({
          text: text,
          size: 24,
          font: FONT_FAMILY,
        }),
      ],
    });
  };

  // Table cell helper
  const createCell = (text: string, options: {
    bold?: boolean;
    isHeader?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    widthPercent?: number;
    colSpan?: number;
  } = {}) => {
    return new TableCell({
      width: options.widthPercent ? { size: options.widthPercent, type: WidthType.PERCENTAGE } : undefined,
      columnSpan: options.colSpan,
      shading: options.isHeader ? { fill: 'F3F4F6', type: ShadingType.CLEAR } : undefined,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: options.align || (options.isHeader ? AlignmentType.CENTER : AlignmentType.LEFT),
          spacing: { before: 60, after: 60, line: 280 },
          children: [
            new TextRun({
              text: text,
              bold: options.isHeader || options.bold,
              size: options.isHeader ? 22 : 20, // 10-11pt for table
              font: FONT_FAMILY,
            }),
          ],
        }),
      ],
    });
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 24, // 12pt
            color: '000000',
          },
          paragraph: {
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 360 }, // 1.5 line spacing
          },
        },
      },
    },
    sections: [
      // =========================================================================
      // SECTION 1: COVER PAGE (With Exact Template Page Borders)
      // =========================================================================
      {
        properties: {
          page: {
            borders: standardPageBorders,
            margin: {
              top: 1080,    // 0.75 in
              bottom: 1440, // 1.0 in
              left: 2160,   // 1.5 in
              right: 1440,  // 1.0 in
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({
                text: 'Report',
                bold: true,
                size: 32, // 16pt
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 80 },
            children: [
              new TextRun({
                text: 'Of',
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 160 },
            children: [
              new TextRun({
                text: 'NYAYASETU (न्यायसेतु): INDIA’S CITIZEN ACTION & GOVERNMENT NAVIGATION ENGINE',
                bold: true,
                size: 30, // 15pt
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Optional IILM Logo
          ...(iilmLogoBuffer ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 140 },
              children: [
                new ImageRun({
                  data: iilmLogoBuffer,
                  transformation: { width: 140, height: 70 },
                  type: 'png',
                }),
              ],
            }),
          ] : []),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: 'Submitted',
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 40 },
            children: [
              new TextRun({
                text: 'To',
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 20 },
            children: [
              new TextRun({
                text: 'School of Computer Science and Engineering',
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 140 },
            children: [
              new TextRun({
                text: 'IILM University, Greater Noida, U.P.',
                size: 26,
                bold: true,
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: 'In partial fulfilment of the requirement of degree of',
                size: 24,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 180 },
            children: [
              new TextRun({
                text: 'B.Tech CSE (Artificial Intelligence & Machine Learning)',
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 40 },
            children: [
              new TextRun({
                text: 'By',
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 20 },
            children: [
              new TextRun({
                text: 'Name of Student: KESHAV RUHELA',
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({
                text: 'Intern ID: TTI000066',
                bold: true,
                size: 24,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 160 },
            children: [
              new TextRun({
                text: 'Batch: 2026-27 (July 2026 Internship Cohort)',
                bold: true,
                size: 24,
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 160, after: 0 },
            children: [
              new TextRun({
                text: '2026-27',
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
        ],
      },

      // =========================================================================
      // SECTION 2: PRELIMINARY PAGES (Exact Template Format + Page Borders + Roman Numerals)
      // =========================================================================
      {
        properties: {
          page: {
            borders: standardPageBorders,
            margin: {
              top: 1080,
              bottom: 1440,
              left: 2160,
              right: 1440,
            },
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.LOWER_ROMAN,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ---------------------------------------------------------------------
          // CANDIDATE’S DECLARATION (Exact IILM Template Wording)
          // ---------------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 240 },
            children: [
              new TextRun({
                text: 'CANDIDATE’S DECLARATION',
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),

          createPara(
            'I, Keshav Ruhela, hereby declare that the internship project report titled “NyayaSetu (न्यायसेतु): India’s Citizen Action & Government Navigation Engine” represents the authentic and bonafide work carried out by me during my 1-Month Software Development Internship at SARTHI (July 2026 Batch) under the continuous mentorship and technical supervision of Mr. Mohit Raj (Co-Founder & Mentor, SARTHI).',
            { spaceBefore: 180, spaceAfter: 140 }
          ),

          createPara(
            'This report is officially submitted to the School of Computer Science and Engineering, IILM University, Greater Noida, in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology in Computer Science & Engineering (B.Tech CSE — Artificial Intelligence & Machine Learning). All the technical tools, system architectures, and references utilized throughout this project have been accurately documented.',
            { spaceBefore: 120, spaceAfter: 320 }
          ),

          // Signature Block (Exact IILM Template Format)
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 400, after: 40 },
            children: [
              new TextRun({
                text: 'Signature\n\n',
                bold: true,
                size: 24,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Student Name: Keshav Ruhela\n',
                size: 24,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Intern ID: TTI000066\n',
                size: 24,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Date: 21-Aug-2026',
                size: 24,
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ---------------------------------------------------------------------
          // ACKNOWLEDGEMENT (Exact IILM Template Wording + Custom Mention)
          // ---------------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 240 },
            children: [
              new TextRun({
                text: 'ACKNOWLEDGEMENT',
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),

          createPara(
            'I am using this opportunity to express my gratitude to everyone who supported me throughout the Internship Program. I am thankful for their aspiring guidance, invaluably constructive criticism and friendly advice during this work. I am sincerely grateful to them for sharing their truthful and illuminating views on a number of issues related to this work.',
            { spaceBefore: 180, spaceAfter: 140 }
          ),

          createPara(
            'I would like to express my sincere appreciation to SARTHI (Proprietorship Firm, Jamshedpur, Jharkhand), Co-Founder & Mentor Mr. Mohit Raj, and Co-Founder Mr. Mukul Pandey for their invaluable technical mentorship, patience, and guidance throughout the progressive phases of this internship—from mastering the fundamentals of modern HTML, CSS, and JavaScript to building and deploying our comprehensive citizen-assistance platform, NyayaSetu.',
            { spaceBefore: 120, spaceAfter: 140 }
          ),

          createPara(
            'I extend my sincere thanks to the faculty members, Head of Department, and Internship Coordinators at School of Computer Science and Engineering, IILM University, Greater Noida, for their academic encouragement, guidance, and continuous support.',
            { spaceBefore: 120, spaceAfter: 140 }
          ),

          createPara(
            'I express my gratitude to my parents for their blessings.',
            { spaceBefore: 120, spaceAfter: 360 }
          ),

          // Signature Block (Exact IILM Template Format)
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 360, after: 40 },
            children: [
              new TextRun({
                text: 'Signature\n\n',
                bold: true,
                size: 24,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Student Name: Keshav Ruhela\n',
                size: 24,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Intern ID: TTI000066',
                size: 24,
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ---------------------------------------------------------------------
          // TABLE OF CONTENTS (Exact IILM Chapter Structure)
          // ---------------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 240 },
            children: [
              new TextRun({
                text: 'TABLE OF CONTENTS',
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Chapter No.', { isHeader: true, widthPercent: 20 }),
                  createCell('Chapter Name', { isHeader: true, widthPercent: 65 }),
                  createCell('Page Nos.', { isHeader: true, widthPercent: 15 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('—', { align: AlignmentType.CENTER }),
                  createCell('Cover Page', { bold: true }),
                  createCell('----', { align: AlignmentType.CENTER }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('1.', { align: AlignmentType.CENTER, bold: true }),
                  createCell('Candidate’s Declaration', { bold: true }),
                  createCell('i', { align: AlignmentType.CENTER }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('2.', { align: AlignmentType.CENTER, bold: true }),
                  createCell('Acknowledgment', { bold: true }),
                  createCell('ii', { align: AlignmentType.CENTER }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('3.', { align: AlignmentType.CENTER, bold: true }),
                  createCell('Internship Completion Certificate & Offer Letter', { bold: true }),
                  createCell('1', { align: AlignmentType.CENTER }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('4.', { align: AlignmentType.CENTER, bold: true }),
                  createCell('Project Description\n    4.1 Introduction (Web Development Learning Journey to Capstone)\n    4.2 Organization Profile (SARTHI)\n    4.3 Problem Statement\n    4.4 Project Objectives\n    4.5 Scope of the Project\n    4.6 Technologies and Tools Used (HTML, CSS, JS, LocalStorage, Git)\n    4.7 System Architecture & Flowchart\n    4.8 Methodology & Progressive Learning Phases\n    4.9 Expected Outcomes & Real-World Impact\n    4.10 Certificates of Completion & Official Offer Proofs', { bold: true }),
                  createCell('3', { align: AlignmentType.CENTER }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('5.', { align: AlignmentType.CENTER, bold: true }),
                  createCell('Bibliography/References', { bold: true }),
                  createCell('16', { align: AlignmentType.CENTER }),
                ],
              }),
            ],
          }),
        ],
      },

      // =========================================================================
      // SECTION 3: MAIN REPORT (Exact IILM Chapter Scheme 1-5 + Arabic Page Numbers + Page Borders)
      // =========================================================================
      {
        properties: {
          page: {
            borders: standardPageBorders,
            margin: {
              top: 1080,    // 0.75 in
              bottom: 1440, // 1.0 in
              left: 2160,   // 1.5 in
              right: 1440,  // 1.0 in
            },
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'IILM University Internship Report — NyayaSetu | Keshav Ruhela (TTI000066)',
                    size: 18,
                    italics: true,
                    font: FONT_FAMILY,
                    color: '555555',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // =====================================================================
          // CHAPTER 3: INTERNSHIP COMPLETION CERTIFICATE & OFFICIAL OFFER LETTER
          // =====================================================================
          createHeading1('3. INTERNSHIP COMPLETION CERTIFICATE & OFFICIAL OFFER LETTER'),

          createPara(
            'The candidate, Keshav Ruhela, was officially issued the Offer of Internship and completed the 1-Month Software Development Internship under the July 2026 Batch at SARTHI. The complete authentic document is reproduced verbatim below:',
            { spaceBefore: 100, spaceAfter: 140 }
          ),

          // Official Letterhead Box
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: 'SARTHI\n',
                bold: true,
                size: 24,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Jamshedpur, Jharkhand, India\nEmail: admin@sarthi.in | Website: www.sarthi-woad.vercel.app',
                size: 20,
                font: FONT_FAMILY,
                color: '4B5563',
              }),
            ],
          }),

          // Intern & Batch Header Line
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: 'Keshav Ruhela  |  Intern ID: TTI000066  •  Cohort: July 2026 Batch\n',
                bold: true,
                size: 22,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: '_________________________________________________________________________________',
                bold: true,
                size: 20,
                font: FONT_FAMILY,
                color: '9CA3AF',
              }),
            ],
          }),

          // Date & Reference No Line
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({
                text: 'Date: 20-Jul-2026                                                             Reference No.: TT-INT-2026-0066',
                bold: true,
                size: 22,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Addressee Block
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({
                text: 'To,\nKeshav Ruhela\nB.Tech (Sem 3)\nIILM UNIVERSITY GREATER NOIDA (DELHI NCR)',
                size: 22,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Subject Line
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 60, after: 80 },
            children: [
              new TextRun({
                text: 'Subject: Offer of Internship',
                bold: true,
                size: 24,
                font: FONT_FAMILY,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
          }),

          createPara(
            'Dear Keshav Ruhela,\n\nWe are delighted to offer you the position of Software Development at SARTHI.\n\nFollowing a review of your application and technical background, we are pleased to invite you to join our Internship Program. This internship is designed to provide practical industry exposure through real-world software development projects, collaborative learning, technical mentorship, and professional skill development.\n\nDuring this internship, you will work on live assignments, product development, documentation, version control, collaborative engineering practices, and technical problem-solving under the guidance of experienced mentors. We are confident that your enthusiasm, commitment, and willingness to learn will make this internship a rewarding experience for both you and SARTHI.',
            { spaceBefore: 80, spaceAfter: 120, lineSpacing: 280 }
          ),

          // Internship Details Table
          createHeading2('Internship Details'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Parameter', { isHeader: true, widthPercent: 35 }),
                  createCell('Engagement Specification', { isHeader: true, widthPercent: 65 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Position', { bold: true }),
                  createCell('Software Development'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Internship Type', { bold: true }),
                  createCell('Remote'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Internship Duration', { bold: true }),
                  createCell('1 Months'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Internship Period', { bold: true }),
                  createCell('21-Jul-2026 – 21-Aug-2026'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Reporting To', { bold: true }),
                  createCell('Mohit Raj – Co-Founder & Mentor'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Working Days', { bold: true }),
                  createCell('Monday – Saturday (Sundays Holiday)'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Daily Working Hours', { bold: true }),
                  createCell('Maximum 2 Hours Per Day'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Stipend', { bold: true }),
                  createCell('Unpaid (Skill Development Internship)'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Joining Date', { bold: true }),
                  createCell('21-Jul-2026'),
                ],
              }),
            ],
          }),

          createHeading2('Roles & Responsibilities'),
          createPara('During the internship, you shall:', { spaceBefore: 60, spaceAfter: 60 }),
          createBullet('•', 'Work on live software development projects assigned by the mentor.'),
          createBullet('•', 'Build modern web applications, software modules, and automation solutions.'),
          createBullet('•', 'Maintain clean, optimized, reusable, and documented code.'),
          createBullet('•', 'Participate in code reviews, technical discussions, and mentor meetings.'),
          createBullet('•', 'Complete daily and weekly assignments within the specified deadlines.'),
          createBullet('•', 'Submit project deliverables through the Internship Portal.'),
          createBullet('•', 'Maintain Git repositories using professional version control practices.'),
          createBullet('•', 'Create technical documentation, reports, presentations, or creator content whenever assigned.'),
          createBullet('•', 'Follow engineering best practices and coding standards.'),
          createBullet('•', 'Maintain confidentiality regarding company projects and intellectual property.'),

          createHeading2('Attendance & Working Policy'),
          createBullet('Working Schedule', 'Maximum 2 hours/day, Monday-Saturday (Sundays holiday).'),
          createBullet('Daily Check-in', 'Mandatory daily check-in through the Internship Portal. Missing check-ins affects evaluation.'),
          createBullet('Attendance Requirement', 'Minimum 80% attendance is mandatory, tracked automatically.'),
          createBullet('Leave Policy', 'Planned leave must be informed in advance; emergencies ASAP. Unapproved absences may lead to termination.'),

          createHeading2('Assignment, Performance & XP Policy'),
          createPara(
            'Assignments must be completed by deadlines and submitted via the Portal. Copying, plagiarism, or unauthorized AI work is strictly prohibited. Performance is evaluated on technical quality, problem-solving, code quality, and timely delivery.\n\nXP & Gamification: Interns earn XP via check-ins, tasks, challenges, and exceptional performance. XP may be deducted for late submissions, missed deadlines, or policy violations. XP determines internship level, badges, and leaderboard position.',
            { spaceBefore: 60, spaceAfter: 100, lineSpacing: 280 }
          ),

          createHeading2('Code of Conduct & Confidentiality'),
          createPara(
            'The intern agrees to maintain professionalism, respect the team, work ethically, and avoid misconduct. Violation may result in immediate termination.\n\nThe intern acknowledges access to confidential proprietary materials (code, designs, business strategy). You agree not to disclose, copy, or use assets without permission. All intellectual property created remains exclusive property of SARTHI.',
            { spaceBefore: 60, spaceAfter: 100, lineSpacing: 280 }
          ),

          createHeading2('Completion Criteria & Benefits'),
          createPara(
            'To successfully complete, interns must maintain 80% attendance, complete 90%+ work, submit the final project, and achieve satisfactory mentor evaluation. Upon completion, interns may receive an Internship Completion Certificate, Letter of Recommendation, and priority consideration for future roles.',
            { spaceBefore: 60, spaceAfter: 100, lineSpacing: 280 }
          ),

          createHeading2('Terms & Conditions'),
          createBullet('•', 'Intended solely for educational, training, and professional skill development purposes.'),
          createBullet('•', 'Does not constitute an employment contract and does not guarantee permanent employment.'),
          createBullet('•', 'Company reserves the right to modify assignments or terminate the internship for misconduct/poor performance.'),
          createBullet('•', 'Please note that receiving this offer letter constitutes your voluntary acceptance of the internship program. By accepting this offer, you acknowledge that all platform administration or registration fees paid during the enrollment process are completely non-refundable.'),
          createBullet('•', 'Decisions regarding evaluation and certification remain at the sole discretion of SARTHI.'),

          // Official Signatures Block
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 180, after: 60 },
            children: [
              new TextRun({
                text: 'Sincerely,\nFor SARTHI\n\n\n________________________                         ________________________\n',
                bold: true,
                size: 22,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Mukul Pandey                                              Mohit Raj\n',
                bold: true,
                size: 22,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: 'Co-Founder                                                  Co-Founder & Mentor\nSARTHI                                             SARTHI',
                size: 20,
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // =====================================================================
          // CHAPTER 4: PROJECT DESCRIPTION
          // =====================================================================
          createHeading1('4. PROJECT DESCRIPTION'),

          // 4.1 Introduction
          createHeading2('4.1 Introduction: Progressive Learning Journey to Capstone Engineering'),
          createPara(
            'The Software Development Internship at SARTHI was structured as a comprehensive, progressive learning-and-building engineering program. Rather than jumping directly into complex application development, the internship followed a structured pedagogical progression:',
            { spaceBefore: 100, spaceAfter: 120 }
          ),

          createHeading3('Phase A: Foundational Web Development & Core Building Blocks'),
          createPara(
            'In the initial phase, the intern gained in-depth mastery of fundamental client-side web technologies:',
            { spaceBefore: 80, spaceAfter: 100 }
          ),
          createBullet('HTML5 Semantic Architecture', 'Learned how to construct accessible, semantic web layouts utilizing modern HTML5 elements (<header>, <nav>, <main>, <section>, <article>, <footer>, <details>, <summary>) and ARIA accessibility landmarks rather than non-semantic div-heavy structures.'),
          createBullet('Modern Responsive CSS3', 'Mastered the principles of modern web styling, including CSS Custom Properties (Variables) for modular design systems, Flexbox for dynamic single-dimensional layouts, CSS Grid for complex multi-column interfaces, media queries for mobile-first responsiveness, and smooth transitions/hover effects.'),
          createBullet('JavaScript (ES6+) Fundamentals', 'Gained practical expertise in core programming constructs: variables (let/const), arrow functions, array manipulation (map, filter, reduce, find), template literals, DOM selection and dynamic element creation, event listeners, and event bubbling/delegation.'),

          createHeading3('Phase B: Progressive Logic, State Management & Practical Handling'),
          createPara(
            'Building upon the fundamentals, the intern progressed to practical state handling and browser APIs:',
            { spaceBefore: 80, spaceAfter: 100 }
          ),
          createBullet('Dynamic DOM & Form Handling', 'Engineered interactive user input forms with client-side validation, error states, and responsive user feedback mechanisms without relying on third-party libraries.'),
          createBullet('Client-Side Data Persistence (LocalStorage)', 'Mastered the Web Storage API (localStorage / sessionStorage) to store, retrieve, update, and clear persistent JSON data structures directly on the user’s device, enabling offline data retention without requiring a dedicated backend server.'),
          createBullet('Decision Trees & State Machines', 'Designed conditional branching logic and state-driven questionnaires that dynamically evaluate user responses to filter datasets and determine resolution paths.'),
          createBullet('Git & Collaborative Version Control', 'Practiced professional software engineering workflows using Git and GitHub—including repository initialization, feature branching, atomic commit conventions, pull request creation, and collaborative code reviews under mentor supervision.'),

          createHeading3('Phase C: Capstone Project Engineering — NyayaSetu (न्यायसेतु)'),
          createPara(
            'Having mastered the full client-side web development stack and architectural principles, the intern applied these synthesized skills to design, build, and deploy the capstone project: NyayaSetu (न्यायसेतु) — India’s Citizen Action & Government Navigation Engine under Team Sankalp.',
            { spaceBefore: 80, spaceAfter: 160 }
          ),

          // 4.2 Organization Profile
          createHeading2('4.2 Organization Profile: SARTHI'),
          createPara(
            'SARTHI is an innovative technology, software development, and technical education proprietorship firm based in Jamshedpur, Jharkhand, India (Official Portal: www.sarthi-woad.vercel.app, Contact: admin@sarthi.in).',
            { spaceBefore: 100, spaceAfter: 120 }
          ),
          createPara(
            'Co-founded by Mr. Mukul Pandey and Mr. Mohit Raj, SARTHI focuses on empowering engineering students through industrial project simulations, hands-on software development, and modern product engineering practices. The organization fosters collaborative engineering teams (such as Team Sankalp) to design scalable digital products solving real-world Indian challenges.',
            { spaceBefore: 100, spaceAfter: 160 }
          ),

          // 4.3 Problem Statement
          createHeading2('4.3 Problem Statement: The Citizen Guidance Friction in Public Services'),
          createPara(
            'In India, digital governance has expanded rapidly with hundreds of official portals providing grievance redressal and public services. However, millions of everyday citizens face severe navigation barriers:',
            { spaceBefore: 100, spaceAfter: 120 }
          ),
          createBullet('Portal Confusion & Scam Copycat Sites', 'Search engine algorithms regularly rank unofficial third-party portals, paid middleman agencies, and fraudulent phishing sites above actual government domains (.gov.in), causing citizens to lose money or fall victim to scams.'),
          createBullet('Missing Document Readiness & Rejection', 'Citizens frequently visit government offices or file online complaints only to have their requests rejected due to a single missing document, incorrect file format, or incomplete affidavit.'),
          createBullet('Complex Administrative Jargon', 'Official government instructions and rules are written in complex legal and administrative language that is intimidating and hard to decipher for citizens of non-legal backgrounds.'),
          createBullet('Zero Grievance Tracking', 'After filing complaints across disparate portals, citizens frequently lose track of reference numbers, timelines, and statutory escalation hierarchies, resulting in abandoned grievances.'),
          createBullet('Exploitation by Informal Agents', 'Lack of transparent guidance forces vulnerable citizens into the hands of informal agents charging exorbitant fees for services that government departments provide free of cost.'),

          // 4.4 Project Objectives
          createHeading2('4.4 Project Objectives'),
          createPara(
            'NyayaSetu was engineered to solve these usability barriers at the root through the following core objectives:',
            { spaceBefore: 100, spaceAfter: 100 }
          ),
          createBullet('Interactive Problem-to-Authority Mapping', 'Create an intuitive multi-step decision tree that translates everyday citizen complaints into the exact statutory authority responsible for resolution.'),
          createBullet('Verified Government Portals Only', 'Provide direct, verified redirection links strictly to official government portals (.gov.in and nic.in), eliminating middleman intermediaries.'),
          createBullet('Pre-Formatted Complaint Draft Generator', 'Build an auto-drafting engine that generates structured, formal grievance letters pre-filled with the citizen’s issue details, ready to copy and submit on government portals.'),
          createBullet('Document Readiness Checklists', 'Provide actionable checklists detailing required identity proofs, utility bills, receipts, and evidence formats before filing.'),
          createBullet('Privacy-First Local Action Tracker', 'Implement a client-side grievance tracking log using browser LocalStorage to store reference numbers and timelines without sending sensitive data to external servers.'),

          new Paragraph({ children: [new PageBreak()] }),

          // 4.5 Scope of the Project
          createHeading2('4.5 Scope of the Project'),
          createPara(
            'NyayaSetu is designed as an independent, citizen-centric guidance layer spanning 8 major public governance domains in India:',
            { spaceBefore: 100, spaceAfter: 120 }
          ),
          createBullet('Cyber Crime & Financial Fraud', 'UPI payment fraud, unauthorized card charges, phishing scams, fake investment apps, social media harassment (linking to National Cyber Crime Portal 1930 / cybercrime.gov.in).'),
          createBullet('Consumer Grievances & E-Commerce', 'Defective goods, refund denials, e-commerce delivery disputes, misleading advertisements (linking to National Consumer Helpline 1915 / consumerhelpline.gov.in).'),
          createBullet('Central Public Grievances', 'Railways, Postal services, Telecom (DoT), Employees’ Provident Fund (EPFO) pension/PF delays (linking to CPGRAMS pgportal.gov.in).'),
          createBullet('Government Welfare Schemes', 'Educational scholarships, PM-Kisan agricultural subsidies, housing schemes, health coverage (linking to myScheme myscheme.gov.in).'),
          createBullet('Banking, Insurance & NBFC Disputes', 'Hidden bank charges, insurance claim rejection, loan recovery harassment (linking to RBI CMS Portal cms.rbi.org.in / IRDAI Bima Bharosa).'),
          createBullet('Municipal & Civic Infrastructure', 'Sanitation, potholes, illegal construction, street lighting, water contamination (linking to State Urban Development portals).'),
          createBullet('Identity & Official Documentation', 'Passport verification delays, Aadhaar-PAN card linking discrepancies, voter ID corrections (linking to Passport Seva passportindia.gov.in / UIDAI).'),
          createBullet('Public Health & Food Safety', 'Adulterated food reporting, hospital overbilling, counterfeit medicines (linking to FSSAI FoSCoS / National Health Authority).'),

          // 4.6 Technologies and Tools Used
          createHeading2('4.6 Technologies and Tools Used'),
          createPara(
            'To ensure lightning-fast performance, zero external runtime dependencies, and maximum accessibility across slow rural networks (2G/3G/4G), NyayaSetu was built entirely with modern native web standards:',
            { spaceBefore: 100, spaceAfter: 120 }
          ),

          // Tech Stack Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Technology / Tool', { isHeader: true, widthPercent: 30 }),
                  createCell('Category', { isHeader: true, widthPercent: 25 }),
                  createCell('Role in NyayaSetu Architecture', { isHeader: true, widthPercent: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('HTML5 (Semantic)', { bold: true }),
                  createCell('Markup & Structure'),
                  createCell('Accessible semantic layouts, ARIA landmarks, form controls, and responsive containers.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('CSS3 (Modern Variables)', { bold: true }),
                  createCell('Styling & Layouts'),
                  createCell('CSS Custom Properties (design system), Flexbox, CSS Grid, media queries for 320px–1440px.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('JavaScript (ES6+)', { bold: true }),
                  createCell('Logic & State Engine'),
                  createCell('Decision tree state machine, dynamic DOM rendering, search filtering, and complaint draft formatting.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Web Storage API', { bold: true }),
                  createCell('Data Persistence'),
                  createCell('Client-side LocalStorage for storing complaint reference IDs, reminders, and notes offline.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Git & GitHub', { bold: true }),
                  createCell('Version Control'),
                  createCell('Repository management, branch tracking, pull requests, and documentation at github.com/mohitraj8503/Nyaya-Setu.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('VS Code & Live Server', { bold: true }),
                  createCell('IDE & Tooling'),
                  createCell('Development environment, live debugging, cross-browser testing on Chromium and Firefox.'),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // 4.7 System Architecture
          createHeading2('4.7 System Architecture & Decoupled Flowchart'),
          createPara(
            'NyayaSetu decouples Problem Discovery & Diagnostic Classification from the Action Blueprint & Complaint Generation engine. This guarantees that users receive tailored, step-by-step guidance before being routed to official portals.',
            { spaceBefore: 100, spaceAfter: 140 }
          ),

          // Architecture Flow Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Stage', { isHeader: true, widthPercent: 20 }),
                  createCell('System Component', { isHeader: true, widthPercent: 35 }),
                  createCell('Execution Logic & User Journey', { isHeader: true, widthPercent: 45 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Stage 1', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Discovery & Search Engine'),
                  createCell('User searches by keyword or selects an issue category from the homepage hero grid.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Stage 2', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Diagnostic Decision Tree'),
                  createCell('Dynamic JavaScript questionnaire asks 2–3 questions to isolate the jurisdiction.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Stage 3', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Rules Engine & Portal Mapper'),
                  createCell('Matches grievance to verified authority (.gov.in), document checklist, and expected SLA resolution timeline.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Stage 4', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Complaint Draft Generator'),
                  createCell('Client-side script generates formal grievance letter pre-filled with incident details.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Stage 5', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Local Action Tracker & Router'),
                  createCell('Stores reference ID in LocalStorage and routes citizen directly to verified government URL.'),
                ],
              }),
            ],
          }),

          createHeading2('4.8 Methodology & Progressive Learning Phases'),
          createPara(
            'The project implementation was executed through a structured 4-week internship progression followed by a 7-day agile release sprint:',
            { spaceBefore: 140, spaceAfter: 120 }
          ),

          createBullet('Week 1: Fundamentals of Modern Frontend', 'Intensive training and hands-on exercises in semantic HTML5 markup, CSS Flexbox and Grid layouts, color theory, accessibility standards, and mobile responsiveness.'),
          createBullet('Week 2: Advanced JavaScript & State Management', 'Mastering DOM traversal and manipulation, event handling patterns, array manipulation methods, JSON data parsing, and client-side storage mechanisms with LocalStorage.'),
          createBullet('Week 3: NyayaSetu Core Engine Development', 'Architecting the 8-category government mapping rules dataset, implementing the multi-step interactive decision tree, and coding the dynamic complaint draft generator.'),
          createBullet('Week 4: Capstone Release & Optimization', 'Integrating the LocalStorage Action Tracker, conducting cross-browser performance audits, enforcing government safety policies, and publishing the open-source repository.'),

          // 7-Day Sprint Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Day', { isHeader: true, widthPercent: 15 }),
                  createCell('Agile Sprint Focus', { isHeader: true, widthPercent: 35 }),
                  createCell('Deliverables & Output Accomplished', { isHeader: true, widthPercent: 50 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Day 1', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Architecture & Git Setup'),
                  createCell('Repository initialization, branch hierarchy, category taxonomy structure.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Day 2', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Homepage & Search Grid'),
                  createCell('Hero search bar, emergency helpline quick-bar (1930/1915), issue category grid.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Day 3', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Diagnostic Decision Tree'),
                  createCell('Dynamic questionnaire logic matching citizen problems to administrative authorities.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Day 4', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Department Lookup Engine'),
                  createCell('Verified department database with official .gov.in links and escalation hierarchy.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Day 5', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Complaint Draft Generator'),
                  createCell('Auto-formatted grievance letter template generator and document checklist engine.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Day 6', { bold: true, align: AlignmentType.CENTER }),
                  createCell('LocalStorage Tracker & UI'),
                  createCell('Complaint history tracker, mobile layout polish, high-contrast theme styling.'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Day 7', { bold: true, align: AlignmentType.CENTER }),
                  createCell('Testing & Final Release'),
                  createCell('Cross-device verification, documentation, project pitch, and live demo.'),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // 4.9 Expected Outcomes
          createHeading2('4.9 Expected Outcomes & Real-World Impact'),
          createPara(
            'The development and deployment of NyayaSetu establish a high-impact, scalable civic guidance solution with the following proven outcomes:',
            { spaceBefore: 100, spaceAfter: 120 }
          ),
          createBullet('Zero Broker Exploitation', 'Directs citizens to free government channels, eliminating illegitimate middleman fees.'),
          createBullet('Maximized Filing Success Rates', 'Pre-filing document checklists prevent application rejections caused by missing proofs or wrong formats.'),
          createBullet('Lowered Literacy Barriers', 'Simplifies bureaucratic legal complexity into an intuitive 3-step decision flow understandable by ordinary citizens.'),
          createBullet('Absolute Privacy by Design', 'Because all logic runs client-side without storing citizen data on servers, 100% data privacy and confidentiality are preserved.'),

          // 4.10 Certificates of Completion & Official Proofs
          createHeading2('4.10 Certificates of Completion and Official Proofs'),
          createPara(
            'Official internship credentials and verification details issued by SARTHI:',
            { spaceBefore: 100, spaceAfter: 120 }
          ),

          // Verification Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Credential Parameter', { isHeader: true, widthPercent: 40 }),
                  createCell('Official Organization Value', { isHeader: true, widthPercent: 60 }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Permanent Intern ID', { bold: true }),
                  createCell('TTI000066', { bold: true }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Offer Reference Number', { bold: true }),
                  createCell('TT-INT-2026-0066', { bold: true }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Internship Track', { bold: true }),
                  createCell('Software Development (Web Development)'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Internship Period', { bold: true }),
                  createCell('21-Jul-2026 – 21-Aug-2026 (1 Month)'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Supervising Mentor', { bold: true }),
                  createCell('Mohit Raj (Co-Founder & Mentor, SARTHI)'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Issuing Organization', { bold: true }),
                  createCell('SARTHI (Proprietorship Firm, Jamshedpur)'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Project Repository Proof', { bold: true }),
                  createCell('https://github.com/mohitraj8503/Nyaya-Setu'),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // =====================================================================
          // CHAPTER 5: BIBLIOGRAPHY / REFERENCES
          // =====================================================================
          createHeading1('5. BIBLIOGRAPHY / REFERENCES'),

          createPara(
            '[1] SARTHI, “NyayaSetu (न्यायसेतु) — India’s Citizen Action & Government Navigation Engine Open-Source Repository”, GitHub, 2026. [Online]. Available: https://github.com/mohitraj8503/Nyaya-Setu',
            { spaceBefore: 140, spaceAfter: 80, lineSpacing: 240 }
          ),
          createPara(
            '[2] Department of Administrative Reforms & Public Grievances (DARPG), “Centralized Public Grievance Redress and Monitoring System (CPGRAMS) User Manual”, Government of India, 2026. [Online]. Available: https://pgportal.gov.in/',
            { spaceBefore: 80, spaceAfter: 80, lineSpacing: 240 }
          ),
          createPara(
            '[3] Ministry of Consumer Affairs, Food and Public Distribution, “National Consumer Helpline (NCH 2.0) Citizen Redressal Guidelines”, Government of India, 2026. [Online]. Available: https://consumerhelpline.gov.in/',
            { spaceBefore: 80, spaceAfter: 80, lineSpacing: 240 }
          ),
          createPara(
            '[4] Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs, “National Cyber Crime Reporting Portal Citizen Operating Manual”, Government of India, 2026. [Online]. Available: https://cybercrime.gov.in/',
            { spaceBefore: 80, spaceAfter: 80, lineSpacing: 240 }
          ),
          createPara(
            '[5] Ministry of Electronics and Information Technology (MeitY), “myScheme: Central & State Government Welfare Discovery Engine”, Digital India Corporation, 2026. [Online]. Available: https://www.myscheme.gov.in/',
            { spaceBefore: 80, spaceAfter: 80, lineSpacing: 240 }
          ),
          createPara(
            '[6] Mozilla Developer Network (MDN), “Web Storage API and LocalStorage Interface Reference”, Mozilla Foundation, 2026. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
            { spaceBefore: 80, spaceAfter: 80, lineSpacing: 240 }
          ),
          createPara(
            '[7] World Wide Web Consortium (W3C), “HTML5 Semantic Elements & Web Content Accessibility Guidelines (WCAG) 2.1”, W3C Recommendation, 2026. [Online]. Available: https://www.w3.org/TR/WCAG21/',
            { spaceBefore: 80, spaceAfter: 140, lineSpacing: 240 }
          ),
        ],
      },
    ],
  });

  const outputPath = '/home/mohitraj8503/Documents/Internship Report - Keshav Ruhela - NyayaSetu - IILM University.docx';
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ EXACT Replica IILM Internship Report successfully created at: ${outputPath}`);
  console.log(`File size: ${buffer.length} bytes`);
}

generateIILMReport().catch(err => {
  console.error('❌ Error generating report:', err);
  process.exit(1);
});
