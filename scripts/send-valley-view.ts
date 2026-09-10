import { sendPartnershipEmail } from './send-partnership-email';

async function main() {
  console.log('Sending proposal email to Valley View School...');
  const result = await sendPartnershipEmail({
    schoolName: 'Valley View School',
    to: 'vvsprincipal2014@gmail.com',
    cc: 'mukulonthenet@gmail.com',
    appreciationText: "We appreciate Valley View School's commitment to delivering progressive educational pathways, student-centric academic growth, and nurturing critical skills in every student.",
  });
  console.log('Response:', JSON.stringify(result, null, 2));
}

main();
