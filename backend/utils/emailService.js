const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Get or create a nodemailer transporter.
 * - If real Gmail credentials are in .env, uses Gmail.
 * - Otherwise, auto-creates an Ethereal test account (free, no signup needed).
 *   Ethereal captures emails and provides a preview URL in the console.
 */
const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const hasRealCredentials =
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER !== 'your_email@gmail.com';

  if (hasRealCredentials) {
    // Production mode — use real Gmail
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Email service: Using Gmail (real credentials)');
  } else {
    // Development mode — auto-create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Email service: Using Ethereal test account');
    console.log(`   Ethereal user: ${testAccount.user}`);
    console.log(`   View all sent emails at: https://ethereal.email/login`);
    console.log(`   Login with: ${testAccount.user} / ${testAccount.pass}\n`);
  }

  return cachedTransporter;
};

/**
 * Send an email using Nodemailer
 * Works dynamically for ALL users — no per-user setup needed.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body HTML
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'eventhub@noreply.com',
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);

    // If using Ethereal, print the preview URL so you can view the email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`   👀 Preview email: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error(`❌ Error sending email to ${to}: ${error.message}`);
  }
};

/**
 * Placeholder for SMS OTP sending.
 * Replace with Twilio/Fast2SMS when ready.
 * @param {string} phone - Recipient phone number
 * @param {string} otp - OTP to send
 */
const sendSMS = async (phone, otp) => {
  if (!phone) return;
  console.log(`\n--- SMS OTP (Console Only) ---`);
  console.log(`📱 To: ${phone}`);
  console.log(`🔑 OTP: ${otp}`);
  console.log(`-----------------------------\n`);
};

module.exports = {
  sendEmail,
  sendSMS,
};
