const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("=== Seeding Course Content (Modules, Lessons, Assignments) ===");

    const courseId = "cmouful2u00019rcrv1r8au79"; // Python for Beginners to Pro
    const teacherId = "cmp9qrrmy0001zzsx13cd4oij"; // Active Teacher ID

    // 1. Create Modules
    console.log("Creating modules...");
    const module1 = await prisma.module.upsert({
      where: { id: "python-mod-1" },
      update: {
        title: "Module 1: Getting Started & Syntax",
        courseId,
        order: 1
      },
      create: {
        id: "python-mod-1",
        title: "Module 1: Getting Started & Syntax",
        courseId,
        order: 1
      }
    });

    const module2 = await prisma.module.upsert({
      where: { id: "python-mod-2" },
      update: {
        title: "Module 2: Control Flow & Structures",
        courseId,
        order: 2
      },
      create: {
        id: "python-mod-2",
        title: "Module 2: Control Flow & Structures",
        courseId,
        order: 2
      }
    });

    console.log(`✅ Modules created: "${module1.title}", "${module2.title}"`);

    // 2. Create Lessons (Video content)
    console.log("Creating video lessons...");
    const lesson1 = await prisma.lesson.upsert({
      where: { id: "python-les-1" },
      update: {
        title: "Lesson 1: Python Installation & IDE Setup",
        description: "Learn how to download Python and set up your development environment using VS Code.",
        videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        upload_status: "COMPLETED",
        contentType: "video",
        duration: 480, // 8 mins
        courseId,
        moduleId: module1.id,
        orderNumber: 1,
        position: 1,
        isPublished: true
      },
      create: {
        id: "python-les-1",
        title: "Lesson 1: Python Installation & IDE Setup",
        description: "Learn how to download Python and set up your development environment using VS Code.",
        videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        upload_status: "COMPLETED",
        contentType: "video",
        duration: 480,
        courseId,
        moduleId: module1.id,
        orderNumber: 1,
        position: 1,
        isPublished: true
      }
    });

    const lesson2 = await prisma.lesson.upsert({
      where: { id: "python-les-2" },
      update: {
        title: "Lesson 2: Variables, Comments, and Print",
        description: "An in-depth guide on variables, comments, and printing outputs in Python.",
        videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        upload_status: "COMPLETED",
        contentType: "video",
        duration: 720, // 12 mins
        courseId,
        moduleId: module1.id,
        orderNumber: 2,
        position: 2,
        isPublished: true
      },
      create: {
        id: "python-les-2",
        title: "Lesson 2: Variables, Comments, and Print",
        description: "An in-depth guide on variables, comments, and printing outputs in Python.",
        videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        upload_status: "COMPLETED",
        contentType: "video",
        duration: 720,
        courseId,
        moduleId: module1.id,
        orderNumber: 2,
        position: 2,
        isPublished: true
      }
    });

    const lesson3 = await prisma.lesson.upsert({
      where: { id: "python-les-3" },
      update: {
        title: "Lesson 3: Conditional Logic & Loops",
        description: "Master if-else conditions and for/while loops in Python.",
        videoUrl: "https://www.youtube.com/watch?v=dp4i1K6g-t0",
        upload_status: "COMPLETED",
        contentType: "video",
        duration: 960, // 16 mins
        courseId,
        moduleId: module2.id,
        orderNumber: 3,
        position: 3,
        isPublished: true
      },
      create: {
        id: "python-les-3",
        title: "Lesson 3: Conditional Logic & Loops",
        description: "Master if-else conditions and for/while loops in Python.",
        videoUrl: "https://www.youtube.com/watch?v=dp4i1K6g-t0",
        upload_status: "COMPLETED",
        contentType: "video",
        duration: 960,
        courseId,
        moduleId: module2.id,
        orderNumber: 3,
        position: 3,
        isPublished: true
      }
    });

    console.log(`✅ Lessons created: "${lesson1.title}", "${lesson2.title}", "${lesson3.title}"`);

    // 3. Create Assignments
    console.log("Creating assignments...");
    const assignment1 = await prisma.assignment.upsert({
      where: { id: "python-asg-1" },
      update: {
        title: "Variables & Output MCQ Quiz",
        description: "Test your understanding of basic Python variable initialization, datatypes, and outputs.",
        lessonId: lesson2.id,
        courseId,
        moduleId: module1.id,
        status: "RELEASED",
        type: "MCQ",
        totalQuestions: 10,
        maxScore: 100,
        createdBy: teacherId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      create: {
        id: "python-asg-1",
        title: "Variables & Output MCQ Quiz",
        description: "Test your understanding of basic Python variable initialization, datatypes, and outputs.",
        lessonId: lesson2.id,
        courseId,
        moduleId: module1.id,
        status: "RELEASED",
        type: "MCQ",
        totalQuestions: 10,
        maxScore: 100,
        createdBy: teacherId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const assignment2 = await prisma.assignment.upsert({
      where: { id: "python-asg-2" },
      update: {
        title: "Control Flow & Loops Coding Assignment",
        description: "Write clean Python programs to practice conditional flows, nested looping structures, and range functions.",
        lessonId: lesson3.id,
        courseId,
        moduleId: module2.id,
        status: "RELEASED",
        type: "PRACTICAL",
        totalQuestions: 5,
        maxScore: 100,
        createdBy: teacherId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      create: {
        id: "python-asg-2",
        title: "Control Flow & Loops Coding Assignment",
        description: "Write clean Python programs to practice conditional flows, nested looping structures, and range functions.",
        lessonId: lesson3.id,
        courseId,
        moduleId: module2.id,
        status: "RELEASED",
        type: "PRACTICAL",
        totalQuestions: 5,
        maxScore: 100,
        createdBy: teacherId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

    const assignment3 = await prisma.assignment.upsert({
      where: { id: "python-asg-3" },
      update: {
        title: "Nested Structures Draft Quiz",
        description: "Review of advanced loop optimization techniques.",
        lessonId: lesson3.id,
        courseId,
        moduleId: module2.id,
        status: "DRAFT",
        type: "MCQ",
        totalQuestions: 10,
        maxScore: 100,
        createdBy: teacherId,
      },
      create: {
        id: "python-asg-3",
        title: "Nested Structures Draft Quiz",
        description: "Review of advanced loop optimization techniques.",
        lessonId: lesson3.id,
        courseId,
        moduleId: module2.id,
        status: "DRAFT",
        type: "MCQ",
        totalQuestions: 10,
        maxScore: 100,
        createdBy: teacherId,
      }
    });

    console.log(`✅ Assignments seeded: "${assignment1.title}", "${assignment2.title}", "${assignment3.title}"`);
    console.log("=== Seeding Course Content Complete ===");

  } catch (e) {
    console.error("Seeding failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
