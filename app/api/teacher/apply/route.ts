import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/get-user';
import { 
    teacherApplicationSchema,
    personalDetailsSchema,
    professionalDetailsSchema,
    educationEntrySchema,
    credentialsDetailsSchema,
    teachingDetailsSchema,
    availabilityDetailsSchema,
    reviewDetailsSchema
} from '@/lib/validations/teacher-application';
import { sanitizeObject } from '@/lib/utils/sanitization';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';
import { sendEmail, templates } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const rawBody = await req.json();
        const body = sanitizeObject(rawBody);

        const user = await getServerUser();
        // Allow guest submission (if no user session)
        const effectiveUserId = user?.id || null;
        const effectiveEmail = user?.email || body.personalDetails?.email;

        if (!effectiveEmail) {
            return NextResponse.json({ error: 'Email identity required' }, { status: 400 });
        }
        
        // Validate with Zod
        const validation = teacherApplicationSchema.safeParse(body);
        if (!validation.success) {
            console.error('[TEACHER_APPLY_VALIDATION_ERROR]', validation.error.format());
            return NextResponse.json({ 
                error: 'Validation failed', 
                details: validation.error.format() 
            }, { status: 400 });
        }

        const { 
            step, 
            status,
            personalDetails, 
            professionalDetails, 
            educationDetails, 
            credentialsDetails,
            teachingDetails, 
            availabilityDetails,
            reviewDetails,
            documents 
        } = validation.data;

        // 1. State Transition Guard & Client Status Enforcer
        if (status && status !== 'DRAFT' && status !== 'PENDING') {
            return NextResponse.json({ error: 'Client can only submit DRAFT or PENDING status' }, { status: 400 });
        }

        const requestedStatus = status || 'DRAFT';

        const existingApp = await prisma.teacherApplication.findUnique({
            where: { email: effectiveEmail }
        });

        if (existingApp) {
            const currentStatus = existingApp.status;
            
            // Non-editable states
            const nonEditableStates = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'SUSPENDED', 'DISABLED'];
            if (nonEditableStates.includes(currentStatus)) {
                return NextResponse.json({ 
                    error: `Cannot modify application while it is ${currentStatus}` 
                }, { status: 403 });
            }
        }

        // Map frontend data to Prisma schema with type safety
        const portfolioLinksData = {
          githubUrl: personalDetails?.githubUrl || '',
          personalWebsite: personalDetails?.personalWebsite || ''
        };
        
        const expertiseData = {
          primaryDomain: professionalDetails?.primaryDomain || '',
          currentRole: professionalDetails?.currentRole || '',
          currentCompany: professionalDetails?.currentCompany || '',
          toolsMastery: professionalDetails?.toolsMastery || '',
          teachingCategories: professionalDetails?.teachingCategories || [],
          preferredSessionType: professionalDetails?.preferredSessionType || [],
          languagesKnown: professionalDetails?.languagesKnown || '',
          highestQualification: credentialsDetails?.highestQualification || '',
          certifications: credentialsDetails?.certifications || [],
          awards: credentialsDetails?.awards || '',
          achievements: credentialsDetails?.achievements || '',
          hackathonsParticipated: credentialsDetails?.hackathonsParticipated || '',
          publishedResearch: credentialsDetails?.publishedResearch || '',
          openSourceContributions: credentialsDetails?.openSourceContributions || '',
          teachingExperience: professionalDetails?.teachingExperience || 0,
        };
        
        const teachingPhilosophyData = {
          teachingStyle: teachingDetails?.teachingStyle || '',
          comfortableClassSize: teachingDetails?.comfortableClassSize || '',
          communicationStyle: teachingDetails?.communicationStyle || '',
          sessionLanguage: teachingDetails?.sessionLanguage || [],
          publicSpeakingConfidence: teachingDetails?.publicSpeakingConfidence || 5,
          cameraComfort: teachingDetails?.cameraComfort || 5,
          hasWebcam: teachingDetails?.hasWebcam || false,
          hasMic: teachingDetails?.hasMic || false,
          internetSpeed: teachingDetails?.internetSpeed || '',
          simplifyConcepts: teachingDetails?.simplifyConcepts || '',
          teachingProcess: teachingDetails?.teachingProcess || '',
          keepStudentsEngaged: teachingDetails?.keepStudentsEngaged || '',
          demoSessionLink: teachingDetails?.demoSessionLink || '',
        };
        
        const availabilityData = {
          availableDays: availabilityDetails?.availableDays || [],
          preferredTimeSlots: availabilityDetails?.preferredTimeSlots || [],
          timezone: availabilityDetails?.timezone || '',
          remoteOfflineAvailability: availabilityDetails?.remoteOfflineAvailability || 'Remote & Offline',
          travelAvailability: availabilityDetails?.travelAvailability || false,
          weekendAvailability: availabilityDetails?.weekendAvailability || false,
          monthlyAvailability: availabilityDetails?.monthlyAvailability || '',
          preferredPaymentMethod: availabilityDetails?.preferredPaymentMethod || 'Bank Transfer',
          bankDetails: reviewDetails?.bankDetails || '',
          agreedToNDA: reviewDetails?.agreedToNDA || false,
          hourlyRate: availabilityDetails?.hourlyRate || 0,
          workshopPricing: availabilityDetails?.workshopPricing || 0,
        };

        const applicationData: any = {
            fullName: personalDetails?.fullName,
            email: personalDetails?.email,
            phone: personalDetails?.phone,
            city: personalDetails?.city,
            country: personalDetails?.country,
            profilePhotoUrl: personalDetails?.profilePhotoUrl,
            linkedinUrl: personalDetails?.linkedinUrl,
            portfolioLinks: JSON.stringify(portfolioLinksData),
            
            headline: professionalDetails?.headline,
            bio: personalDetails?.shortBio || professionalDetails?.bio,
            skills: professionalDetails?.skills ? JSON.stringify(professionalDetails.skills) : undefined,
            yearsOfExperience: professionalDetails?.yearsOfExperience ? parseInt(String(professionalDetails.yearsOfExperience)) : 0,
            expertise: JSON.stringify(expertiseData),
            
            preferredSubjects: teachingDetails?.subjects ? JSON.stringify(teachingDetails.subjects) : undefined,
            preferredLevel: 'Intermediate',
            languages: teachingDetails?.sessionLanguage ? JSON.stringify(teachingDetails.sessionLanguage) : undefined,
            demoVideoUrl: teachingDetails?.demoVideoUrl || teachingDetails?.demoSessionLink || '',
            teachingPhilosophy: JSON.stringify(teachingPhilosophyData),
            
            availability: JSON.stringify(availabilityData),
            pricing: availabilityDetails?.hourlyRate ? String(availabilityDetails.hourlyRate) : undefined,
            
            currentStep: step || 1,
            status: requestedStatus,
            updatedAt: new Date(),
        };

        if (requestedStatus === 'PENDING') {
            applicationData.submittedAt = new Date();
        }

        const application = await prisma.$transaction(async (tx) => {
            // Update the main application
            const app = await tx.teacherApplication.upsert({
                where: { email: effectiveEmail },
                update: { ...applicationData, userId: effectiveUserId || undefined },
                create: { ...applicationData, userId: effectiveUserId, email: effectiveEmail }
            });

            // Update user role to TEACHER_PENDING if status is PENDING and user exists
            if (requestedStatus === 'PENDING' && effectiveUserId) {
                await tx.user.update({
                    where: { id: effectiveUserId },
                    data: { role: 'TEACHER_PENDING' }
                });
            }

            // Handle Education entries non-destructively
            if (educationDetails && educationDetails.length > 0) {
                await tx.educationEntry.deleteMany({ where: { applicationId: app.id } });
                await tx.educationEntry.createMany({
                    data: educationDetails.map((edu: any) => ({
                        applicationId: app.id,
                        degree: edu.degree || 'Degree',
                        institution: edu.institution || 'Institution',
                        fieldOfStudy: edu.fieldOfStudy || null,
                        graduationYear: isNaN(parseInt(String(edu.graduationYear))) ? null : parseInt(String(edu.graduationYear))
                    }))
                });
            }

            // Handle Documents non-destructively
            if (documents) {
                await tx.teacherDocument.deleteMany({ where: { applicationId: app.id } });
                const documentEntries: any[] = [];

                Object.entries(documents).forEach(([type, value]) => {
                    if (typeof value === 'string' && value) {
                        documentEntries.push({
                            applicationId: app.id,
                            type: type.toUpperCase(),
                            fileUrl: value
                        });
                    } else if (Array.isArray(value)) {
                        value.forEach((url: string) => {
                            if (url) {
                                documentEntries.push({
                                    applicationId: app.id,
                                    type: type.toUpperCase(),
                                    fileUrl: url
                                });
                            }
                        });
                    }
                });

                if (documentEntries.length > 0) {
                    await tx.teacherDocument.createMany({ data: documentEntries });
                }
            }

            return app;
        });

        // If status is PENDING, we trigger notifications
        if (requestedStatus === 'PENDING') {
            try {
                await sendEmail({
                    to: effectiveEmail,
                    ...templates.teacherApplicationReceived(personalDetails?.fullName || 'Applicant')
                });
            } catch (err) {
                console.error("[EMAIL_ERROR] Teacher Application Received:", err);
            }
        }

        // Audit Logging
        await AuditLogger.log(
            requestedStatus === 'DRAFT' 
              ? AuditAction.TEACHER_APPLICATION_DRAFT_SAVED 
              : AuditAction.TEACHER_APPLICATION_SUBMITTED,
            effectiveUserId || 'GUEST',
            'TEACHER_APPLICATION',
            application.id,
            { step, status: requestedStatus, email: effectiveEmail }
        );

        return NextResponse.json({ 
            success: true, 
            application,
            message: requestedStatus === 'DRAFT' ? 'Draft saved' : 'Application submitted successfully'
        });
    } catch (error: any) {
        console.error('[TEACHER_APPLY_POST]', error);
        // Ensure we return a clean error message
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during submission';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryEmail = searchParams.get('email');
        const user = await getServerUser();

        if (!user && !queryEmail) return NextResponse.json({ status: 'NONE' });

        let application = await prisma.teacherApplication.findFirst({
            where: { 
                OR: [
                    user ? { userId: user.id } : {},
                    user ? { email: user.email } : {},
                    queryEmail ? { email: queryEmail } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            },
            include: { 
                education: true, 
                documents: true 
            }
        });

        if (!application) return NextResponse.json({ status: 'NONE' });

        // If found by email but userId was missing, link it now (only if user is logged in)
        if (user && !application.userId) {
            application = await prisma.teacherApplication.update({
                where: { id: application.id },
                data: { userId: user.id },
                include: { education: true, documents: true }
            });
        }

        // Deserialize fields if present
        let githubUrl = '';
        let personalWebsite = '';
        if (application.portfolioLinks) {
            try {
                const parsed = JSON.parse(application.portfolioLinks);
                githubUrl = parsed.githubUrl || '';
                personalWebsite = parsed.personalWebsite || '';
            } catch (e) {
                githubUrl = application.portfolioLinks || '';
            }
        }
        
        let primaryDomain = '';
        let currentRole = '';
        let currentCompany = '';
        let toolsMastery = '';
        let teachingCategories: string[] = [];
        let preferredSessionType: string[] = [];
        let languagesKnown = '';
        let highestQualification = '';
        let certifications: string[] = [];
        let awards = '';
        let achievements = '';
        let hackathonsParticipated = '';
        let publishedResearch = '';
        let openSourceContributions = '';
        let teachingExperience = 0;
        
        if (application.expertise) {
            try {
                const parsed = JSON.parse(application.expertise);
                primaryDomain = parsed.primaryDomain || '';
                currentRole = parsed.currentRole || '';
                currentCompany = parsed.currentCompany || '';
                toolsMastery = parsed.toolsMastery || '';
                teachingCategories = parsed.teachingCategories || [];
                preferredSessionType = parsed.preferredSessionType || [];
                languagesKnown = parsed.languagesKnown || '';
                highestQualification = parsed.highestQualification || '';
                certifications = parsed.certifications || [];
                awards = parsed.awards || '';
                achievements = parsed.achievements || '';
                hackathonsParticipated = parsed.hackathonsParticipated || '';
                publishedResearch = parsed.publishedResearch || '';
                openSourceContributions = parsed.openSourceContributions || '';
                teachingExperience = parsed.teachingExperience || 0;
            } catch (e) {
                try {
                    const parsed = JSON.parse(application.expertise);
                    teachingExperience = parsed.teachingExperience || 0;
                    toolsMastery = parsed.toolsMastery || '';
                } catch (e2) {}
            }
        }
        
        let teachingStyle = '';
        let audiencePreference: string[] = [];
        let comfortableClassSize = '';
        let communicationStyle = '';
        let sessionLanguage: string[] = [];
        let publicSpeakingConfidence = 5;
        let cameraComfort = 5;
        let hasWebcam = false;
        let hasMic = false;
        let internetSpeed = '';
        let simplifyConcepts = '';
        let teachingProcess = '';
        let keepStudentsEngaged = '';
        let demoSessionLink = '';
        
        if (application.teachingPhilosophy) {
            try {
                const parsed = JSON.parse(application.teachingPhilosophy);
                teachingStyle = parsed.teachingStyle || '';
                audiencePreference = parsed.audiencePreference || [];
                comfortableClassSize = parsed.comfortableClassSize || '';
                communicationStyle = parsed.communicationStyle || '';
                sessionLanguage = parsed.sessionLanguage || [];
                publicSpeakingConfidence = parsed.publicSpeakingConfidence || 5;
                cameraComfort = parsed.cameraComfort || 5;
                hasWebcam = parsed.hasWebcam || false;
                hasMic = parsed.hasMic || false;
                internetSpeed = parsed.internetSpeed || '';
                simplifyConcepts = parsed.simplifyConcepts || '';
                teachingProcess = parsed.teachingProcess || '';
                keepStudentsEngaged = parsed.keepStudentsEngaged || '';
                demoSessionLink = parsed.demoSessionLink || '';
            } catch (e) {
                try {
                    const parsed = JSON.parse(application.teachingPhilosophy);
                    hasWebcam = parsed.hasWebcam || false;
                    hasMic = parsed.hasMic || false;
                    internetSpeed = parsed.internetSpeed || '';
                } catch (e2) {}
            }
        }
        
        let availableDays: string[] = [];
        let preferredTimeSlots: string[] = [];
        let timezone = '';
        let remoteOfflineAvailability = 'Remote & Offline';
        let travelAvailability = false;
        let weekendAvailability = false;
        let monthlyAvailability = '';
        let preferredPaymentMethod = 'Bank Transfer';
        let bankDetails = '';
        let agreedToNDA = false;
        let hourlyRate = 0;
        let workshopPricing = 0;
        
        if (application.availability) {
            try {
                const parsed = JSON.parse(application.availability);
                availableDays = parsed.availableDays || [];
                preferredTimeSlots = parsed.preferredTimeSlots || [];
                timezone = parsed.timezone || '';
                remoteOfflineAvailability = parsed.remoteOfflineAvailability || 'Remote & Offline';
                travelAvailability = parsed.travelAvailability || false;
                weekendAvailability = parsed.weekendAvailability || false;
                monthlyAvailability = parsed.monthlyAvailability || '';
                preferredPaymentMethod = parsed.preferredPaymentMethod || 'Bank Transfer';
                bankDetails = parsed.bankDetails || '';
                agreedToNDA = parsed.agreedToNDA || false;
                hourlyRate = parsed.hourlyRate || 0;
                workshopPricing = parsed.workshopPricing || 0;
            } catch (e) {
                try {
                    const parsed = JSON.parse(application.availability);
                    availableDays = parsed.availableDays || [];
                    bankDetails = parsed.bankDetails || '';
                    agreedToNDA = parsed.agreedToNDA || false;
                } catch (e2) {}
            }
        }

        const responseData = {
            ...application,
            githubUrl,
            personalWebsite,
            
            primaryDomain,
            currentRole,
            currentCompany,
            toolsMastery,
            teachingCategories: JSON.stringify(teachingCategories),
            preferredSessionType: JSON.stringify(preferredSessionType),
            languagesKnown,
            highestQualification,
            certifications: JSON.stringify(certifications),
            awards,
            achievements,
            hackathonsParticipated,
            publishedResearch,
            openSourceContributions,
            teachingExperience,
            
            teachingStyle,
            audiencePreference,
            comfortableClassSize,
            communicationStyle,
            sessionLanguage,
            publicSpeakingConfidence,
            cameraComfort,
            hasWebcam,
            hasMic,
            internetSpeed,
            simplifyConcepts,
            teachingProcess,
            keepStudentsEngaged,
            demoSessionLink,
            
            availableDays,
            preferredTimeSlots,
            timezone,
            remoteOfflineAvailability,
            travelAvailability,
            weekendAvailability,
            monthlyAvailability,
            preferredPaymentMethod,
            bankDetails,
            agreedToNDA,
            hourlyRate,
            workshopPricing
        };


        // Security: If queried only by email (guest), return limited info
        if (!user && queryEmail) {
            return NextResponse.json({
                id: application.id,
                status: application.status,
                fullName: application.fullName,
                email: application.email,
                currentStep: application.currentStep
            });
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('[TEACHER_APPLY_GET]', error);
        return NextResponse.json({ status: 'NONE' });
    }
}
