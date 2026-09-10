import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const submissionDate = new Date();
    
    // Convert to IST
    const timestampIST = submissionDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ' IST';

    console.log(`[School Registration Submission Received @ ${timestampIST}]:`, JSON.stringify(data, null, 2));

    // Server-side validation
    const requiredFields = [
      'schoolName', 'schoolType', 'cbseAffiliation', 'city', 'state', 
      'pinCode', 'contactName', 'designation', 'email', 'mobile', 
      'courses', 'expectedStudents', 'academicYear', 'hasLab', 
      'agreeTerms', 'isAuthorized', 'refNo', 'pdfBase64',
      'principalName', 'principalEmail', 'schoolAddress', 'schoolBoard',
      'hasAITeacher', 'deliveryModel',
      'teachingLanguage', 'timeline', 'schoolCategory', 'totalStrength', 'classesOffered', 'consentProcessing',
      'preferredStartDate', 'paymentPreference'
    ];

    if (data.hasLab !== 'No') {
      requiredFields.push('computersCount', 'internetSpeed');
    }

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === '' || (Array.isArray(data[field]) && data[field].length === 0)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    if (data.deliveryModel === 'Smart Board' || data.deliveryModel === 'Hybrid') {
      const extraRequired = ['hasSmartBoard', 'hasAudioSystem', 'hasSmartClassroomInternet', 'hasProjector', 'hasCamera', 'smartClassroomsCount'];
      for (const field of extraRequired) {
        if (data[field] === undefined || data[field] === '') {
          return NextResponse.json({ error: `Missing required smart classroom field: ${field}` }, { status: 400 });
        }
      }
    }

    if (!/^\d{7}$/.test(data.cbseAffiliation)) {
      return NextResponse.json({ error: 'CBSE Affiliation Number must be exactly 7 digits' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(data.pinCode)) {
      return NextResponse.json({ error: 'Pin Code must be exactly 6 digits' }, { status: 400 });
    }
    if (!/^\d{10}$/.test(data.mobile)) {
      return NextResponse.json({ error: 'Mobile number must be exactly 10 digits' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Invalid signatory email format' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.principalEmail)) {
      return NextResponse.json({ error: 'Invalid vice principal / trustee email format' }, { status: 400 });
    }
    if (data.principalMobile && !/^\d{10}$/.test(data.principalMobile)) {
      return NextResponse.json({ error: 'Vice principal / trustee mobile must be exactly 10 digits' }, { status: 400 });
    }
    if (!data.agreeTerms || !data.isAuthorized || !data.consentProcessing) {
      return NextResponse.json({ error: 'All mandatory terms and processing consents must be accepted' }, { status: 400 });
    }

    const refNo = data.refNo;

    // Revenue Opportunity calculation
    const normalizedRange = data.expectedStudents.replace('–', '-');
    const studentRanges: Record<string, number> = {
      '30-50': 40,
      '51-100': 75,
      '101-200': 150,
      '201-500': 350,
      '500+': 500
    };
    const avgStudents = studentRanges[normalizedRange] || 40;
    
    // Dynamic fee based on delivery model
    let modelFee = 500;
    if (data.deliveryModel === 'Standard') modelFee = 500;
    else if (data.deliveryModel === 'After-School') modelFee = 600;
    else if (data.deliveryModel === 'Smart Board') modelFee = 600;
    else if (data.deliveryModel === 'Hybrid') modelFee = 750;

    const estimatedRevenue = avgStudents * modelFee;
    const formattedRevenue = '₹' + estimatedRevenue.toLocaleString('en-IN');

    // Send Emails via Resend if available
    if (resend) {
      const attachments = [];
      if (data.pdfBase64) {
        attachments.push({
          filename: `Tech-Tomorrow-Juniors-School-MOU-${data.schoolName.replace(/\s+/g, '-')}-${refNo}.pdf`,
          content: data.pdfBase64,
          contentType: 'application/pdf'
        });
      }
      if (data.authorizedSignatoryProof && data.authorizedSignatoryProofName) {
        const base64Content = data.authorizedSignatoryProof.split(';base64,').pop();
        const mimeType = data.authorizedSignatoryProof.split(';')[0].split(':')[1] || 'image/png';
        attachments.push({
          filename: data.authorizedSignatoryProofName,
          content: base64Content,
          contentType: mimeType
        });
      }

      const emailSubjectAdmin = `School Partnership Registration Received — Ref ${refNo}`;
      
      const emailHtmlAdmin = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>New School Registration</title>
</head>
<body style="margin:0;padding:0;background:#f8fbf8;
             font-family:-apple-system,BlinkMacSystemFont,
             'Segoe UI',Arial,sans-serif;">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" 
         style="background:#f8fbf8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0"
               style="max-width:620px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(15,107,75,0.06);overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F6B4B,#14532D);
                       padding:32px 40px;text-align:center;">
              <div style="margin-bottom:16px;">
                <img src="https://sarthi-woad.vercel.app/sarthi-logo.png" 
                     alt="SARTHI Juniors"
                     style="height:48px;max-width:220px;display:inline-block;">
              </div>
              <div style="color:white;">
                <div style="font-size:12px;font-weight:700;
                             letter-spacing:0.1em;text-transform:uppercase;
                             background:rgba(255,255,255,0.15);
                             display:inline-block;padding:4px 12px;
                             border-radius:4px;margin-bottom:12px;">
                  NEW SCHOOL REGISTRATION
                </div>
                <div style="font-size:26px;font-weight:800;
                             color:white;margin-bottom:6px;">
                  SARTHI Juniors
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,0.75);">
                  Institutional Partnership Program
                </div>
              </div>
            </td>
          </tr>

          <!-- REF + DATE BAR -->
          <tr>
            <td style="background:#14532D;padding:10px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:rgba(255,255,255,0.85);font-size:12px;">
                    📋 Ref: ${refNo}
                  </td>
                  <td align="right" 
                      style="color:rgba(255,255,255,0.85);font-size:12px;">
                    🗓 ${timestampIST}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:white;padding:40px;">

              <!-- ALERT BOX -->
              <div style="background:#ECFDF5;border:1px solid #A7F3D0;
                          border-left:4px solid #0F6B4B;border-radius:8px;
                          padding:16px 20px;margin-bottom:32px;">
                <div style="font-size:14px;font-weight:700;
                             color:#0f6b4b;margin-bottom:4px;">
                  Action Required
                </div>
                <div style="font-size:13px;color:#14532D;line-height:1.6;">
                  A new school has submitted a partnership registration. 
                  Please review the details below and respond within 
                  24 working hours with the MOU and proposal.
                </div>
              </div>

              <!-- SCHOOL INFORMATION -->
              <div style="margin-bottom:28px;">
                <div style="font-size:11px;font-weight:700;
                             text-transform:uppercase;letter-spacing:0.1em;
                             color:#0f6b4b;border-bottom:2px solid #ECFDF5;
                             padding-bottom:8px;margin-bottom:16px;">
                  🏫 School Information
                </div>
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="border:1px solid #e2e8f0;border-radius:8px;
                              overflow:hidden;">
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               width:40%;text-transform:uppercase;
                               letter-spacing:0.05em;">
                      School Name
                    </td>
                    <td style="padding:12px 16px;font-size:14px;
                               font-weight:600;color:#0f172a;">
                      ${data.schoolName}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      School Type / Category
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.schoolType} / ${data.schoolCategory}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Board / Strength
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.schoolBoard} (Total Students: ${data.totalStrength})
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Classes Offered
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.classesOffered.join(', ')}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      UDISE Code
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.udiseCode || 'Not provided'}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      CBSE Affiliation No.
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.cbseAffiliation}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Address / Location
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.schoolAddress}, ${data.city}, ${data.state} — ${data.pinCode}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Website
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.website || 'Not provided'}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CONTACT & VICE PRINCIPAL / TRUSTEE DETAILS -->
              <div style="margin-bottom:28px;">
                <div style="font-size:11px;font-weight:700;
                             text-transform:uppercase;letter-spacing:0.1em;
                             color:#0f6b4b;border-bottom:2px solid #ECFDF5;
                             padding-bottom:8px;margin-bottom:16px;">
                  👤 Contact & Vice Principal / Trustee Details
                </div>
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="border:1px solid #e2e8f0;border-radius:8px;
                              overflow:hidden;">
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               width:40%;text-transform:uppercase;
                               letter-spacing:0.05em;">Signatory Name</td>
                    <td style="padding:12px 16px;font-size:14px;
                               font-weight:600;color:#0f172a;">
                      ${data.contactName} (${data.designation})
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Signatory Contact
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      Email: <a href="mailto:${data.email}" style="color:#0f6b4b;text-decoration:none;font-weight:600;">${data.email}</a><br>
                      Mobile: ${data.mobile} / WhatsApp: ${data.whatsapp || data.mobile}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Vice Principal / Trustee Name
                    </td>
                    <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#0f172a;">
                      ${data.principalName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Vice Principal / Trustee Contact
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      Email: <a href="mailto:${data.principalEmail}" style="color:#0f6b4b;text-decoration:none;font-weight:600;">${data.principalEmail}</a><br>
                      Mobile: ${data.principalMobile || 'Not provided'}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- PROGRAM REQUIREMENTS -->
              <div style="margin-bottom:28px;">
                <div style="font-size:11px;font-weight:700;
                             text-transform:uppercase;letter-spacing:0.1em;
                             color:#0f6b4b;border-bottom:2px solid #ECFDF5;
                             padding-bottom:8px;margin-bottom:16px;">
                  📋 Program Requirements
                </div>
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="border:1px solid #e2e8f0;border-radius:8px;
                              overflow:hidden;">
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               width:40%;text-transform:uppercase;
                               letter-spacing:0.05em;">
                      Courses Interested
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.courses.join(', ')}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Expected Students
                    </td>
                    <td style="padding:12px 16px;font-size:14px;
                               font-weight:700;color:#0f6b4b;">
                      ${data.expectedStudents}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Academic Year Start
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.academicYear}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Computer Lab Status / PCs Count
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      Lab: ${data.hasLab} / PCs: ${data.computersCount}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Internet Speed / Existing Teacher
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      Speed: ${data.internetSpeed} / AI Teacher: ${data.hasAITeacher}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Program Delivery Model / Language
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      Model: <strong>${data.deliveryModel}</strong><br>
                      Teaching Language: <strong>${data.teachingLanguage}</strong>
                      ${(data.deliveryModel === 'Smart Board' || data.deliveryModel === 'Hybrid') ? `
                      <br><span style="font-size:12px;color:#64748b;">
                        Smart Board: ${data.hasSmartBoard} | 
                        Projector: ${data.hasProjector} | 
                        Audio: ${data.hasAudioSystem} | 
                        Camera: ${data.hasCamera} | 
                        Internet: ${data.hasSmartClassroomInternet} | 
                        Classrooms: ${data.smartClassroomsCount}
                      </span>
                      ` : ''}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Onboarding Date & Schedule
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      Preferred Onboarding Date: <strong>${data.preferredStartDate}</strong><br>
                      Payment Breakup Schedule: <strong>${data.paymentPreference}</strong><br>
                      Demo/Pilot Session Required: <strong>${data.pilotRequired ? 'Yes' : 'No'}</strong>
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Expected Annual Budget (per student)
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.studentBudget || 'Not provided'}
                    </td>
                  </tr>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Target Implementation Timeline
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.timeline}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;background:#f8fbf8;
                               font-size:12px;font-weight:600;color:#64748b;
                               text-transform:uppercase;letter-spacing:0.05em;">
                      Infrastructure Notes
                    </td>
                    <td style="padding:12px 16px;font-size:14px;color:#374151;">
                      ${data.infrastructure || 'Not provided'}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- PRICING ESTIMATE BOX -->
              <div style="background:#ECFDF5;border:1px solid #A7F3D0;
                          border-radius:8px;padding:16px 20px;
                          margin-bottom:28px;">
                <div style="font-size:12px;font-weight:700;color:#14532D;
                            margin-bottom:8px;text-transform:uppercase;
                            letter-spacing:0.06em;">
                  💰 Estimated Revenue Opportunity
                </div>
                <div style="font-size:13px;color:#374151;line-height:1.7;">
                  Based on ${data.expectedStudents} students 
                  at ₹${modelFee}/student/year:<br>
                  <span style="font-size:20px;font-weight:800;
                               color:#0F6B4B;">
                    ${formattedRevenue}
                  </span>
                  <span style="font-size:12px;color:#64748b;">
                    /year (estimated)
                  </span>
                </div>
              </div>

              <!-- ACTION BUTTONS -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="mailto:${data.email}?subject=Re: School Partnership — ${refNo}&body=Dear ${data.contactName},"
                   style="display:inline-block;background:#0F6B4B;
                          color:white;text-decoration:none;
                          font-size:14px;font-weight:700;
                          padding:14px 28px;border-radius:8px;
                          margin-right:12px;">
                  📧 Reply to School
                </a>
                <a href="https://sarthi-woad.vercel.app/admin"
                   style="display:inline-block;background:white;
                          color:#0F6B4B;text-decoration:none;
                          font-size:14px;font-weight:700;
                          padding:14px 28px;border-radius:8px;
                          border:2px solid #0F6B4B;">
                  📊 View Dashboard
                </a>
              </div>

            </td>
          </tr>

          <!-- EMAIL FOOTER -->
          <tr>
            <td style="padding:20px 40px;text-align:center;background:#f8fbf8;border-top:1px solid #e2e8f0;">
              <div style="font-size:12px;color:#64748b;line-height:1.6;margin-bottom:12px;">
                <strong>Confidential Notice:</strong> This email and any attached MOU documents are intended solely for the recipient institution and may contain confidential partnership information.
              </div>
              <div style="font-size:12px;color:#94a3b8;">
                SARTHI Juniors · sarthi-woad.vercel.app<br>
                admin@sarthi.in
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

      // 1. Send Email to admin
      try {
        console.log('[School Registration API] Attempting to send email to admin...');
        let adminResult = await resend.emails.send({
          from: '"SARTHI Juniors" <admin@sarthi.in>',
          to: 'admin@sarthi.in',
          replyTo: data.email,
          subject: emailSubjectAdmin,
          html: emailHtmlAdmin,
          attachments
        });
        
        console.log('[School Registration API] Admin email primary dispatch result:', JSON.stringify(adminResult, null, 2));
        
        if (adminResult.error) {
          console.warn('[School Registration API] Primary admin email failed, trying sandbox fallback to mohitraj8503@gmail.com...', adminResult.error);
          adminResult = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'mohitraj8503@gmail.com',
            replyTo: data.email,
            subject: `[SANDBOX FALLBACK] ${emailSubjectAdmin}`,
            html: emailHtmlAdmin,
            attachments
          });
          console.log('[School Registration API] Sandbox fallback admin email result:', JSON.stringify(adminResult, null, 2));
        }
      } catch (adminMailErr) {
        console.error('[School Registration API] Exception thrown while sending admin email:', adminMailErr);
      }

      //       const emailSubjectSchool = 'Registration Confirmed | SARTHI Juniors School Partnership Program';
      
      const emailHtmlSchool = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Registration Received</title>
</head>
<body style="margin:0;padding:0;background:#f8fbf8;
             font-family:-apple-system,BlinkMacSystemFont,
             'Segoe UI',Arial,sans-serif;">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" 
         style="background:#f8fbf8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0"
               style="max-width:620px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(15,107,75,0.06);overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F6B4B,#14532D);
                       padding:32px 40px;text-align:center;">
              <div style="margin-bottom:16px;">
                <img src="https://sarthi-woad.vercel.app/sarthi-logo.png" 
                     alt="SARTHI Juniors"
                     style="height:48px;max-width:220px;display:inline-block;">
              </div>
              <div style="color:white;">
                <div style="font-size:12px;font-weight:700;
                             letter-spacing:0.1em;text-transform:uppercase;
                             background:rgba(255,255,255,0.15);
                             display:inline-block;padding:4px 12px;
                             border-radius:4px;margin-bottom:12px;">
                  REGISTRATION CONFIRMATION
                </div>
                <div style="font-size:26px;font-weight:800;
                             color:white;margin-bottom:6px;">
                  SARTHI Juniors
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,0.75);">
                  MOU & Partnership Draft
                </div>
              </div>
            </td>
          </tr>

          <!-- REF BAR -->
          <tr>
            <td style="background:#14532D;padding:10px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:rgba(255,255,255,0.85);font-size:12px;">
                    📋 Ref: ${refNo}
                  </td>
                  <td align="right" 
                      style="color:rgba(255,255,255,0.85);font-size:12px;">
                    🗓 Submitted Successfully
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:white;padding:40px;">

              <h2 style="font-size:20px;font-weight:800;color:#0F6B4B;margin-top:0;margin-bottom:12px;">
                Dear ${data.contactName},
              </h2>
              
              <p style="font-size:15px;color:#374151;line-height:1.6;margin-bottom:24px;">
                Thank you for registering <strong>${data.schoolName}</strong> for the SARTHI Juniors Institutional Partnership Program. We have successfully received your registration details.
              </p>

              <!-- INFO CARD -->
              <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;padding:20px;margin-bottom:24px;">
                <div style="font-size:14px;font-weight:700;color:#0F6B4B;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em;">
                  Registration Details
                </div>
                <div style="font-size:14px;color:#14532D;line-height:1.7;">
                  • <strong>School:</strong> ${data.schoolName}<br>
                  • <strong>Board:</strong> ${data.schoolBoard}<br>
                  • <strong>Category:</strong> ${data.schoolCategory}<br>
                  • <strong>City, State:</strong> ${data.city}, ${data.state}<br>
                  • <strong>Vice Principal / Trustee:</strong> ${data.principalName}<br>
                  • <strong>Selected Courses:</strong> ${data.courses.join(', ')}<br>
                  • <strong>Delivery Model:</strong> ${data.deliveryModel} Model<br>
                  • <strong>Expected Students:</strong> ${data.expectedStudents} students<br>
                  • <strong>Reference ID:</strong> ${refNo}
                </div>
              </div>

              <!-- DELIVERY MODEL SUMMARY -->
              <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;padding:20px;margin-bottom:24px;">
                <div style="font-size:14px;font-weight:700;color:#0F6B4B;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">
                  Selected Program Delivery Mode
                </div>
                <div style="font-size:14px;color:#14532D;line-height:1.6;">
                  <strong>${data.deliveryModel} Model</strong><br>
                  ${data.deliveryModel === 'Standard' ? 'AI classes conducted during regular school hours as part of the academic timetable.' :
                    data.deliveryModel === 'After-School' ? 'Regular classes continue as usual. AI classes conducted by SARTHI instructors after school hours through live online sessions.' :
                    data.deliveryModel === 'Smart Board' ? 'Instructors teach students live through the school\'s smart board/digital classroom during scheduled periods.' :
                    'Students attend live smart-board sessions during school hours and also receive additional after-school online support, doubt-solving, projects, and mentoring.'}
                </div>
              </div>

              <!-- PRICING SUMMARY -->
              <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;padding:20px;margin-bottom:24px;">
                <div style="font-size:14px;font-weight:700;color:#0F6B4B;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">
                  Proposed Institutional Pricing
                </div>
                <div style="font-size:16px;color:#14532D;line-height:1.6;font-weight:700;">
                  ₹${modelFee} per student per academic year
                </div>
                <div style="font-size:13px;color:#64748b;margin-top:4px;">
                  (Calculated dynamically based on your selected ${data.deliveryModel} Model. Exclusive of 18% GST.)
                </div>
              </div>

              <!-- WHAT HAPPENS NEXT -->
              <div style="margin-bottom:28px;">
                <div style="font-size:14px;font-weight:700;color:#0F6B4B;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #ECFDF5;padding-bottom:6px;">
                  What Happens Next?
                </div>
                <ol style="font-size:14px;color:#374151;line-height:1.8;padding-left:20px;margin:0;">
                  <li style="margin-bottom:8px;">Our partnerships team reviews your onboarding requirements.</li>
                  <li style="margin-bottom:8px;">A customized institutional partnership proposal is prepared for your school board.</li>
                  <li style="margin-bottom:8px;">A draft Memorandum of Understanding (MOU) is generated (attached to this email) based on your selected delivery model.</li>
                  <li style="margin-bottom:8px;">A meeting or virtual classroom demo session can be scheduled if requested.</li>
                  <li style="margin-bottom:0;">Final onboarding and portal activation are completed after mutual approval and execution of signatures.</li>
                </ol>
              </div>

              <!-- NON-BINDING DISCLAIMER -->
              <div style="background:#f8fbf8;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:28px;font-size:13px;color:#64748b;line-height:1.6;">
                ⚠️ <strong>Legal Notice:</strong> This registration does not constitute a binding agreement. The partnership becomes effective only after mutual review and execution of the final signed Memorandum of Understanding (MOU).
              </div>

              <p style="font-size:15px;color:#374151;line-height:1.6;margin-bottom:28px;">
                If you have any questions or want to update your requirements, please feel free to reply directly to this email or write to us at <a href="mailto:admin@sarthi.in" style="color:#0F6B4B;text-decoration:none;font-weight:600;">admin@sarthi.in</a>.
              </p>

            </td>
          </tr>

          <!-- EMAIL FOOTER -->
          <tr>
            <td style="padding:20px 40px;text-align:center;background:#f8fbf8;border-top:1px solid #e2e8f0;">
              <div style="font-size:12px;color:#64748b;line-height:1.6;margin-bottom:12px;">
                <strong>Confidential Notice:</strong> This email and any attached MOU documents are intended solely for the recipient institution and may contain confidential partnership information.
              </div>
              <div style="font-size:12px;color:#94a3b8;">
                SARTHI Juniors · sarthi-woad.vercel.app<br>
                admin@sarthi.in
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

      try {
        console.log('[School Registration API] Attempting to send email to school...');
        let schoolResult = await resend.emails.send({
          from: '"SARTHI Juniors" <admin@sarthi.in>',
          to: data.email,
          subject: emailSubjectSchool,
          html: emailHtmlSchool,
          attachments: attachments.filter(att => att.filename.toLowerCase().endsWith('.pdf'))
        });
        
        console.log('[School Registration API] School email primary dispatch result:', JSON.stringify(schoolResult, null, 2));
        
        if (schoolResult.error) {
          console.warn('[School Registration API] Primary school email failed, trying sandbox fallback to mohitraj8503@gmail.com...', schoolResult.error);
          schoolResult = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'mohitraj8503@gmail.com',
            subject: `[SANDBOX FALLBACK] ${emailSubjectSchool}`,
            html: emailHtmlSchool,
            attachments: attachments.filter(att => att.filename.toLowerCase().endsWith('.pdf'))
          });
          console.log('[School Registration API] Sandbox fallback school email result:', JSON.stringify(schoolResult, null, 2));
        }
      } catch (schoolMailErr) {
        console.error('[School Registration API] Exception thrown while sending school email:', schoolMailErr);
      }
    } else {
      console.warn('[School Registration API] Resend client not configured. RESEND_API_KEY env variable is missing.');
    }

    return NextResponse.json({ 
      success: true, 
      refNo, 
      message: 'Registration submitted successfully' 
    });
  } catch (error: any) {
    console.error('[School Registration Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
