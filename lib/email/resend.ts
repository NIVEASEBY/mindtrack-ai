interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (!resendApiKey) {
    console.error('Resend API key not found');
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MindTrack AI <noreply@mindtrack.ai>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendAdminAlertEmail(userEmail: string, userName: string, riskLevel: string, burnoutScore: number): Promise<{ success: boolean; error?: string }> {
  const subject = `⚠️ High Burnout Risk Alert: ${userName}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Burnout Risk Alert</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fee; border-left: 4px solid #f44; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .risk-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; }
          .risk-high { background: #f44; }
          .risk-severe { background: #c00; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Burnout Risk Alert</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We've detected a high burnout risk level for <strong>${userName}</strong> (${userEmail}).</p>
            
            <div class="alert-box">
              <p><strong>Risk Level:</strong> <span class="risk-badge ${riskLevel === 'Severe' ? 'risk-severe' : 'risk-high'}">${riskLevel}</span></p>
              <p><strong>Burnout Score:</strong> ${burnoutScore}/100</p>
            </div>
            
            <p>This user may need immediate attention. Consider:</p>
            <ul>
              <li>Sending a wellness check email</li>
              <li>Reaching out directly</li>
              <li>Escalating to counseling services if score > 75</li>
            </ul>
            
            <a href="http://localhost:8080/admin/risk" class="button">View Risk Dashboard</a>
            
            <p>Please take appropriate action to support this user.</p>
          </div>
          <div class="footer">
            <p>MindTrack AI - Calmer studies, clearer minds</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<{ success: boolean; error?: string }> {
  const subject = 'Welcome to MindTrack AI 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MindTrack AI</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MindTrack AI! 🎉</h1>
            <p>Your journey to better mental wellness starts now</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Welcome to MindTrack AI! We're excited to help you predict burnout before it affects your studies.</p>
            
            <div class="feature">
              <h3>🔮 Burnout Prediction</h3>
              <p>Get transparent scores explaining exactly what's draining you</p>
            </div>
            
            <div class="feature">
              <h3>🎤 Voice Check-ins</h3>
              <p>Speak naturally - we extract your sleep, stress, and workload</p>
            </div>
            
            <div class="feature">
              <h3>📋 AI Study Planner</h3>
              <p>Schedules that adapt automatically when burnout risk rises</p>
            </div>
            
            <a href="http://localhost:8080/assessment" class="button">Start Your First Assessment</a>
            
            <p>Take just 2 minutes to complete your first assessment and get personalized insights!</p>
          </div>
          <div class="footer">
            <p>MindTrack AI - Calmer studies, clearer minds</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
}
