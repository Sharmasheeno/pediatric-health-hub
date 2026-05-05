const nodemailer = require('nodemailer');

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

/**
 * Send OTP verification email for password reset
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: `"Pediatric Health Hub" <${process.env.SMTP_EMAIL}>`,
        to: toEmail,
        subject: '🔐 Password Reset Verification Code — Pediatric Health Hub',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
                    <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">🏥 Pediatric Health Hub</h1>
                    <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 6px;">Secure Password Reset</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
                        We received a request to reset your password. Use the verification code below to proceed. This code expires in <strong style="color: #f59e0b;">10 minutes</strong>.
                    </p>
                    <div style="background: #1e293b; border: 2px solid #334155; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 12px 0; font-weight: 700;">Your Verification Code</p>
                        <p style="color: #38bdf8; font-size: 36px; font-weight: 900; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
                    </div>
                    <p style="color: #475569; font-size: 12px; line-height: 1.6;">
                        If you did not request this, please ignore this email. Your account remains secure.
                    </p>
                </div>
                <div style="background: #0c1322; padding: 16px; text-align: center; border-top: 1px solid #1e293b;">
                    <p style="color: #334155; font-size: 11px; margin: 0;">© 2026 Pediatric Health Hub · Encrypted & Secure</p>
                </div>
            </div>
        `
    };

    try {
        const info = await getTransporter().sendMail(mailOptions);
        console.log(`[EMAIL] OTP sent to ${toEmail}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL] Failed to send OTP:', error.message);
        // In development, log the OTP so testing isn't blocked
        if (process.env.NODE_ENV === 'development') {
            console.log(`[EMAIL-DEV-FALLBACK] OTP for ${toEmail}: ${otp}`);
        }
        return false;
    }
};

module.exports = { sendOTPEmail };
