import { getBrandedTemplate } from './branded';

export interface AssignmentEmailOptions {
  recipientName: string;
  assignmentTitle: string;
  category: string;
  difficulty: string;
  xpReward: number;
  description: string;
  deadlineFormatted: string;
  dashboardUrl?: string;
}

export function getAssignmentEmailHtml(opts: AssignmentEmailOptions): string {
  const {
    recipientName,
    assignmentTitle,
    category,
    difficulty,
    xpReward,
    description,
    deadlineFormatted,
    dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app/dashboard',
  } = opts;

  const firstName = recipientName ? recipientName.trim().split(' ')[0] : 'Intern';

  // Format description into paragraphs and lists
  let parsedDesc = description || '';
  parsedDesc = parsedDesc.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  parsedDesc = parsedDesc.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  const formattedDesc = parsedDesc
    .split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      const htmlContent = p.replace(/\r?\n/g, '<br />');
      return `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">${htmlContent}</p>`;
    })
    .join('');

  // Difficulty badge styling
  let diffBg = '#FEF3C7';
  let diffColor = '#92400E';
  if (difficulty?.toLowerCase() === 'easy') {
    diffBg = '#D1FAE5';
    diffColor = '#065F46';
  } else if (difficulty?.toLowerCase() === 'hard') {
    diffBg = '#FEE2E2';
    diffColor = '#991B1B';
  }

  // Construct structured body for the branded template
  const assignmentBody = `
<p style="margin:0 0 20px;font-size:16px;color:#1f2937;font-weight:700;">Dear ${firstName},</p>

<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
  A new assignment has been issued to your cohort. Please review the task details below and complete your submission before the deadline.
</p>

<!-- ASSIGNMENT CARD META -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;border:1px solid #E2E8F0;border-radius:14px;padding:20px;margin-bottom:24px;">
  <tr>
    <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #CBD5E1;">
      <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1px;">ASSIGNMENT TITLE</span>
      <h2 style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0F172A;">${assignmentTitle}</h2>
    </td>
  </tr>
  <tr>
    <td style="padding-top:14px;width:50%;">
      <span style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">Category:</span>
      <div style="font-size:13px;font-weight:700;color:#0F172A;margin-top:2px;">${category}</div>
    </td>
    <td style="padding-top:14px;width:50%;">
      <span style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">Difficulty & XP:</span>
      <div style="margin-top:2px;">
        <span style="display:inline-block;background:${diffBg};color:${diffColor};padding:2px 8px;border-radius:6px;font-size:11px;font-weight:800;">${difficulty}</span>
        <span style="display:inline-block;background:#DCFCE7;color:#15803D;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:800;margin-left:4px;">⚡ +${xpReward} XP</span>
      </div>
    </td>
  </tr>
</table>

<!-- DESCRIPTION -->
<div style="margin-bottom:24px;">
  <p style="font-size:12px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Task Guidelines & Instructions</p>
  <div style="background:#FFFFFF;border-left:4px solid #10B981;padding:12px 16px;border-radius:4px;">
    ${formattedDesc}
  </div>
</div>

<!-- DEADLINE HIGHLIGHT -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px 20px;margin-bottom:12px;">
  <tr>
    <td>
      <p style="margin:0;font-size:12px;font-weight:800;color:#991B1B;text-transform:uppercase;letter-spacing:1px;">Submission Deadline</p>
      <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#B91C1C;">📅 ${deadlineFormatted}</p>
    </td>
  </tr>
</table>
`;

  return getBrandedTemplate({
    badge: 'NEW COHORT ASSIGNMENT',
    heading: assignmentTitle,
    body: assignmentBody,
    action: {
      label: 'View Assignment in Dashboard →',
      url: dashboardUrl,
    },
    senderName: 'SARTHI Mentor Team',
  });
}
