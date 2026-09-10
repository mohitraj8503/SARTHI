/**
 * BEAUTIFUL OTP EMAIL TEMPLATE FOR SARTHI
 */
export function getOTPTemplate(otp: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FDFBF7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 40px;
      overflow: hidden;
      margin-top: 40px;
      margin-bottom: 40px;
      box-shadow: 0 40px 100px -20px rgba(27, 67, 50, 0.1);
      border: 1px solid rgba(27, 67, 50, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1B4332 0%, #40916C 100%);
      padding: 60px 40px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -1.5px;
      text-transform: uppercase;
      margin: 0;
    }
    .content {
      padding: 60px 50px;
      text-align: center;
    }
    .title {
      font-size: 24px;
      font-weight: 900;
      color: #1B4332;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 40px;
      font-weight: 500;
    }
    .otp-container {
      background: rgba(27, 67, 50, 0.05);
      border-radius: 24px;
      padding: 30px;
      margin-bottom: 40px;
      border: 2px dashed rgba(27, 67, 50, 0.1);
    }
    .otp-code {
      font-size: 48px;
      font-weight: 900;
      color: #1B4332;
      letter-spacing: 12px;
      margin: 0;
      font-family: 'Inter', monospace;
    }
    .footer {
      background-color: #F8FAF7;
      padding: 40px;
      text-align: center;
      border-top: 1px solid rgba(27, 67, 50, 0.05);
    }
    .footer-text {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.5;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(27, 67, 50, 0.08);
      color: #1B4332;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">

        <div class="header">
      <h1 class="logo">Tech <span style="color: #E8B84B; font-style: italic;">Tomorrow</span></h1>
    </div>
    <div class="content">
      <div class="badge">Security Identity Sync</div>
      <h2 class="title">Verify Your Identity</h2>
      <p class="text">
        Use the following one-time password (OTP) to sync your identity for the Elite Instructor Application. This code will expire in 10 minutes.
      </p>
      
      <div class="otp-container">
        <h1 class="otp-code">${otp}</h1>
      </div>
      
      <p class="text" style="font-size: 14px; margin-bottom: 0;">
        If you didn't request this code, please ignore this email or contact our security team.
      </p>
    </div>
    <div class="footer">
      <p class="footer-text">
        &copy; 2026 SARTHI Elite Network<br>
        Elevating the next generation of engineers.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
