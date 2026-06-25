// Helper to strip any accidental double/single quotes or spaces copied into Render dashboard
const cleanEnvVar = (val: string | undefined): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

export const sendEmailNotification = async (message: any) => {
  const { name, email, phone, company, serviceNeeded, message: msgText, messageType } = message;

  const recipient = cleanEnvVar(process.env.NOTIFICATION_EMAIL) || 'ktechdynamicltd@gmail.com';
  const resendApiKey = cleanEnvVar(process.env.RESEND_API_KEY);
  const senderEmail = cleanEnvVar(process.env.SENDER_EMAIL) || 'onboarding@resend.dev';

  if (!resendApiKey) {
    console.warn('[Resend Alert Warning] RESEND_API_KEY is not configured. Skipping email notification.');
    return;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #0d1b2a; padding: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">K-TECH DYNAMIC LTD</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #a5a5a5;">Administrative Alert System</p>
      </div>
      <div style="padding: 25px; background-color: #ffffff;">
        <h2 style="color: #0d1b2a; border-bottom: 2px solid #f1f1f1; padding-bottom: 10px; margin-top: 0;">New Inquiry Received</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 140px; border-bottom: 1px solid #f9f9f9; color: #555;">Inquiry Type:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9; font-weight: bold; color: ${messageType === 'Quote' ? '#d9534f' : '#0275d8'};">${messageType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9; color: #555;">Client Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9; color: #555;">Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;"><a href="mailto:${email}" style="color: #0077b6; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9; color: #555;">Phone Number:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;">${phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9; color: #555;">Company:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;">${company || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9; color: #555;">Service Needed:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;">${serviceNeeded || 'N/A'}</td>
          </tr>
        </table>

        <div style="background-color: #f7f9fa; border-left: 4px solid #0d1b2a; padding: 15px; border-radius: 4px; margin-top: 10px;">
          <h4 style="margin: 0 0 8px 0; color: #0d1b2a; font-size: 14px;">Message Details:</h4>
          <p style="margin: 0; font-style: italic; white-space: pre-line; color: #444;">${msgText}</p>
        </div>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        This is an automated notification. Please reply directly to the client's email above or log in to the administrative portal to manage this message.
      </div>
    </div>
  `;

  console.log(`[SMTP Alert] Attempting to send email alert from "${senderEmail}" to "${recipient}"...`);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `K-TECH Alerts <${senderEmail}>`,
        to: recipient,
        reply_to: email,
        subject: `[K-TECH ALERT] New ${messageType} Request from ${name}`,
        html: htmlContent
      })
    });

    const resData = await response.json() as any;
    if (response.ok) {
      console.log(`[SMTP Alert Success] Notification email successfully sent via Resend HTTP API (ID: ${resData.id})`);
    } else {
      throw new Error(resData.message || JSON.stringify(resData));
    }
  } catch (error: any) {
    console.error('[SMTP Alert Error] Failed to send email via Resend HTTP API:', error.message || error);
  }
};
