/**
 * Teacher Seeding Script
 * Creates diverse instructors for the platform
 */

import { prisma } from './prisma';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function seedTeachers() {
    try {
        console.log('🌱 Seeding teachers...');

        // Generate random passwords for each teacher
        const teachers = [
            {
                email: 'priya.sharma@sarthi.com',
                name: 'Priya Sharma',
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                role: 'TEACHER',
                bio: 'Expert in Finance, Taxation & Business Analytics with 8+ years of corporate experience',
                company: 'SARTHI Academy',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
            },
            {
                email: 'rahul.verma@sarthi.com',
                name: 'Rahul Verma',
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                role: 'TEACHER',
                bio: 'Senior Software Engineer & Programming Mentor specializing in Python, JavaScript & Web Development',
                company: 'Google India',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            },
            {
                email: 'anjali.mehra@sarthi.com',
                name: 'Anjali Mehra',
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                role: 'TEACHER',
                bio: 'Data Science Consultant & AI Expert with experience at top tech companies',
                company: 'Microsoft India',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
            },
            {
                email: 'vikas.jain@sarthi.com',
                name: 'Vikas Jain',
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                role: 'TEACHER',
                bio: 'Cybersecurity Specialist & Ethical Hacker with 10+ years in information security',
                company: 'Deloitte',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            },
            {
                email: 'kavita.singh@sarthi.com',
                name: 'Kavita Singh',
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                role: 'TEACHER',
                bio: 'UX/UI Designer & Design Thinking Coach with experience at leading design agencies',
                company: 'Adobe India',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
            }
        ];

        for (const teacher of teachers) {
            // Check if teacher already exists
            const existing = await prisma.user.findUnique({
                where: { email: teacher.email }
            });

            if (!existing) {
                await prisma.user.create({
                    data: {
                        email: teacher.email,
                        name: teacher.name,
                        password: teacher.password,
                         
                        role: teacher.role as any,
                        bio: teacher.bio,
                        company: teacher.company,
                        image: teacher.image
                    }
                });
                console.log(`✅ Created teacher: ${teacher.name}`);
            } else {
                console.log(`⚠️  Teacher already exists: ${teacher.name}`);
            }
        }

        console.log('🎉 Teachers seeded successfully!');
        return teachers;
    } catch (error) {
        console.error('❌ Error seeding teachers:', error);
        throw error;
    }
}

// For direct execution
if (require.main === module) {
    seedTeachers()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
