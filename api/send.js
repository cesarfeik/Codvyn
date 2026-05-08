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

  const fecha = new Date().toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  try {
    // ── 1. Notificación interna ──────────────────────────────────────────────
    await transporter.sendMail({
      from: `"Codvyn Web" <${process.env.GMAIL_USER}>`,
      to: 'mycodvyn@gmail.com',
      replyTo: email,
      subject: `🔔 Nueva cotización de ${nombre} — ${negocio}`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#000;border-radius:16px 16px 0 0;padding:28px 32px;border-bottom:1px solid #1a1a1a;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td><span style="color:#0ABBA5;font-weight:800;font-size:20px;letter-spacing:-0.5px;">Codvyn</span></td>
              <td align="right"><span style="background:#0ABBA5;color:#000;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;">NUEVA COTIZACIÓN</span></td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111;padding:32px;">

          <p style="margin:0 0 24px;color:#888;font-size:12px;">Recibido el ${fecha}</p>

          <!-- Datos del cliente -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <tr><td colspan="2" style="background:#1a1a1a;padding:12px 16px;color:#0ABBA5;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Datos del cliente</td></tr>
            <tr>
              <td style="padding:14px 16px;color:#666;font-size:13px;border-top:1px solid #1e1e1e;width:130px;">Nombre</td>
              <td style="padding:14px 16px;color:#fff;font-size:13px;font-weight:600;border-top:1px solid #1e1e1e;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;color:#666;font-size:13px;border-top:1px solid #1e1e1e;">Correo</td>
              <td style="padding:14px 16px;border-top:1px solid #1e1e1e;"><a href="mailto:${email}" style="color:#0ABBA5;font-size:13px;text-decoration:none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:14px 16px;color:#666;font-size:13px;border-top:1px solid #1e1e1e;">Negocio</td>
              <td style="padding:14px 16px;color:#fff;font-size:13px;border-top:1px solid #1e1e1e;">${negocio}</td>
            </tr>
          </table>

          <!-- Mensaje -->
          ${mensaje ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <tr><td style="background:#1a1a1a;padding:12px 16px;color:#0ABBA5;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Mensaje</td></tr>
            <tr><td style="padding:16px;color:#ccc;font-size:14px;line-height:1.7;white-space:pre-wrap;border-top:1px solid #1e1e1e;">${mensaje}</td></tr>
          </table>` : ''}

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="mailto:${email}?subject=Tu cotización — Codvyn" style="display:inline-block;background:#0ABBA5;color:#000;font-size:13px;font-weight:700;padding:12px 28px;border-radius:100px;text-decoration:none;">Responder al cliente →</a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0a0a0a;border-radius:0 0 16px 16px;padding:16px 32px;border-top:1px solid #1a1a1a;">
          <p style="margin:0;color:#444;font-size:11px;text-align:center;">Este correo fue generado automáticamente por codvyn.vercel.app</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    // ── 2. Confirmación al cliente ───────────────────────────────────────────
    await transporter.sendMail({
      from: `"Codvyn" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Hola ${nombre}, recibimos tu mensaje ✅`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#000;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <span style="color:#0ABBA5;font-weight:800;font-size:24px;letter-spacing:-0.5px;">Codvyn</span>
          <p style="margin:6px 0 0;color:#666;font-size:12px;">Páginas web para negocios locales</p>
        </td></tr>

        <!-- Check icon -->
        <tr><td style="background:#fff;padding:40px 32px 0;text-align:center;">
          <div style="display:inline-block;background:#0ABBA5;width:56px;height:56px;border-radius:50%;text-align:center;line-height:56px;">
            <span style="color:#000;font-size:26px;font-weight:700;">✓</span>
          </div>
          <h1 style="margin:20px 0 8px;color:#111;font-size:22px;font-weight:800;">¡Mensaje recibido!</h1>
          <p style="margin:0;color:#777;font-size:14px;">Hola <strong style="color:#111;">${nombre}</strong>, gracias por contactarnos.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:28px 32px;">

          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
            Recibimos tu solicitud de cotización para tu <strong>${negocio}</strong>. Nuestro equipo ya la está revisando y te contactaremos con una propuesta personalizada.
          </p>

          <!-- Tiempo de respuesta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:12px;border:1px solid #eee;margin-bottom:24px;">
            <tr>
              <td style="padding:20px 24px;text-align:center;">
                <p style="margin:0 0 4px;color:#0ABBA5;font-size:28px;font-weight:800;">24 hrs</p>
                <p style="margin:0;color:#888;font-size:12px;">Tiempo máximo de respuesta</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px;color:#888;font-size:13px;line-height:1.6;">
            Mientras tanto, puedes ver nuestro portafolio y conocer más sobre cómo trabajamos. Si tienes alguna pregunta urgente no dudes en escribirnos.
          </p>

          <!-- Botones -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:8px;" width="50%">
                <a href="https://wa.me/525515255638" style="display:block;background:#000;color:#fff;font-size:12px;font-weight:600;padding:12px 16px;border-radius:100px;text-decoration:none;text-align:center;">WhatsApp directo →</a>
              </td>
              <td style="padding-left:8px;" width="50%">
                <a href="mailto:mycodvyn@gmail.com" style="display:block;background:#f4f4f5;color:#111;font-size:12px;font-weight:600;padding:12px 16px;border-radius:100px;text-decoration:none;text-align:center;border:1px solid #e0e0e0;">Enviar correo →</a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafafa;border-radius:0 0 16px 16px;padding:20px 32px;border-top:1px solid #eee;">
          <p style="margin:0;color:#bbb;font-size:11px;text-align:center;">
            © 2025 Codvyn · Páginas web para negocios locales<br>
            Recibiste este correo porque llenaste el formulario en nuestro sitio web.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error enviando correo:', err);
    res.status(500).json({ ok: false, error: 'Error al enviar el correo.' });
  }
};
