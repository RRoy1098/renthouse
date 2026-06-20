import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_API_KEY,
  },
});

export async function sendPasswordEmail({ to, name, password }) {
  const mailOptions = {
    from: '"RentHouse Admin" <' + (process.env.EMAIL_FROM || 'noreply@renthouse.com') + '>',
    to,
    subject: 'Your RentHouse Owner Account Has Been Approved',
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">',
        '<div style="text-align: center; margin-bottom: 24px;">',
          '<div style="width: 48px; height: 48px; border-radius: 12px; background: #4f46e5; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">R</div>',
        '</div>',
        '<h1 style="text-align: center; color: #111827; font-size: 22px; margin-bottom: 8px;">Account Approved!</h1>',
        '<p style="text-align: center; color: #6b7280; margin-bottom: 24px;">Your owner account has been verified by our admin team.</p>',
        '<div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">',
          '<p style="color: #374151; font-size: 14px; margin-bottom: 16px;">Hello <strong>' + name + '</strong>,</p>',
          '<p style="color: #374151; font-size: 14px; margin-bottom: 16px;">Your owner registration has been reviewed and approved. You can now log in to the owner portal using the credentials below:</p>',
          '<div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">',
            '<p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">Email</p>',
            '<p style="margin: 0 0 16px; font-size: 15px; color: #111827; font-weight: 600;">' + to + '</p>',
            '<p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">Password</p>',
            '<p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600; font-family: monospace;">' + password + '</p>',
          '</div>',
          '<p style="color: #6b7280; font-size: 13px;">Please change your password after logging in for security purposes.</p>',
        '</div>',
        '<div style="text-align: center;">',
          '<a href="http://localhost:5001/login" style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 12px 32px; border-radius: 10px; font-weight: 600; font-size: 14px;">Log In to Owner Portal</a>',
        '</div>',
        '<p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">RentHouse &mdash; AI-Powered Housing Platform</p>',
      '</div>',
    ].join('\n'),
  };

  await transporter.sendMail(mailOptions);
}
