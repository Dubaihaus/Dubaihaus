// src/app/api/contact/route.js
import nodemailer from 'nodemailer';

export const runtime = 'nodejs'; // IMPORTANT for nodemailer in Next.js App Router

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      message,
      projectTitle,
      purpose,
      budget,
      areas,
      consentMarketing,
    } = body || {};

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      console.error('SMTP ENV MISSING');
      return new Response(
        JSON.stringify({ error: 'Server email configuration error' }),
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Zoho uses 465 + SSL
      auth: {
        user,
        pass,
      },
    });

    const to = process.env.TO_EMAIL || user;
    const from = process.env.SMTP_FROM || user;

    const subject = `New Inquiry: ${projectTitle || 'DubaiHaus Website'}`;

    const text = `
Project: ${projectTitle || 'N/A'}
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}

Purpose: ${purpose || 'N/A'}
Budget: ${budget || 'N/A'}
Areas: ${areas || 'N/A'}
Wants marketing emails: ${consentMarketing ? 'Yes' : 'No'}

Message:
${message}
    `.trim();

    const html = `
      <h2>New website enquiry</h2>
      <p><strong>Project:</strong> ${projectTitle || 'N/A'}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Purpose:</strong> ${purpose || 'N/A'}</p>
      <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
      <p><strong>Areas:</strong> ${areas || 'N/A'}</p>
      <p><strong>Marketing consent:</strong> ${
        consentMarketing ? 'Yes' : 'No'
      }</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${(message || '').replace(/\n/g, '<br />')}</p>
    `;

    await transporter.sendMail({
      from,
      to,
      subject,
      replyTo: email,
      text,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('MAIL ERROR:', err);
    return new Response(
      JSON.stringify({ error: 'Email failed' }),
      { status: 500 }
    );
  }
}
