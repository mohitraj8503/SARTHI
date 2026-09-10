export function speakerInviteEmailHTML({
    speakerName,
    seminarTitle,
    seminarDate,
    platform,
    meetLink,
}: {
    speakerName: string;
    seminarTitle: string;
    seminarDate: Date | null;
    platform: string;
    meetLink?: string | null;
}) {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🎓 You're invited to speak on SARTHI!</h2>
      <p>Hi ${speakerName},</p>
      <p>You've been scheduled as a speaker for:</p>
      <div style="background: #f0fdf4; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <strong>${seminarTitle}</strong><br/>
        📅 ${seminarDate ? new Date(seminarDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : "Date TBD"}
      </div>
      <p><strong>Streaming Platform:</strong> ${platform === "YOUTUBE" ? "YouTube (Unlisted Stream)" : "Google Meet"}</p>
      ${meetLink ? `<p><strong>Your Meeting Link (Host):</strong> <a href="${meetLink}">${meetLink}</a></p>` : ""}
      ${platform === "YOUTUBE" ? "<p>Your YouTube Stream Key will be sent to you separately via a secure channel.</p>" : ""}
      <hr/>
      <p>Please confirm your availability by replying to this email. Thank you!</p>
      <p>— SARTHI Team</p>
    </div>
  `;
}

// Dev mock function for sending speaker invite emails
export async function sendSpeakerInviteEmail(options: any) {
    console.log("SENDING EMAIL TO SPEAKER:", options.to);
    console.log("HTML:", speakerInviteEmailHTML(options));
    return true;
}
