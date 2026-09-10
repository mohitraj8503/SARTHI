import { prisma } from '../lib/prisma';
import { clearResiliencyCache } from '../lib/resilient-db';

async function cleanTitles() {
  console.log('🧹 Cleaning course titles in Database...');

  const titleUpdates = [
    {
      id: 'cmt1vu9nk0001we18lxnp60gh',
      title: 'Cloud Fundamentals (Microsoft Learn)',
    },
    {
      id: 'course_fintech_innovation_strategy_regulation',
      title: 'Innovation, Strategy and Regulation',
    },
    {
      id: 'course_financial_risk_management_ecl',
      title: 'Financial Risk Management',
    },
    {
      id: 'course_ai_machine_learning_in_banking',
      title: 'AI & Machine Learning in Banking',
    },
    {
      id: 'course_ai_powered_startup_incubation',
      title: 'AI-Powered Startup Incubation',
    },
  ];

  for (const item of titleUpdates) {
    try {
      const updated = await prisma.course.updateMany({
        where: {
          OR: [
            { id: item.id },
            { title: { contains: item.title.replace(' (Microsoft Learn)', '').replace(' (GenAI Startup Forge)', '') } }
          ]
        },
        data: {
          title: item.title,
        }
      });
      console.log(`✅ Updated ${item.id} -> "${item.title}" (${updated.count} rows affected)`);
    } catch (err) {
      console.error(`❌ Failed to update ${item.id}:`, err);
    }
  }

  // Clear query resiliency cache
  clearResiliencyCache();
  console.log('🎉 Course title cleanup completed successfully!');
}

cleanTitles();
