import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { name, email, message, projectTitle } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = process.env.TO_EMAIL || 'rehan10crkt@gmail.com';

    await transporter.sendMail({
      from: `"Dubai Off Plan" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `New Inquiry: ${projectTitle || 'Project'}`,
      replyTo: email,
      text:
`Project: ${projectTitle || 'N/A'}
Name: ${name}
Email: ${email}

Message:
${message}`,
      html:
        `<p><strong>Project:</strong> ${projectTitle || 'N/A'}</p>
         <p><strong>Name:</strong> ${name}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Message:</strong></p>
         <p>${message.replace(/\n/g, '<br/>')}</p>`,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('MAIL ERROR:', err);
    return new Response(JSON.stringify({ error: 'Email failed' }), { status: 500 });
  }
}
