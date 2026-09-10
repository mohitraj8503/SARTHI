/**
 * WhatsApp Verification Service
 * Uses Twilio WhatsApp API for sending certificate verification messages
 */

interface WhatsAppMessageOptions {
  phoneNumber: string;
  certificateId: string;
  userName: string;
  courseName: string;
  verificationUrl: string;
}

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private isConfigured: boolean;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
    this.isConfigured = !!(this.accountSid && this.authToken && this.fromNumber);
  }

  /**
   * Send certificate verification message via WhatsApp
   */
  async sendVerification(options: WhatsAppMessageOptions): Promise<WhatsAppResult> {
    if (!this.isConfigured) {
      console.warn('[WhatsApp] Service not configured - skipping message');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    const message = this.formatVerificationMessage(options);

    try {
      const twilio = await import('twilio');
      const client = twilio.default(this.accountSid, this.authToken);

      const result = await client.messages.create({
        body: message,
        from: this.fromNumber,
        to: `whatsapp:${options.phoneNumber}`
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[WhatsApp] Error sending message:', error);
      return { success: false, error: message };
    }
  }

  /**
   * Send certificate using WhatsApp Business API (Template message)
   */
  async sendTemplateMessage(options: WhatsAppMessageOptions): Promise<WhatsAppResult> {
    if (!this.isConfigured) {
      console.warn('[WhatsApp Business] Service not configured');
      return { success: false, error: 'WhatsApp Business API not configured' };
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: options.phoneNumber,
      type: 'template',
      template: {
        name: 'certificate_verification',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: options.userName },
              { type: 'text', text: options.courseName },
              { type: 'text', text: options.certificateId },
              { type: 'text', text: options.verificationUrl }
            ]
          }
        ]
      }
    };

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.FACEBOOK_PAGE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send WhatsApp message');
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[WhatsApp Business] Error:', error);
      return { success: false, error: message };
    }
  }

  /**
   * Format the verification message
   */
  private formatVerificationMessage(options: WhatsAppMessageOptions): string {
    return `
🎓 SARTHI Certificate Verification

Certificate ID: ${options.certificateId}
Course: ${options.courseName}
Student: ${options.userName}

Verification Link: ${options.verificationUrl}

Verify your certificate now!
    `.trim();
  }

  /**
   * Check if service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

const whatsAppService = new WhatsAppService();
export default whatsAppService;
export { WhatsAppService };
export type { WhatsAppMessageOptions, WhatsAppResult };
