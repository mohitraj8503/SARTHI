/**
 * Naukri.com Integration Service
 * Allows users to add their certificate to their Naukri profile
 * Pro feature - only available for ₹99 tier certificates
 */

interface NaukriProfileUpdateResult {
  success: boolean;
  message: string;
  profileUrl?: string;
}

interface CertificateData {
  certificateId: string;
  userName: string;
  courseName: string;
  issueDate: string;
  issuer: string;
  credentialId: string;
  verificationUrl: string;
}

class NaukriService {
  /**
   * Generate certificate data suitable for Naukri profile
   */
  static formatForNaukri(certificate: CertificateData): {
    title: string;
    organization: string;
    issueDate: string;
    credentialId: string;
    credentialUrl: string;
  } {
    return {
      title: `${certificate.courseName} - SARTHI Certificate`,
      organization: 'SARTHI Academy',
      issueDate: certificate.issueDate,
      credentialId: certificate.certificateId,
      credentialUrl: certificate.verificationUrl
    };
  }

  /**
   * Generate a shareable link for Naukri profile update
   * This opens Naukri with pre-filled certificate information
   */
  static generateNaukriAddCertificateLink(_certificate: CertificateData): string {
    // Naukri doesn't have a public API for adding certifications
    // So we provide a deep link to their certifications page
    // with guidance on what to add
    
    const baseUrl = 'https://www.naukri.com/mynaukri/mynaukri_profile_view.php';
    
    // Since Naukri doesn't have a public API, we provide guidance
    // The actual integration would require OAuth with Naukri
    return baseUrl;
  }

  /**
   * Generate certificate details for manual addition to Naukri
   */
  static getNaukriCertificateDetails(certificate: CertificateData): {
    certificateName: string;
    issuingOrganization: string;
    issueDate: string;
    credentialId: string;
    credentialUrl: string;
    instructions: string[];
  } {
    const formatted = NaukriService.formatForNaukri(certificate);

    return {
      certificateName: formatted.title,
      issuingOrganization: formatted.organization,
      issueDate: formatted.issueDate,
      credentialId: formatted.credentialId,
      credentialUrl: formatted.credentialUrl,
      instructions: [
        '1. Log in to your Naukri.com account',
        '2. Go to Profile > My Skills & Certificates',
        '3. Click on "Add Certificate"',
        '4. Fill in the details below:',
        `   - Certificate Name: ${formatted.title}`,
        `   - Issuing Organization: ${formatted.organization}`,
        `   - Issue Date: ${formatted.issueDate}`,
        `   - Credential ID: ${formatted.credentialId}`,
        `   - Credential URL: ${formatted.credentialUrl}`,
        '5. Click Save'
      ]
    };
  }

  /**
   * Check if Naukri integration is available for a certificate
   * (Only Pro tier certificates get this feature)
   */
  static isAvailableForTier(tier: string): boolean {
    return tier === 'pro';
  }

  /**
   * Generate shareable text for Naukri
   */
  static generateShareText(certificate: CertificateData): string {
    return `
🎓 Added ${certificate.courseName} Certificate to my Naukri Profile!

Issuer: SARTHI Academy
Certificate ID: ${certificate.certificateId}
Completed: ${certificate.issueDate}

Verify: ${certificate.verificationUrl}

#SARTHI #Certificate #ProfessionalSkills
    `.trim();
  }
}

export default NaukriService;
export { NaukriService };
export type { NaukriProfileUpdateResult, CertificateData };
