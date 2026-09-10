import { prisma } from '../lib/prisma';

async function main() {
    const keepTeacherIds = ['TT-TCH-2026-0001', 'TT-FAC-0005'];
    
    // Find teachers to delete
    const teachersToDelete = await prisma.teacher.findMany({
        where: {
            NOT: {
                teacherId: {
                    in: keepTeacherIds
                }
            }
        },
        include: {
            courses: true
        }
    });

    console.log(`Found ${teachersToDelete.length} teachers to delete:`);
    for (const t of teachersToDelete) {
        console.log(`- ID: ${t.id}, teacherId: ${t.teacherId}, Title: ${t.title}`);
        if (t.courses.length > 0) {
            console.log(`  Associated courses: ${t.courses.map(c => c.title).join(', ')}`);
            // Dissociate courses by setting teacherId relation or course field to a kept teacher or null
            // Let's see: Sabiha Siddiqui's Teacher record ID
            const sabihaTeacher = await prisma.teacher.findUnique({
                where: { teacherId: 'TT-TCH-2026-0001' }
            });
            if (sabihaTeacher) {
                console.log(`  Reassigning courses to Sabiha Siddiqui (${sabihaTeacher.id})`);
                await prisma.course.updateMany({
                    where: { teacherId: t.id },
                    data: { teacherId: sabihaTeacher.id }
                });
            }
        }
    }

    const deleteIds = teachersToDelete.map(t => t.id);

    // Delete dependent tables for these teachers
    await prisma.teacherEarning.deleteMany({ where: { teacherId: { in: deleteIds } } });
    await prisma.teacherMessage.deleteMany({ where: { teacherId: { in: deleteIds } } });
    await prisma.teacherPayout.where?.({ teacherId: { in: deleteIds } }) || 
        prisma.$executeRawUnsafe(`DELETE FROM TeacherPayout WHERE teacherId IN (${deleteIds.map(id => `'${id}'`).join(',')})`).catch(() => {});
    
    // Perform deletion
    const deleteResult = await prisma.teacher.deleteMany({
        where: {
            id: {
                in: deleteIds
            }
        }
    });

    console.log(`Successfully deleted ${deleteResult.count} teacher records.`);
}

main().catch(console.error);
