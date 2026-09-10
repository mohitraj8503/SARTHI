import { prisma } from '@/lib/prisma';
import { authenticateStudent } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export async function GET(request: Request) {
  try {
    const userId = await authenticateStudent(request);
    
    // Fetch grades with course credit weighting
    const grades = await prisma.assignmentSubmission.findMany({
      where: { userId, status: 'graded' },
      include: { 
        assignment: { 
          include: { 
            course: { select: { title: true } } 
          } 
        } 
      }
    });

    // Mock credits for demonstration if not in schema yet
    const gradesWithCredits = grades.map(g => ({
      ...g,
      percentage: (g.score / (g.assignment.maxScore || 100)) * 100,
      course: { 
        ...g.assignment.course,
        credits: 3 // Default 3 credits
      },
      letterGrade: calculateLetter( (g.score / (g.assignment.maxScore || 100)) * 100 )
    }));

    const gpa = calculateWeightedGPA(gradesWithCredits);
    
    return API.ok({
      grades: gradesWithCredits,
      gpa: {
        value: gpa.value,
        scale: '4.0',
        letter: gpa.letter,
        classRank: 12 // Mock rank
      },
      summary: {
        totalCourses: grades.length,
        completedCourses: grades.filter(g => g.status === 'graded').length,
        averageScore: Math.round(gradesWithCredits.reduce((sum, g) => sum + g.percentage, 0) / grades.length || 0)
      }
    });

  } catch (error) {
    console.error('Grades API Error:', error);
    return API.server();
  }
}

function calculateLetter(percentage: number): string {
  if (percentage >= 93) return 'A+';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 60) return 'D';
  return 'F';
}

function calculateWeightedGPA(grades: any[]) {
  if (!grades.length) return { value: 0, letter: 'N/A', percentile: 0 };
  
  const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D': 1.0, 'F': 0
  };

  let totalPoints = 0, totalCredits = 0;
  
  for (const grade of grades) {
    const points = gradePoints[grade.letterGrade] || 0;
    const credits = grade.course?.credits || 3;
    totalPoints += points * credits;
    totalCredits += credits;
  }
  
  const gpaValue = totalCredits > 0 
    ? Math.round((totalPoints / totalCredits) * 100) / 100 
    : 0;
  
  const letterGrade = 
    gpaValue >= 3.7 ? 'A' : gpaValue >= 3.3 ? 'B+' : gpaValue >= 3.0 ? 'B' :
    gpaValue >= 2.7 ? 'B-' : gpaValue >= 2.3 ? 'C+' : gpaValue >= 2.0 ? 'C' :
    gpaValue >= 1.0 ? 'D' : 'F';
  
  return { value: gpaValue, letter: letterGrade };
}

