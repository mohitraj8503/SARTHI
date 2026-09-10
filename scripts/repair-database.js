const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("=== DB Repair Init ===");

    // Active Mohit credentials
    const activeUserId = "cmp9eaqu600008iuvgyokhpxw";
    const activeTeacherId = "cmp9qrrmy0001zzsx13cd4oij";

    // Python Course ID
    const pythonCourseId = "cmouful2u00019rcrv1r8au79";

    // 1. Verify that the course exists
    const course = await prisma.course.findUnique({
      where: { id: pythonCourseId }
    });

    if (!course) {
      console.error(`Error: Python course with ID ${pythonCourseId} not found in the DB!`);
      return;
    }

    console.log("Found Course:", {
      id: course.id,
      title: course.title,
      oldInstructorId: course.instructorId,
      oldTeacherId: course.teacherId
    });

    // 2. Perform reassignment
    const updatedCourse = await prisma.course.update({
      where: { id: pythonCourseId },
      data: {
        instructorId: activeUserId,
        teacherId: activeTeacherId
      }
    });

    console.log("Successfully Reassigned Course to Active Instructor Account:");
    console.log(JSON.stringify(updatedCourse, null, 2));

    // 3. Verify that assignments belonging to this course exist
    const assignments = await prisma.assignment.findMany({
      where: { courseId: pythonCourseId }
    });
    console.log(`\nFound ${assignments.length} assignments linked to this course.`);

    // If assignments have a createdBy or teacher fields, let's verify if they need update
    for (const assignment of assignments) {
      console.log(`- Assignment: "${assignment.title}" (id: ${assignment.id}, createdBy: ${assignment.createdBy})`);
      if (assignment.createdBy !== activeTeacherId) {
        await prisma.assignment.update({
          where: { id: assignment.id },
          data: { createdBy: activeTeacherId }
        });
        console.log(`  -> Updated createdBy to ${activeTeacherId}`);
      }
    }

    console.log("\n=== DB Repair Complete ===");

  } catch (e) {
    console.error("Repair failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
