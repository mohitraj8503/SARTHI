export interface SchoolProposalConfig {
  schoolName: string;
  principalName?: string;
  appreciationText?: string;
}

export function generateSchoolProposalHtml(cfg: SchoolProposalConfig): string {
  const schoolName = cfg.schoolName || 'Your Institution';
  const greeting = cfg.principalName 
    ? `<strong>Respected ${cfg.principalName},</strong><br>Head / Director, ${schoolName}`
    : `<strong>Respected Authority,</strong><br>${schoolName}`;

  const appreciation = cfg.appreciationText || 
    `We appreciate ${schoolName}'s commitment to delivering progressive educational pathways, institutional academic growth, and nurturing critical skills across all domains.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strategic Partnership Proposal — ${schoolName}</title>
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
    .hero-title {
      font-size: 26px; font-weight: 800; color: #1b4332; line-height: 1.25; margin: 0 0 12px 0; letter-spacing: -0.5px;
    }
    .hero-subtitle {
      font-size: 15px; color: #52b788; font-weight: 600; margin: 0 0 25px 0; line-height: 1.5;
    }
    .content-body { padding: 40px 35px 20px 35px; }
    .salutation { font-size: 15px; color: #334155; margin-bottom: 24px; line-height: 1.7; }
    .section-title {
      font-size: 18px; font-weight: 800; color: #1b4332; margin: 35px 0 18px 0;
      border-bottom: 2px solid #f0f7f0; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .card { background-color: #fafdfb; border: 1px solid #eef5eb; border-radius: 12px; padding: 16px; margin-bottom: 15px; min-height: 70px; }
    .card-title { font-size: 15px; font-weight: 700; color: #1b4332; margin: 0 0 4px 0; }
    .card-desc { font-size: 12px; color: #64748b; margin: 0; line-height: 1.4; }
    .footer { background-color: #1b4332; color: #ffffff; padding: 40px 30px; text-align: center; }
    .footer-title { font-size: 17px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: 0.02em; }
    .footer-trust { font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 6px; }
    .footer-bottom { font-size: 12px; color: #a3b899; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="personalization-badge">
        <span class="badge-label">Prepared Exclusively for</span>
        <span class="badge-school">${schoolName}</span>
      </div>
      <div class="hero">
        <h1 class="hero-title">Empowering Future-Ready Skills</h1>
        <p class="hero-subtitle">Comprehensive Capacity Building & Learning Ecosystem</p>
      </div>
      <div class="content-body">
        <div class="salutation">
          ${greeting}<br><br>
          ${appreciation}
        </div>
        <div class="section-title">Institutional Partnership & Training</div>
        <div class="card">
          <div class="card-title">Structured Capacity Building</div>
          <p class="card-desc">Standardized learning modules, verifiable certifications, and automated evaluation metrics.</p>
        </div>
      </div>
      <div class="footer">
        <div class="footer-title">SARTHI Capacity Building Initiative</div>
        <div class="footer-trust">🇮🇳 Operational Excellence</div>
        <div class="footer-bottom">
          &copy; 2026 SARTHI. All Rights Reserved.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
