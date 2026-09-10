import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Future-Ready Education for Loyola School</title>
  <style>
    /* Reset & Base styles */
    body {
      margin: 0;
      padding: 0;
      background-color: #f6f9f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .wrapper {
      background-color: #f6f9f6;
      padding: 30px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(27, 67, 50, 0.05);
      border: 1px solid #e2ebd5;
    }
    
    /* Header & Hero */
    .hero {
      padding: 40px 35px;
      text-align: center;
      background: linear-gradient(185deg, #ffffff, #f0f7f0);
      border-bottom: 1px solid #eef5eb;
    }
    .logo {
      margin: 0 auto 20px auto;
      width: 70px;
    }
    .hero-title {
      font-size: 28px;
      font-weight: 800;
      color: #1b4332;
      line-height: 1.25;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }
    .hero-subtitle {
      font-size: 16px;
      color: #52b788;
      font-weight: 600;
      margin: 0 0 25px 0;
    }
    
    /* Buttons */
    .btn {
      display: inline-block;
      background-color: #1b4332;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      text-align: center;
      min-width: 180px;
      box-shadow: 0 4px 12px rgba(27, 67, 50, 0.15);
    }
    
    /* Content sections */
    .content-body {
      padding: 35px 35px 20px 35px;
    }
    .salutation {
      font-size: 16px;
      color: #334155;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    
    /* Panel / Callout */
    .panel {
      background-color: #f0f7f3;
      border-left: 4px solid #52b788;
      padding: 20px;
      border-radius: 0 12px 12px 0;
      margin: 25px 0;
    }
    .panel-text {
      margin: 0;
      font-size: 15px;
      color: #1e3f20;
      line-height: 1.7;
      font-style: italic;
    }
    
    /* Section Headers */
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1b4332;
      margin: 35px 0 20px 0;
      border-bottom: 2px solid #f0f7f0;
      padding-bottom: 8px;
    }
    
    /* Two-column grid for Feature Cards */
    .card {
      background-color: #fafdfb;
      border: 1px solid #eef5eb;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 15px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #1b4332;
      margin: 0 0 6px 0;
    }
    .card-desc {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }
    
    /* Benefits List */
    .benefit-item {
      font-size: 15px;
      margin-bottom: 14px;
      line-height: 1.5;
      color: #334155;
    }
    .benefit-check {
      color: #52b788;
      font-weight: bold;
      margin-right: 8px;
      font-size: 16px;
    }
    
    /* Comparison Table / Cards */
    .model-card {
      border: 1px solid #e2ebd5;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 15px;
      background-color: #ffffff;
    }
    .model-card.integrated {
      border-top: 4px solid #1b4332;
      background-color: #fafdfb;
    }
    .model-card.after-school {
      border-top: 4px solid #52b788;
      background-color: #f7fcf9;
    }
    .model-title {
      font-size: 17px;
      font-weight: 700;
      color: #1b4332;
      margin: 0 0 10px 0;
    }
    .model-features {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .model-feature-item {
      font-size: 14px;
      color: #475569;
      padding: 6px 0;
      border-bottom: 1px dashed #eef5eb;
    }
    .model-feature-item:last-child {
      border-bottom: none;
    }
    
    /* Footer section */
    .footer {
      background-color: #1b4332;
      color: #ffffff;
      padding: 40px 35px;
      text-align: center;
    }
    .footer-title {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 15px 0;
    }
    .footer-links {
      font-size: 14px;
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .footer-links a {
      color: #ffffff;
      text-decoration: underline;
    }
    .footer-bottom {
      font-size: 12px;
      color: #a3b899;
      border-top: 1px solid #2d5a47;
      padding-top: 20px;
      margin-top: 20px;
    }
    
    /* Responsive styling */
    @media only screen and (max-width: 600px) {
      .hero-title {
        font-size: 24px;
      }
      .content-body {
        padding: 25px 20px;
      }
      .grid-table td {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Hero Section -->
      <div class="hero">
        <img class="logo" src="https://sarthi-woad.vercel.app/sarthi-logo.png" alt="SARTHI">
        <h1 class="hero-title">Future-Ready Education for Loyola School</h1>
        <p class="hero-subtitle">Empowering students with AI, Coding & Emerging Technologies</p>
        <a href="https://sarthi-woad.vercel.app/junior/school-registration" class="btn">Explore Partnership</a>
      </div>
      
      <!-- Content Body -->
      <div class="content-body">
        <div class="salutation">
          <p><strong>Respected Father Vinod Fernandes, S.J.</strong><br>
          Principal, Loyola School, Jamshedpur</p>
          <p>Dear Father, <br>Warm greetings from <strong>Team SARTHI</strong>.</p>
          <p>First and foremost, we admire Loyola School's legacy of academic excellence, character formation, and holistic education. Today, the world is changing faster than ever, and preparing students with emerging tech skills is essential for their future careers.</p>
        </div>
        
        <!-- Why Now Panel -->
        <div class="panel">
          <p class="panel-text">
            "By 2030, AI and digital technologies will influence almost every profession. Schools introducing students to coding, AI, and computational thinking today are actively building the foundation for tomorrow's creators and innovators."
          </p>
        </div>
        
        <p class="salutation">
          With this vision, we introduce <strong>SARTHI Juniors</strong>—a comprehensive, structured technology learning platform developed in Jamshedpur to help schools implement practical tech education easily.
        </p>

        <!-- Focus Areas Grid -->
        <div class="section-title">Core Learning Areas</div>
        
        <table class="grid-table" width="100%">
          <tr>
            <td width="50%" valign="top" style="padding-right: 8px;">
              <div class="card">
                <div class="card-title">🧠 Artificial Intelligence</div>
                <p class="card-desc">Foundational concepts of AI, machine learning, and future applications.</p>
              </div>
              <div class="card">
                <div class="card-title">💻 Coding & Programming</div>
                <p class="card-desc">Developing logic and software creation skills through code.</p>
              </div>
              <div class="card">
                <div class="card-title">🌐 Web Development</div>
                <p class="card-desc">Building and launching responsive websites from scratch.</p>
              </div>
            </td>
            <td width="50%" valign="top" style="padding-left: 8px;">
              <div class="card">
                <div class="card-title">📱 App Development</div>
                <p class="card-desc">Designing, creating, and publishing mobile applications.</p>
              </div>
              <div class="card">
                <div class="card-title">🤖 Emerging Technologies</div>
                <p class="card-desc">Exposure to computational thinking and digital creativity tools.</p>
              </div>
              <div class="card">
                <div class="card-title">🎯 Project-Based Learning</div>
                <p class="card-desc">Interactive curriculum focusing on building real-world projects.</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- School Benefits -->
        <div class="section-title">Why Schools Partner with SARTHI</div>
        
        <div class="benefit-item"><span class="benefit-check">✔</span> Future-ready curriculum aligned with modern standards</div>
        <div class="benefit-item"><span class="benefit-check">✔</span> Dedicated Jamshedpur-based local team support</div>
        <div class="benefit-item"><span class="benefit-check">✔</span> Interactive student dashboard with progress tracking</div>
        <div class="benefit-item"><span class="benefit-check">✔</span> Engaging videos, quizzes, projects, and assessments</div>
        <div class="benefit-item"><span class="benefit-check">✔</span> On-campus workshops, coding bootcamps, and events</div>
        <div class="benefit-item"><span class="benefit-check">✔</span> Complete curriculum support without overhead infrastructure</div>

        <!-- Partnership Models -->
        <div class="section-title">Flexible Partnership Models</div>
        
        <div class="model-card-container">
          <table class="grid-table" width="100%">
            <tr>
              <td width="50%" valign="top" style="padding-right: 8px;">
                <div class="model-card integrated">
                  <div class="model-title">Option 1: Integrated Program</div>
                  <ul class="model-features">
                    <li class="model-feature-item">Incorporates into computer timetable</li>
                    <li class="model-feature-item">Curriculum & assessments included</li>
                    <li class="model-feature-item">Teacher dashboard & support</li>
                  </ul>
                </div>
              </td>
              <td width="50%" valign="top" style="padding-left: 8px;">
                <div class="model-card after-school">
                  <div class="model-title">Option 2: After-School Program</div>
                  <ul class="model-features">
                    <li class="model-feature-item">Runs online after school hours</li>
                    <li class="model-feature-item">Zero investment from school</li>
                    <li class="model-feature-item">Revenue-sharing opportunities</li>
                  </ul>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <p class="salutation" style="text-align: center; margin-top: 30px;">
          We would be honored to visit for a brief <strong>10–15 minute demo</strong> at your convenience.
        </p>
        
        <div style="text-align: center; margin: 25px 0 10px 0;">
          <a href="https://sarthi-woad.vercel.app/junior/school-registration" class="btn">Schedule a Demo</a>
        </div>

      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-title">Have Questions? Let's Connect.</div>
        <div class="footer-links">
          📧 <strong><a href="mailto:admin@sarthi.in" style="color: #ffffff;">admin@sarthi.in</a></strong><br>
          📞 <strong>+91 98350 19509</strong><br>
          🌐 <strong><a href="https://sarthi-woad.vercel.app" style="color: #ffffff;">sarthi-woad.vercel.app</a></strong>
        </div>
        <div class="footer-bottom">
          &copy; 2026 SARTHI. All Rights Reserved.<br>
          Jamshedpur, Jharkhand
        </div>
      </div>
      
    </div>
  </div>
</body>
</html>`;

const recipients = ['mohitraj8503@gmail.com', 'rishikakumari0006@gmail.com'];

async function sendBrandedEmails() {
  for (const recipient of recipients) {
    console.log(`Sending updated landing-page-style email to ${recipient}...`);
    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: recipient,
        subject: 'Proposal: Empowering Loyola School Students with SARTHI Juniors',
        html: htmlContent,
      });

      if (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
      } else {
        console.log(`Email sent successfully to ${recipient}!`, data);
      }
    } catch (err: any) {
      console.error(`Error during email sending to ${recipient}:`, err.message);
    }
  }
  process.exit(0);
}

sendBrandedEmails();
