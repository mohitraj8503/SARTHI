import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export interface PartnershipEmailConfig {
  schoolName: string;
  principalName?: string;
  appreciationText: string;
  to: string;
  cc?: string;
}

export function generateSchoolTemplate(cfg: PartnershipEmailConfig): string {
  const greeting = cfg.principalName 
    ? `<strong>Respected ${cfg.principalName},</strong><br>Principal, ${cfg.schoolName}`
    : `<strong>Respected Principal,</strong><br>${cfg.schoolName}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strategic Partnership Proposal — ${cfg.schoolName}</title>
  <style>
    body {
      margin: 0; padding: 0; background-color: #f6f9f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #334155; -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: collapse; width: 100%; }
    img { max-width: 100%; height: auto; display: block; }
    .wrapper { background-color: #f6f9f6; padding: 30px 15px; }
    .container {
      max-width: 600px; margin: 0 auto; background-color: #ffffff;
      border-radius: 24px; overflow: hidden;
      box-shadow: 0 15px 35px rgba(27, 67, 50, 0.06); border: 1px solid #e2ebd5;
    }
    .personalization-badge {
      background-color: #eef6ee; padding: 14px 20px; text-align: center; border-bottom: 1px solid #dbead5;
    }
    .badge-label {
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
      color: #1b4332; font-weight: 800; margin: 0 0 2px 0; display: block;
    }
    .badge-school { font-size: 14px; font-weight: 700; color: #2d6a4f; margin: 0; }
    .hero {
      padding: 45px 35px; text-align: center;
      background: linear-gradient(185deg, #ffffff, #f0f7f0); border-bottom: 1px solid #eef5eb;
    }
    .logo { margin: 0 auto 20px auto; width: 70px; }
    .hero-title {
      font-size: 28px; font-weight: 800; color: #1b4332; line-height: 1.25; margin: 0 0 12px 0; letter-spacing: -0.5px;
    }
    .hero-subtitle {
      font-size: 15px; color: #52b788; font-weight: 600; margin: 0 0 25px 0; line-height: 1.5;
    }
    .btn {
      display: inline-block; background-color: #1b4332; color: #ffffff !important;
      text-decoration: none; padding: 15px 30px; border-radius: 12px;
      font-weight: 700; font-size: 15px; text-align: center; min-width: 220px;
      box-shadow: 0 5px 15px rgba(27, 67, 50, 0.15);
    }
    .content-body { padding: 40px 35px 20px 35px; }
    .salutation { font-size: 16px; color: #334155; margin-bottom: 24px; line-height: 1.7; }
    .why-now-card { background-color: #f7fcf9; border: 1.5px solid #d8f3dc; border-radius: 16px; padding: 24px; margin: 30px 0; }
    .why-now-title { font-size: 16px; font-weight: 800; color: #1b4332; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .why-now-text { margin: 0; font-size: 15px; color: #334155; line-height: 1.7; }
    .metrics-table { margin: 25px 0; }
    .metric-badge { background-color: #fafdfb; border: 1px solid #eef5eb; border-radius: 10px; padding: 10px 5px; text-align: center; }
    .metric-value { font-size: 15px; font-weight: 800; color: #1b4332; margin-bottom: 2px; }
    .metric-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
    .section-title {
      font-size: 20px; font-weight: 800; color: #1b4332; margin: 40px 0 20px 0;
      border-bottom: 2px solid #f0f7f0; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .card { background-color: #fafdfb; border: 1px solid #eef5eb; border-radius: 12px; padding: 16px; margin-bottom: 15px; height: 70px; }
    .card-title { font-size: 15px; font-weight: 700; color: #1b4332; margin: 0 0 4px 0; }
    .card-desc { font-size: 12px; color: #64748b; margin: 0; line-height: 1.4; }
    .benefit-section { border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    .benefit-section.students { background-color: #f7fcf9; border: 1px solid #d8f3dc; }
    .benefit-section.teachers { background-color: #fafdfc; border: 1px solid #e2f0d9; }
    .benefit-section.school { background-color: #f5faf6; border: 1px solid #dbead5; }
    .benefit-section-title { font-size: 16px; font-weight: 800; color: #1b4332; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em; }
    .benefit-item { font-size: 14.5px; margin-bottom: 12px; line-height: 1.6; color: #334155; }
    .benefit-item:last-child { margin-bottom: 0; }
    .benefit-check { color: #52b788; font-weight: bold; margin-right: 8px; font-size: 15px; }
    .model-card { border-radius: 16px; padding: 24px; margin-bottom: 15px; background-color: #ffffff; border: 1px solid #e2ebd5; }
    .model-card.integrated { border-top: 5px solid #2d6a4f; background-color: #fafdfb; }
    .model-card.after-school { border-top: 5px solid #52b788; background-color: #f7fcf9; }
    .model-title { font-size: 16px; font-weight: 800; color: #1b4332; margin: 0 0 12px 0; }
    .model-features { margin: 0; padding: 0; list-style: none; }
    .model-feature-item { font-size: 14px; color: #475569; padding: 6px 0; border-bottom: 1px dashed #eef5eb; }
    .model-feature-item:last-child { border-bottom: none; }
    .timeline-table { margin: 25px 0; }
    .timeline-step { background-color: #fafdfb; border: 1px solid #eef5eb; border-radius: 12px; padding: 15px 10px; text-align: center; }
    .step-number { font-size: 12px; font-weight: 800; color: #52b788; margin-bottom: 4px; text-transform: uppercase; }
    .step-title { font-size: 13px; font-weight: 700; color: #1b4332; }
    .footer { background-color: #1b4332; color: #ffffff; padding: 45px 35px; text-align: center; }
    .footer-title { font-size: 18px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: 0.02em; }
    .footer-links { font-size: 14px; margin-bottom: 30px; line-height: 1.8; }
    .footer-links a { color: #ffffff; text-decoration: underline; }
    .footer-divider { border-top: 1px solid #2d5a47; margin: 25px 0; }
    .footer-trust { font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 6px; }
    .footer-tagline { font-size: 13px; color: #a3b899; margin-bottom: 25px; }
    .footer-bottom { font-size: 12px; color: #a3b899; }
    @media only screen and (max-width: 600px) {
      .hero-title { font-size: 22px; }
      .content-body { padding: 25px 20px; }
      .grid-table td, .metrics-table td, .timeline-table td { display: block !important; width: 100% !important; margin-bottom: 12px; padding: 0 !important; }
      .card { height: auto; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="personalization-badge">
        <span class="badge-label">Prepared Exclusively for</span>
        <span class="badge-school">${cfg.schoolName}</span>
      </div>
      <div class="hero">
        <img class="logo" src="https://sarthi-woad.vercel.app/sarthi-logo.png" alt="SARTHILogo">
        <h1 class="hero-title">Preparing ${cfg.schoolName} Students for Tomorrow's Digital World</h1>
        <p class="hero-subtitle">Structured AI, Coding & Technology Education that complements your existing academic excellence.</p>
        <a href="https://sarthi-woad.vercel.app/junior" class="btn">Book a 15-Minute School Presentation</a>
      </div>
      <div class="content-body">
        <div class="salutation">
          <p>${greeting}</p>
          <p>Dear Sir/Madam,</p>
          <p>Warm greetings from <strong>Team SARTHI</strong>.</p>
          <p>${cfg.appreciationText}</p>
        </div>
        <div class="why-now-card">
          <div class="why-now-title">Why This Matters</div>
          <p class="why-now-text">
            AI is rapidly reshaping careers across all industries. Schools that introduce students to coding, computational thinking, and digital creativity today are helping them build the confidence and skills they will need for tomorrow's opportunities.
          </p>
        </div>
        <p class="salutation">
          With this mission, we present <strong>SARTHI Juniors</strong>—a comprehensive **Made-in-India technology education platform** designed to help schools introduce structured AI, Coding, Digital Literacy, and emerging technologies through an engaging, project-based learning ecosystem.
        </p>
        <table class="metrics-table" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="padding-right: 5px;"><div class="metric-badge"><div class="metric-value">Classes I–XII</div><div class="metric-label">Target Segments</div></div></td>
            <td width="33%" style="padding: 0 2.5px;"><div class="metric-badge"><div class="metric-value">6 Tech Tracks</div><div class="metric-label">Broad Curriculum</div></div></td>
            <td width="33%" style="padding-left: 5px;"><div class="metric-badge"><div class="metric-value">Dedicated Support</div><div class="metric-label">Online + On-Campus</div></div></td>
          </tr>
        </table>
        <div class="section-title">Core Learning Tracks</div>
        <table class="grid-table" width="100%">
          <tr>
            <td width="50%" valign="top" style="padding-right: 8px;">
              <div class="card"><div class="card-title">🧠 AI Literacy</div><p class="card-desc">Concepts of machine learning, logic flows, and prompt design.</p></div>
              <div class="card"><div class="card-title">💻 Coding</div><p class="card-desc">Foundational programming block-based and syntax logic.</p></div>
              <div class="card"><div class="card-title">🌐 Web Development</div><p class="card-desc">Building structures, websites, and responsive layouts.</p></div>
            </td>
            <td width="50%" valign="top" style="padding-left: 8px;">
              <div class="card"><div class="card-title">📱 App Development</div><p class="card-desc">Constructing interactive mobile application mockups & tools.</p></div>
              <div class="card"><div class="card-title">🎯 Projects</div><p class="card-desc">Applying digital techniques to solve tangible real-life challenges.</p></div>
              <div class="card"><div class="card-title">🏆 Digital Portfolio & Certificates</div><p class="card-desc">Earning verified credentials and compiling creative work portfolios.</p></div>
            </td>
          </tr>
        </table>
        <div class="section-title">Benefits for the ${cfg.schoolName} Community</div>
        <div class="benefit-section students">
          <div class="benefit-section-title">For Students</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Interactive AI literacy, coding pathways, and logic modules.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Real-world website, software, and application projects.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Cumulative digital portfolio and certificates to showcase achievements.</div>
        </div>
        <div class="benefit-section teachers">
          <div class="benefit-section-title">For Teachers</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Comprehensive ready-made curriculum with detailed lesson plans.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Interactive progress tracking dashboard with auto-evaluations.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Significantly reduced preparation workloads with continuous support.</div>
        </div>
        <div class="benefit-section school">
          <div class="benefit-section-title">For ${cfg.schoolName}</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Future-ready tech ecosystem to complement existing academic systems.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Coding competitions, AI bootcamps, and digital workshops on campus.</div>
          <div class="benefit-item"><span class="benefit-check">✔</span> Dedicated implementation, onboarding, and technical support from Team SARTHI.</div>
        </div>
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
                    <li class="model-feature-item">Zero operational effort or setup cost to ${cfg.schoolName}</li>
                  </ul>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div class="section-title">Simple Implementation Timeline</div>
        <table class="timeline-table" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="25%" style="padding-right: 4px;"><div class="timeline-step"><div class="step-number">Step 1</div><div class="step-title">Discovery Meeting</div></div></td>
            <td width="25%" style="padding: 0 2px;"><div class="timeline-step"><div class="step-number">Step 2</div><div class="step-title">School Registration</div></div></td>
            <td width="25%" style="padding: 0 2px;"><div class="timeline-step"><div class="step-number">Step 3</div><div class="step-title">Platform Setup</div></div></td>
            <td width="25%" style="padding-left: 4px;"><div class="timeline-step"><div class="step-number">Step 4</div><div class="step-title">Learning Begins</div></div></td>
          </tr>
        </table>
        <div style="text-align: center; margin: 40px 0 20px 0; background-color: #fafdfb; border: 1px solid #eef5eb; border-radius: 16px; padding: 25px;">
          <h3 style="margin: 0 0 10px 0; color: #1b4332; font-size: 18px; font-weight: 800;">Book a 15-Minute School Presentation</h3>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.5;">We'll demonstrate the platform, answer your questions, and discuss how it can complement your academic vision.</p>
          <a href="https://sarthi-woad.vercel.app/junior/school-registration" class="btn">Book a 15-Minute Presentation</a>
        </div>
      </div>
      <div class="footer">
        <div class="footer-title">Have Questions? We'd Love to Connect.</div>
        <div class="footer-links">
          📧 <strong><a href="mailto:admin@sarthi.in" style="color: #ffffff;">admin@sarthi.in</a></strong><br>
          📞 <strong>+91 98350 19509</strong><br>
          🌐 <strong><a href="https://sarthi-woad.vercel.app" style="color: #ffffff;">https://sarthi-woad.vercel.app</a></strong>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-trust">🇮🇳 Proudly Built in India</div>
        <div class="footer-tagline">Designed for Schools &bull; Focused on Future-Ready Learning</div>
        <div class="footer-bottom">
          &copy; 2026 SARTHI. All Rights Reserved.
        </div>
      </div>
    </div>
  </div>
  <!-- Timestamp: ${Date.now()} -->
</body>
</html>`;
}

export async function sendPartnershipEmail(cfg: PartnershipEmailConfig) {
  const html = generateSchoolTemplate(cfg);
  try {
    const { data, error } = await resend.emails.send({
      from: 'SARTHI <admin@sarthi.in>',
      to: cfg.to,
      cc: cfg.cc,
      subject: `Proposal: Preparing ${cfg.schoolName} Students for Tomorrow's Digital World | Ref: #${Math.floor(1000 + Math.random() * 9000)}`,
      html,
    });
    if (error) {
      console.error(`Failed to send email to ${cfg.schoolName}:`, error);
      return { success: false, error };
    }
    console.log(`Email sent successfully to ${cfg.schoolName}! ID: ${data?.id}`);
    return { success: true, data };
  } catch (err: any) {
    console.error(`Error sending email:`, err.message);
    return { success: false, error: err };
  }
}

// Runnable block to send with config
if (process.argv[1] === __filename) {
  const config: PartnershipEmailConfig = {
    schoolName: 'Chauhan Public School',
    appreciationText: "We appreciate Chauhan Public School's commitment to progressive academic enrichment, comprehensive skill learning, and fostering strong values for overall student growth.",
    to: 'chauhanpublicsh@gmail.com',
  };
  sendPartnershipEmail(config);
}
