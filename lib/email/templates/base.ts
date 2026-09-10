/**
 * Professional Base Email Template for SARTHI
 */
export function getBaseTemplate(content: string, title: string, action?: { label: string, url: string }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f7fafc; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #1B4332; padding: 48px 40px; text-align: center; }
          .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }
          .content { padding: 48px 40px; }
          .footer { padding: 32px 40px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 0; font-size: 12px; color: #718096; font-weight: 500; }
          h2 { color: #1a202c; font-size: 24px; font-weight: 800; margin-top: 0; margin-bottom: 24px; letter-spacing: -0.02em; }
          p { margin-bottom: 24px; color: #4a5568; font-size: 16px; }
          .button { display: inline-block; background: #1B4332; color: #ffffff !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 14px; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SARTHI</div>
          </div>
          <div class="content">
            <h2>${title}</h2>
            ${content}
            ${action ? `
              <div style="margin-top: 40px; text-align: center;">
                <a href="${action.url}" class="button">${action.label}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>&copy; 2026 SARTHI Platform. All rights reserved.</p>
            <p style="margin-top: 8px;">Premium Education for the Next Generation of Engineers.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
