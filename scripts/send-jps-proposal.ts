import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strategic Partnership Proposal — Jamshedpur Public School</title>
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
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(27, 67, 50, 0.06);
      border: 1px solid #e2ebd5;
    }

    /* Exclusive Personalization Badge */
    .personalization-badge {
      background-color: #eef6ee;
      padding: 14px 20px;
      text-align: center;
      border-bottom: 1px solid #dbead5;
    }
    .badge-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #1b4332;
      font-weight: 800;
      margin: 0 0 2px 0;
      display: block;
    }
    .badge-school {
      font-size: 14px;
      font-weight: 700;
      color: #2d6a4f;
      margin: 0;
    }

    /* Header & Hero */
    .hero {
      padding: 45px 35px;
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
      font-size: 15px;
      color: #52b788;
      font-weight: 600;
      margin: 0 0 25px 0;
      line-height: 1.5;
    }

    /* Buttons */
    .btn {
      display: inline-block;
      background-color: #1b4332;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 30px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      text-align: center;
      min-width: 220px;
      box-shadow: 0 5px 15px rgba(27, 67, 50, 0.15);
    }

    /* Content body */
    .content-body {
      padding: 40px 35px 20px 35px;
    }
    .salutation {
      font-size: 16px;
      color: #334155;
      margin-bottom: 24px;
      line-height: 1.7;
    }

    /* "Why Now" Card */
    .why-now-card {
      background-color: #f7fcf9;
      border: 1.5px solid #d8f3dc;
      border-radius: 16px;
      padding: 24px;
      margin: 30px 0;
    }
    .why-now-title {
      font-size: 16px;
      font-weight: 800;
      color: #1b4332;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .why-now-text {
      margin: 0;
      font-size: 15px;
      color: #334155;
      line-height: 1.7;
    }

    /* Metric Badges Row */
    .metrics-table {
      margin: 25px 0;
    }
    .metric-badge {
      background-color: #fafdfb;
      border: 1px solid #eef5eb;
      border-radius: 10px;
      padding: 10px 5px;
      text-align: center;
    }
    .metric-value {
      font-size: 15px;
      font-weight: 800;
      color: #1b4332;
      margin-bottom: 2px;
    }
    .metric-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    /* Section Title */
    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #1b4332;
      margin: 40px 0 20px 0;
      border-bottom: 2px solid #f0f7f0;
      padding-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* 2x3 Grid for Feature Cards */
    .card {
      background-color: #fafdfb;
      border: 1px solid #eef5eb;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 15px;
      height: 70px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #1b4332;
      margin: 0 0 4px 0;
    }
    .card-desc {
      font-size: 12px;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    /* Benefits Section */
    .benefit-section {
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .benefit-section.students {
      background-color: #f7fcf9;
      border: 1px solid #d8f3dc;
    }
    .benefit-section.teachers {
      background-color: #fafdfc;
      border: 1px solid #e2f0d9;
    }
    .benefit-section.school {
      background-color: #f5faf6;
      border: 1px solid #dbead5;
    }
    .benefit-section-title {
      font-size: 16px;
      font-weight: 800;
      color: #1b4332;
      margin-top: 0;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .benefit-item {
      font-size: 14.5px;
      margin-bottom: 12px;
      line-height: 1.6;
      color: #334155;
    }
    .benefit-item:last-child {
      margin-bottom: 0;
    }
    .benefit-check {
      color: #52b788;
      font-weight: bold;
      margin-right: 8px;
      font-size: 15px;
    }

    /* Model Cards */
    .model-card {
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 15px;
      background-color: #ffffff;
      border: 1px solid #e2ebd5;
    }
    .model-card.integrated {
      border-top: 5px solid #2d6a4f;
      background-color: #fafdfb;
    }
    .model-card.after-school {
      border-top: 5px solid #52b788;
      background-color: #f7fcf9;
    }
    .model-title {
      font-size: 16px;
      font-weight: 800;
      color: #1b4332;
      margin: 0 0 12px 0;
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

    /* Timeline Section */
    .timeline-table {
      margin: 25px 0;
    }
    .timeline-step {
      background-color: #fafdfb;
      border: 1px solid #eef5eb;
      border-radius: 12px;
      padding: 15px 10px;
      text-align: center;
    }
    .step-number {
      font-size: 12px;
      font-weight: 800;
      color: #52b788;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .step-title {
      font-size: 13px;
      font-weight: 700;
      color: #1b4332;
    }

    /* Footer & Trust Block */
    .trust-badge {
      font-size: 14px;
      font-weight: 700;
      color: #2d6a4f;
      text-align: center;
      margin: 35px 0 20px 0;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
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
        font-size: 22px;
      }
      .content-body {
        padding: 25px 20px;
      }
      .grid-table td {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-bottom: 12px;
      }
      .metrics-table td {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px;
      }
      .timeline-table td {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px;
      }
      .card {
        height: auto;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Exclusive Personalization Badge -->
      <div class="personalization-badge">
        <span class="badge-label">Prepared Exclusively for</span>
        <span class="badge-school">Jamshedpur Public School</span>
      </div>

      <!-- Hero Section -->
      <div class="hero">
        <img class="logo" src="https://sarthi-woad.vercel.app/sarthi-logo.png" alt="SARTHILogo">
        <h1 class="hero-title">Preparing JPS Students for an AI-Driven Future</h1>
        <p class="hero-subtitle">Structured AI, Coding & Technology Education that complements your existing academic excellence.</p>
        <a href="https://sarthi-woad.vercel.app/junior" class="btn">Explore SARTHI Juniors</a>
      </div>

      <!-- Content Body -->
      <div class="content-body">
        <div class="salutation">
          <p><strong>Respected Mrs. Namita Agarwal,</strong><br>
          Principal, Jamshedpur Public School (JPS), Jamshedpur</p>
          
          <p>Dear Madam,</p>
          <p>Warm greetings from <strong>Team SARTHI</strong>.</p>
          
          <p>We hold deep admiration for Jamshedpur Public School's long-standing legacy of academic excellence, activity-based pedagogy, and focus on preparing responsible, well-rounded citizens. Your emphasis on project-based learning and practical growth aligns directly with our educational vision.</p>
        </div>

        <!-- Why Now Card -->
        <div class="why-now-card">
          <div class="why-now-title">Why This Matters</div>
          <p class="why-now-text">
            AI is rapidly reshaping careers across all industries. Schools that introduce students to coding, computational thinking, and digital creativity today are helping them build the confidence and skills they will need for tomorrow's opportunities.
          </p>
        </div>

        <p class="salutation">
          With this mission, we present <strong>SARTHI Juniors</strong>—a comprehensive, Jamshedpur-grown technology education platform built to easily extend school infrastructure and bring structured emerging-tech pathways directly inside the classroom.
        </p>

        <!-- Metric badges table -->
        <table class="metrics-table" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="padding-right: 5px;">
              <div class="metric-badge">
                <div class="metric-value">Classes I–XII</div>
                <div class="metric-label">Target Segments</div>
              </div>
            </td>
            <td width="33%" style="padding: 0 2.5px;">
              <div class="metric-badge">
                <div class="metric-value">6 Tech Tracks</div>
                <div class="metric-label">Broad Curriculum</div>
              </div>
            </td>
            <td width="33%" style="padding-left: 5px;">
              <div class="metric-badge">
                <div class="metric-value">Local Support</div>
                <div class="metric-label">Jamshedpur Based</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Focus Areas Grid -->
        <div class="section-title">Core Learning Tracks</div>
        
        <table class="grid-table" width="100%">
          <tr>
            <td width="50%" valign="top" style="padding-right: 8px;">
              <div class="card">
                <div class="card-title">🧠 AI Literacy</div>
                <p class="card-desc">Concepts of machine learning, logic flows, and prompt design.</p>
              </div>
              <div class="card">
                <div class="card-title">💻 Coding</div>
                <p class="card-desc">Foundational programming block-based and syntax logic.</p>
              </div>
              <div class="card">
                <div class="card-title">🌐 Web Development</div>
                <p class="card-desc">Building structures, websites, and responsive layouts.</p>
              </div>
            </td>
            <td width="50%" valign="top" style="padding-left: 8px;">
              <div class="card">
                <div class="card-title">📱 App Development</div>
                <p class="card-desc">Constructing interactive mobile application mockups & tools.</p>
              </div>
              <div class="card">
                <div class="card-title">🎯 Projects</div>
                <p class="card-desc">Applying digital techniques to solve tangible real-life challenges.</p>
              </div>
              <div class="card">
                <div class="card-title">🏆 Digital Portfolio & Certificates</div>
                <p class="card-desc">Earning verified credentials and compiling creative work portfolios.</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Ecosystem Benefits -->
        <div class="section-title">Benefits for JPS Community</div>
        
        <!-- For Students -->
        <div class="benefit-section students">
          <div class="benefit-section-title">For Students</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Interactive AI literacy, coding pathways, and logic modules.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Real-world website, software, and application projects.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Cumulative digital portfolio and certificates to showcase achievements.</div>
        </div>

        <!-- For Teachers -->
        <div class="benefit-section teachers">
          <div class="benefit-section-title">For Teachers</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Comprehensive ready-made curriculum with detailed lesson plans.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Interactive progress tracking dashboard with auto-evaluations.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Significantly reduced preparation workloads with continuous support.</div>
        </div>

        <!-- For JPS -->
        <div class="benefit-section school">
          <div class="benefit-section-title">For Jamshedpur Public School</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Future-ready tech ecosystem to complement existing academic systems.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Coding competitions, AI bootcamps, and digital workshops on campus.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Dedicated Jamshedpur-based support team for immediate operational help.</div>
        </div>

        <!-- Partnership Models -->
        <div class="section-title">Flexible Engagement Models</div>
        
        <div class="model-card-container">
          <table class="grid-table" width="100%">
            <tr>
              <td width="50%" valign="top" style="padding-right: 8px;">
                <div class="model-card integrated">
                  <div class="model-title">🟢 Integrated School Technology Program</div>
                  <ul class="model-features">
                    <li class="model-feature-item">Blended directly into the school computer classes</li>
                    <li class="model-feature-item">Full curriculum support & dashboard system</li>
                    <li class="model-feature-item">Direct teacher training & local orientation</li>
                  </ul>
                </div>
              </td>
              <td width="50%" valign="top" style="padding-left: 8px;">
                <div class="model-card after-school">
                  <div class="model-title">🔵 After-School Technology Enrichment</div>
                  <ul class="model-features">
                    <li class="model-feature-item">Optional enrichment program after school hours</li>
                    <li class="model-feature-item">Fully managed online by the SARTHI team</li>
                    <li class="model-feature-item">Zero operational effort or setup cost to JPS</li>
                  </ul>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Implementation Timeline -->
        <div class="section-title">Simple Implementation Timeline</div>
        
        <table class="timeline-table" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="25%" style="padding-right: 4px;">
              <div class="timeline-step">
                <div class="step-number">Step 1</div>
                <div class="step-title">Discovery Meeting</div>
              </div>
            </td>
            <td width="25%" style="padding: 0 2px;">
              <div class="timeline-step">
                <div class="step-number">Step 2</div>
                <div class="step-title">School Registration</div>
              </div>
            </td>
            <td width="25%" style="padding: 0 2px;">
              <div class="timeline-step">
                <div class="step-number">Step 3</div>
                <div class="step-title">Platform Setup</div>
              </div>
            </td>
            <td width="25%" style="padding-left: 4px;">
              <div class="timeline-step">
                <div class="step-number">Step 4</div>
                <div class="step-title">Learning Begins</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Call to Action Section -->
        <div style="text-align: center; margin: 40px 0 20px 0; background-color: #fafdfb; border: 1px solid #eef5eb; border-radius: 16px; padding: 25px;">
          <h3 style="margin: 0 0 10px 0; color: #1b4332; font-size: 18px; font-weight: 800;">Schedule a 15-Minute School Presentation</h3>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.5;">We'll demonstrate the platform, answer your questions, and discuss how it can complement JPS's academic vision.</p>
          <a href="https://sarthi-woad.vercel.app/junior/school-registration" class="btn">Request Brief Presentation</a>
        </div>

      </div>

      <!-- Trust Footer Banner -->
      <div class="trust-badge">
        Built in Jamshedpur. Designed for Schools. Focused on Future-Ready Learning.
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

const recipient = 'principal@jamshedpurpublicschool.in';
const ccRecipient = 'jpsaiwc1988@gmail.com';

async function sendJpsEmails() {
  console.log(`Sending JPS proposal email to ${recipient} (CC: ${ccRecipient})...`);
  try {
    const { data, error } = await resend.emails.send({
      from: 'SARTHI <admin@sarthi.in>',
      to: recipient,
      cc: ccRecipient,
      subject: 'Proposal: Preparing JPS Students for an AI-Driven Future',
      html: htmlContent,
    });

    if (error) {
      console.error(`Failed to send email to ${recipient}:`, error);
      process.exit(1);
    } else {
      console.log(`Email sent successfully to ${recipient}!`, data);
      process.exit(0);
    }
  } catch (err: any) {
    console.error(`Error during email sending to ${recipient}:`, err.message);
    process.exit(1);
  }
}

sendJpsEmails();
