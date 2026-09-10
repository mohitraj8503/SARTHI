import { sendPartnershipEmail, PartnershipEmailConfig } from './send-partnership-email';

const schools: PartnershipEmailConfig[] = [
  {
    schoolName: 'Dolphin Public School',
    principalName: 'Mrs. Rita Verma',
    appreciationText: "We appreciate Dolphin Public School's commitment to child-centric development, interactive learning methods, and creating a supportive environment for students to excel.",
    to: 'dolphin.school.muzaffarpur@gmail.com',
  },
  {
    schoolName: 'G.D. Goenka Public School, Jammu',
    appreciationText: "We appreciate G.D. Goenka Public School's progressive academic pathways, child-centric learning environment, and holistic skill development.",
    to: 'info@gdgoenkajammu.org',
  }
];

async function runBatch() {
  for (const school of schools) {
    console.log(`Sending email to ${school.schoolName}...`);
    await sendPartnershipEmail(school);
  }
  process.exit(0);
}

runBatch();
