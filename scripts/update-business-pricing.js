const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Applying Business, Pricing, and Product Restructuring database updates...");

  // 1. Soft-delete Income Tax course
  const softDeleteITR = await prisma.course.update({
    where: { id: 'course_itr_filing_2024' },
    data: { isPublished: false }
  });
  console.log("Soft-deleted course:", softDeleteITR.title, "(isPublished:", softDeleteITR.isPublished, ")");

  // 2. Rename and update price, slug, description, and thumbnail of Advanced Excel course
  const updateExcel = await prisma.course.update({
    where: { id: 'course_advanced_excel_2024' },
    data: {
      title: 'Microsoft Excel – Complete Industry-Focused Course',
      slug: 'microsoft-excel',
      price: 1000,
      pricing_type: 'PAID',
      badge: '90 DAYS',
      thumbnail: '/course-thumbnails/advance-excel.png',
      description: `# Microsoft Excel – Complete Industry-Focused Course

Master Microsoft Excel from beginner to advanced level with a practical, industry-oriented approach. This course is designed to help students, working professionals, business analysts, accountants, and entrepreneurs develop job-ready Excel skills used in real corporate environments.

Through hands-on exercises, real-world datasets, and business case studies, you will learn how to organize, analyze, visualize, and automate data efficiently.

## What You'll Learn

* Excel Fundamentals & Productivity Tools
* Data Entry, Formatting & Management
* Essential & Advanced Formulas
* IF, SUMIFS, COUNTIFS, TEXT Functions
* VLOOKUP, HLOOKUP, XLOOKUP & INDEX-MATCH
* Data Validation & Conditional Formatting
* Pivot Tables & Pivot Charts
* Dashboard Design & Interactive Reports
* Data Analysis & Business Insights
* Financial Reporting & MIS Preparation
* Excel Automation Techniques
* AI-Assisted Excel Productivity

## Course Highlights

✔ Industry-Focused Curriculum
✔ Application-Oriented Learning
✔ Real Corporate Use Cases
✔ Hands-On Practice Exercises
✔ Dashboard Building Projects
✔ Business Analytics Workflows
✔ Interview & Placement Preparation
✔ Certificate of Completion

## Practice Exercises Included

Every module includes practical exercises based on real business scenarios such as sales reporting, inventory management, financial analysis, HR dashboards, and performance tracking. These exercises help learners gain confidence in applying Excel skills to solve real-world problems.

By the end of this course, you will be able to create professional reports, build interactive dashboards, analyze large datasets, automate repetitive tasks, and use Excel effectively in corporate and business environments.`
    }
  });
  console.log("Updated course title, price, slug, description and thumbnail for:", updateExcel.title);
}

main()
  .catch(e => {
    console.error("Error updating database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
