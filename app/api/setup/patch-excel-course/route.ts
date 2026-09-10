export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const NEW_DESCRIPTION = `# Microsoft Excel – Complete Industry-Focused Course

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

By the end of this course, you will be able to create professional reports, build interactive dashboards, analyze large datasets, automate repetitive tasks, and use Excel effectively in corporate and business environments.`;

export async function GET() {
  try {
    const updated = await prisma.course.update({
      where: { id: 'advanced-excel-mastery' },
      data: {
        title: 'Microsoft Excel – Complete Industry-Focused Course',
        slug: 'microsoft-excel',
        price: 1000,
        originalPrice: 4999,
        pricing_type: 'PAID',
        badge: '90 DAYS',
        thumbnail: '/course-thumbnails/Microsoft-excel.png',
        description: NEW_DESCRIPTION,
        isPublished: true,
        isActive: true,
        publish_state: 'published',
        instructorId: 'UNKNOWN',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Excel course updated successfully in database',
      course: {
        id: updated.id,
        title: updated.title,
        price: updated.price,
        badge: updated.badge,
        slug: updated.slug,
      },
    });
  } catch (error: any) {
    console.error('[PATCH_EXCEL] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
