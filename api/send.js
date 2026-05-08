const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, email, negocio, mensaje } = req.body;

  if (!nombre || !email || !negocio) {
    return res.status(400).json({ ok: false, error: 'Faltan campos requeridos.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Codvyn Web" <${process.env.GMAIL_USER}>`,
      to: 'mycodvyn@gmail.com',
      subject: `Nueva cotización de ${nombre} — Codvyn`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#f9f9f9;border-radius:12px;padding:32px;">
          <h2 style="color:#0ABBA5;margin-top:0;">Nueva cotización recibida</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#555;font-size:13px;width:140px;">Nombre</td><td style="padding:8px 0;font-size:13px;font-weight:600;">${nombre}</td></tr>
            <tr><td style="padding:8px 0;color:#555;font-size:13px;">Correo</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#555;font-size:13px;">Tipo de negocio</td><td style="padding:8px 0;font-size:13px;">${negocio}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;">
          <p style="color:#555;font-size:13px;margin:0 0 6px;">Mensaje:</p>
          <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${mensaje || '(sin mensaje)'}</p>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"Codvyn" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Recibimos tu mensaje — Codvyn',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #e8e8e8;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:#0ABBA5;color:#000;font-weight:800;font-size:18px;padding:10px 24px;border-radius:100px;">Codvyn</div>
          </div>
          <h2 style="color:#111;margin:0 0 12px;">Hola, ${nombre} 👋</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
            Recibimos tu solicitud de cotización. Estamos revisando la información que nos compartiste y
            <strong>en menos de 24 horas</strong> te contactaremos con una propuesta personalizada para tu negocio.
          </p>
          <div style="background:#f5f5f5;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
            <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Resumen de tu solicitud</p>
            <p style="margin:0;font-size:14px;"><strong>Tipo de negocio:</strong> ${negocio}</p>
          </div>
          <p style="color:#999;font-size:13px;line-height:1.5;margin:0;">
            Si tienes alguna pregunta urgente puedes escribirnos a
            <a href="mailto:mycodvyn@gmail.com" style="color:#0ABBA5;">mycodvyn@gmail.com</a> o por
            <a href="https://wa.me/525515255638" style="color:#0ABBA5;">WhatsApp</a>.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px;">
          <p style="color:#bbb;font-size:12px;text-align:center;margin:0;">© 2025 Codvyn · Páginas web para negocios locales</p>
        </div>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error enviando correo:', err);
    res.status(500).json({ ok: false, error: 'Error al enviar el correo.' });
  }
};
