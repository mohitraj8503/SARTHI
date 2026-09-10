import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1, h2 { color: #1a365d; }
    h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.9em; color: #555555; }
    .check-mark { color: #2f855a; font-weight: bold; }
  </style>
</head>
<body>
  <p><strong>To:</strong> <a href="mailto:loyolajsr@gmail.com">loyolajsr@gmail.com</a></p>
  <br>
  <p><strong>Respected Father Vinod Fernandes, S.J.</strong><br>
  <strong>Principal</strong><br>
  <strong>Loyola School, Jamshedpur</strong></p>

  <p>Dear Father,</p>

  <p>Warm greetings from <strong>Team SARTHI</strong>.</p>

  <p>I hope this email finds you well.</p>

  <p>First and foremost, we would like to express our sincere admiration for Loyola School's legacy of academic excellence, discipline, character formation, and holistic education. For decades, Loyola has prepared students not only for examinations but for life itself.</p>

  <p>Today, however, the world is changing faster than ever before.</p>

  <p>Artificial Intelligence, Automation, Robotics, Cybersecurity, Data Science, and Software Development are no longer technologies of the future—they are becoming the foundation of almost every profession. Students entering the workforce in the next 10–15 years will compete in an economy where digital skills are as essential as mathematics, science, and communication.</p>

  <p>As educators, we have a shared responsibility to ensure that today's students are not merely consumers of technology but confident creators, innovators, and problem-solvers.</p>

  <p>With this vision, we are pleased to introduce <strong>SARTHI Juniors</strong>—a comprehensive technology learning platform developed in Jamshedpur to help schools provide practical, industry-relevant technology education in a structured, engaging, and scalable way.</p>

  <h2>Why This Partnership Matters</h2>

  <p>This collaboration is designed to strengthen your existing academic ecosystem—not replace it.</p>

  <p>It enables Loyola School to provide students with structured exposure to:</p>
  <ul>
    <li>Artificial Intelligence (AI)</li>
    <li>Coding & Programming</li>
    <li>Website Development</li>
    <li>App Development</li>
    <li>Computational Thinking</li>
    <li>Digital Creativity</li>
    <li>Emerging Technologies</li>
    <li>Practical Projects</li>
    <li>Industry-Oriented Learning</li>
  </ul>
  <p>All through a single, ready-to-use digital platform.</p>

  <h2>Benefits for Loyola School</h2>

  <p>By partnering with SARTHI Juniors, Loyola School can:</p>
  <p><span class="check-mark">✔</span> Enhance students' future-readiness with practical technology skills.</p>
  <p><span class="check-mark">✔</span> Complement the vision of modern, technology-enabled education encouraged by national education reforms.</p>
  <p><span class="check-mark">✔</span> Provide students with industry-relevant learning beyond the traditional computer curriculum.</p>
  <p><span class="check-mark">✔</span> Offer an engaging digital learning experience with videos, quizzes, projects, and assessments.</p>
  <p><span class="check-mark">✔</span> Monitor student learning through a dedicated school dashboard.</p>
  <p><span class="check-mark">✔</span> Organize coding bootcamps, AI workshops, innovation challenges, and technology events on campus.</p>
  <p><span class="check-mark">✔</span> Receive dedicated local support from our Jamshedpur-based team.</p>

  <p>Most importantly, this partnership allows the school to introduce future-ready technology education without the need to develop a complete curriculum from scratch.</p>

  <h2>Flexible Partnership Models</h2>

  <h3>Option 1 – Integrated School Program</h3>
  <p>Our platform can be incorporated into your existing computer education ecosystem.</p>
  <p>We provide the complete curriculum, learning platform, assessments, projects, and continuous support while your school continues operating with its existing infrastructure.</p>

  <hr>

  <h3>Option 2 – After-School Learning Program</h3>
  <p>Students who wish to explore technology in greater depth can enroll voluntarily and learn online after school hours.</p>
  <p>This model:</p>
  <ul>
    <li>Requires no investment from the school.</li>
    <li>Does not interfere with the regular academic timetable.</li>
    <li>Is managed by the SARTHI team.</li>
    <li>Includes a revenue-sharing opportunity for the institution based on enrollments.</li>
  </ul>

  <h2>Why Choose SARTHI?</h2>

  <p>Unlike generic online learning platforms, SARTHI is built with the needs of schools and students in mind.</p>
  <p>We focus on:</p>
  <ul>
    <li>Structured learning pathways</li>
    <li>Practical, project-based education</li>
    <li>Continuous progress tracking</li>
    <li>Local implementation support</li>
    <li>Long-term partnerships with schools</li>
    <li>Preparing students for tomorrow's careers, not just today's examinations</li>
  </ul>

  <p>Our mission is simple:</p>
  <p><strong>To ensure every student develops the digital confidence, creativity, and technical skills needed to thrive in an AI-driven world.</strong></p>

  <h2>We'd Love to Meet You</h2>

  <p>We would be honored to visit Loyola School for a brief <strong>10–15 minute demonstration</strong> at your convenience. During the meeting, we will showcase the platform, explain the partnership models, answer any questions, and discuss how SARTHI Juniors can align with your institution's educational vision.</p>

  <p>You may also explore our platform and school partnership portal:</p>
  <p><strong>SARTHI Juniors</strong><br>
  <a href="https://sarthi-woad.vercel.app/junior">https://sarthi-woad.vercel.app/junior</a></p>
  <p><strong>School Registration & Partnership</strong><br>
  <a href="https://sarthi-woad.vercel.app/junior/school-registration">https://sarthi-woad.vercel.app/junior/school-registration</a></p>

  <p>Thank you for your valuable time and consideration.</p>

  <p>We sincerely hope to collaborate with Loyola School in empowering the next generation of innovators, engineers, entrepreneurs, and technology leaders.</p>

  <p>We look forward to hearing from you and would be grateful for the opportunity to meet at a time convenient to you.</p>

  <div class="footer">
    <p>Warm Regards,</p>
    <p><strong>Mohit Raj</strong><br>
    <strong>Founder | Team SARTHI</strong></p>
    <p>📧 <a href="mailto:admin@sarthi.in">admin@sarthi.in</a><br>
    📞 +91 98350 19509<br>
    🌐 <a href="https://sarthi-woad.vercel.app">https://sarthi-woad.vercel.app</a><br>
    📍 Jamshedpur, Jharkhand</p>
  </div>
</body>
</html>`;

async function sendEmail() {
  console.log('Sending proposal email to mohitraj8503@gmail.com...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'SARTHI <admin@sarthi.in>',
      to: 'mohitraj8503@gmail.com',
      subject: 'Proposal: Empowering Loyola School Students with SARTHI Juniors',
      html: htmlContent,
    });

    if (error) {
      console.error('Failed to send email:', error);
      process.exit(1);
    }

    console.log('Email sent successfully!', data);
    process.exit(0);
  } catch (err: any) {
    console.error('Error during email sending:', err.message);
    process.exit(1);
  }
}

sendEmail();
