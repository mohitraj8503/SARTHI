const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating course thumbnails in database...");

  // Update Excel
  const excel = await prisma.course.updateMany({
    where: { id: 'course_advanced_microsoft_excel_course' },
    data: { thumbnail: '/course-thumbnails/advance-excel.png' }
  });
  console.log("Excel update:", excel);

  // Update Python Beginners
  const python = await prisma.course.updateMany({
    where: { id: 'python-beginners-mr' },
    data: { thumbnail: '/course-thumbnails/Firefly.jpg' }
  });
  console.log("Python update:", python);

  // Update Summer Camp
  const summerCamp = await prisma.course.updateMany({
    where: { id: 'summer-camp-2026' },
    data: { thumbnail: '/course-thumbnails/SUMMER-CAMP.png' }
  });
  console.log("Summer Camp update:", summerCamp);

  // Update GST Filing
  const gst = await prisma.course.updateMany({
    where: { id: 'course_gst_filing_2024' },
    data: { thumbnail: '/course-thumbnails/GST-FILING.jpeg' }
  });
  console.log("GST update:", gst);

  // Update ITR
  const itr = await prisma.course.updateMany({
    where: { id: 'course_itr_filing_2024' },
    data: { thumbnail: '/course-thumbnails/INCOME-TAX-FILING.jpeg' }
  });
  console.log("ITR update:", itr);

  // Update Combo
  const combo = await prisma.course.updateMany({
    where: { id: 'course_gst_itr_combo_2024' },
    data: { thumbnail: '/course-thumbnails/GST-ITR.png' }
  });
  console.log("Combo update:", combo);

  console.log("Thumbnails successfully updated!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
