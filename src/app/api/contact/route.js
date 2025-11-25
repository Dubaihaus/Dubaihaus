// src/app/api/contact/route.js
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // required for nodemailer in Next.js App Router

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

    // Basic validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Load environment variables
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER; // MUST be hello@dubaihaus.com
    const pass = process.env.SMTP_PASS;
    const to = process.env.TO_EMAIL || user;
    const fromName = process.env.SMTP_FROM_NAME || "DubaiHaus";

    if (!host || !user || !pass) {
      console.error("❌ SMTP ENV MISSING");
      return new Response(
        JSON.stringify({ error: "Server email configuration error" }),
        { status: 500 }
      );
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Zoho SMTP (SSL)
      auth: {
        user,
        pass,
      },
    });

    // Build subject
    const subject = `New Inquiry: ${projectTitle || "DubaiHaus Website"}`;

    // Plain text version
    const text = `
Project: ${projectTitle || "N/A"}
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}

Purpose: ${purpose || "N/A"}
Budget: ${budget || "N/A"}
Areas: ${areas || "N/A"}
Marketing consent: ${consentMarketing ? "Yes" : "No"}

Message:
${message}
`.trim();

    // HTML version
    const html = `
      <h2>New website enquiry</h2>
      <p><strong>Project:</strong> ${projectTitle || "N/A"}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Purpose:</strong> ${purpose || "N/A"}</p>
      <p><strong>Budget:</strong> ${budget || "N/A"}</p>
      <p><strong>Areas:</strong> ${areas || "N/A"}</p>
      <p><strong>Marketing consent:</strong> ${
        consentMarketing ? "Yes" : "No"
      }</p>

      <hr />

      <p><strong>Message:</strong></p>
      <p>${(message || "").replace(/\n/g, "<br>")}</p>
    `;

    // 🔥 IMPORTANT: Zoho requires "from" and "sender" to be the Zoho user
    await transporter.sendMail({
      from: `"${fromName}" <${user}>`, // MUST match SMTP_USER
      sender: user, // VERY IMPORTANT FOR ZOHO
      to,
      subject,
      replyTo: email, // client email goes here (safe)
      text,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error("❌ MAIL ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Email failed" }),
      { status: 500 }
    );
  }
}
