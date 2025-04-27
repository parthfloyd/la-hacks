import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message, pdfBase64, fileName } = await request.json();

    if (!email || !pdfBase64) {
      return NextResponse.json(
        { error: 'Email and PDF attachment are required' },
        { status: 400 }
      );
    }

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Extract base64 data from data URI string
    const base64Data = pdfBase64.split(';base64,').pop();
    
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid PDF data' },
        { status: 400 }
      );
    }

    // Configure email options
    const mailOptions = {
      from: `"HealthGuardian" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || 'Your HealthGuardian Report',
      text: message || 'Please find your medical report attached.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #008DC9; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">HealthGuardian</h1>
          </div>
          <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.5;">Thank you for using HealthGuardian. Your medical report is attached to this email.</p>
            <p style="font-size: 16px; line-height: 1.5;">Please keep this information secure and confidential.</p>
            <p style="font-size: 16px; line-height: 1.5;">Best regards,<br>The HealthGuardian Team</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} HealthGuardian. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName || 'HealthGuardian_Report.pdf',
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 