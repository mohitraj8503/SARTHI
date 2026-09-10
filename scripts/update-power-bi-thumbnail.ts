import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/prisma';

async function main() {
    const srcPath = '/home/mohitraj8503/.gemini/antigravity-ide/brain/93b60c58-2d6a-4893-85ed-4208c51dfcd6/media__1784548356891.png';
    const destDir = '/home/mohitraj8503/Documents/sarthi/public/course-thumbnails';
    const destPath = path.join(destDir, 'POWER-BI.png');

    // 1. Copy file
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log('Successfully copied thumbnail to:', destPath);
    } else {
        console.error('Source thumbnail not found at:', srcPath);
        return;
    }

    // 2. Update database course record
    const updatedCourse = await prisma.course.update({
        where: { id: 'course_power_bi_mastery_2026' },
        data: {
            thumbnail: '/course-thumbnails/POWER-BI.png'
        }
    });

    console.log('Successfully updated Power BI Mastery course thumbnail in database:', updatedCourse.thumbnail);
}

main().catch(console.error);
