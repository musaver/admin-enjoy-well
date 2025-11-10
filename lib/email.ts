export async function sendTextEmail(to: string, subject: string, text: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'No-reply', email: 'info@doorgas.co' },
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Brevo Error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  return await res.json();
}

export async function sendApprovalEmail(to: string, name?: string) {
  const userName = name || 'User';
  const subject = 'Account Approved - Welcome!';
  const text = `Hello ${userName},

Great news! Your account has been approved and you now have full access to our platform.

You can now browse and purchase products.

Thank you for joining us!

Best regards,
The Admin Team`;

  return await sendTextEmail(to, subject, text);
}

export async function sendRejectionEmail(to: string, name?: string) {
  const userName = name || 'User';
  const subject = 'Account Status Update';
  const text = `Hello ${userName},

We wanted to update you on your account status. Your account is currently pending review.

If you have any questions or concerns, please don't hesitate to contact our support team.

Best regards,
The Admin Team`;

  return await sendTextEmail(to, subject, text);
}

export async function sendVendorActivationEmail(to: string, companyName: string) {
  const subject = '🎉 Your Vendor Account is Now Active - Let\'s Enjoy';
  const text = `Hello ${companyName},

Congratulations! We're excited to inform you that your vendor account has been approved and activated on Let's Enjoy platform.

✅ Your Account Details:
- Company Name: ${companyName}
- Email: ${to}
- Account Status: Active & Verified

🚀 What's Next?
You can now login to your vendor dashboard using your email address. We use a secure OTP (One-Time Password) system for login - no need to remember passwords!

To login:
1. Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://letsenjoypk.com'}/register
2. Enter your email address
3. You'll receive an OTP code via email
4. Enter the OTP to access your dashboard

📊 Your To Do List:
- Manage your company profile
- Upload and manage banners
- Create and manage coupons
- View analytics and reports
- Update business information

💡 Need Help?
If you have any questions or need assistance getting started, our support team is here to help.

Thank you for partnering with Let's Enjoy! We look forward to a successful collaboration.

Best regards,
The Let's Enjoy Team

---
This is an automated message. Please do not reply to this email.`;

  return await sendTextEmail(to, subject, text);
}
