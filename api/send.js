const nodemailer = require('nodemailer');

const LOGO_URL = 'https://raw.githubusercontent.com/cesarfeik/Codvyn/main/logo%202.png';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, email, negocio, telefono, urgencia, mensaje } = req.body;

  if (!nombre || !email || !negocio) {
    return res.status(400).json({ ok: false, error: 'Faltan campos requeridos.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const fecha = new Date().toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // 1. Notificacion interna
  try {
    const filas = [
      ['Nombre', nombre],
      ['Correo', '<a href="mailto:' + email + '" style="color:#0ABBA5;">' + email + '</a>'],
      ['Negocio', negocio],
      telefono ? ['Teléfono', telefono] : null,
      urgencia ? ['Urgencia', urgencia] : null,
    ].filter(Boolean);

    const filasHTML = filas.map((f, i) =>
      '<tr><td style="padding:12px 16px;color:#666;font-size:13px;width:120px;' + (i > 0 ? 'border-top:1px solid #1e1e1e;' : '') + '">' + f[0] + '</td><td style="padding:12px 16px;color:#fff;font-size:13px;font-weight:600;' + (i > 0 ? 'border-top:1px solid #1e1e1e;' : '') + '">' + f[1] + '</td></tr>'
    ).join('');

    await transporter.sendMail({
      from: '"Codvyn Web" <' + process.env.GMAIL_USER + '>',
      to: 'mycodvyn@gmail.com',
      replyTo: email,
      subject: 'Nueva cotizacion de ' + nombre + ' — ' + negocio,
      text: 'Nombre: ' + nombre + '\nCorreo: ' + email + '\nNegocio: ' + negocio + (telefono ? '\nTelefono: ' + telefono : '') + (urgencia ? '\nUrgencia: ' + urgencia : '') + '\nMensaje: ' + (mensaje || 'sin mensaje'),
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:auto;background:#111;color:#fff;border-radius:12px;overflow:hidden;"><div style="background:#000;padding:24px 28px;border-bottom:1px solid #222;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><b style="color:#0ABBA5;font-size:18px;">Codvyn</b></td><td align="right"><span style="background:#0ABBA5;color:#000;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;">NUEVA COTIZACION</span></td></tr></table></div><div style="padding:28px;"><p style="color:#666;font-size:12px;margin:0 0 20px;">Recibido: ' + fecha + '</p><table style="width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:20px;">' + filasHTML + '</table>' + (mensaje ? '<div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:20px;"><p style="color:#0ABBA5;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 8px;">Mensaje</p><p style="color:#ccc;font-size:14px;line-height:1.7;margin:0;">' + mensaje + '</p></div>' : '') + '<a href="mailto:' + email + '?subject=Tu cotizacion — Codvyn" style="display:inline-block;background:#0ABBA5;color:#000;font-weight:700;font-size:13px;padding:12px 24px;border-radius:100px;text-decoration:none;">Responder al cliente</a></div></div>',
    });
    console.log('Correo interno OK');
  } catch (err) {
    console.error('Error correo interno:', err.message);
    return res.status(500).json({ ok: false, error: 'Error al enviar notificacion interna.' });
  }

  // 2. Confirmacion al cliente — tonos claros
  try {
    console.log('Enviando a cliente:', email);
    await transporter.sendMail({
      from: '"Codvyn" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Gracias ' + nombre + ', recibimos tu solicitud — Codvyn',
      text: 'Hola ' + nombre + ',\n\nGracias por contactarnos. Recibimos tu solicitud para tu ' + negocio + ' y ya la tenemos en manos de nuestro equipo.\n\nNos pondremos en contacto contigo en menos de 24 horas con una propuesta personalizada.\n\nEquipo Codvyn\nmycodvyn@gmail.com',
      html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Codvyn — Solicitud recibida</title></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 16px;">
  <tr><td align="center">
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

      <!-- Logo -->
      <tr><td style="padding-bottom:24px;text-align:center;">
        <img src="${LOGO_URL}" alt="Codvyn" height="36" style="height:36px;display:inline-block;" onerror="this.style.display='none'">
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Banner superior verde -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:#0ABBA5;padding:36px 36px 32px;text-align:center;">
            <table cellpadding="0" cellspacing="0" align="center">
              <tr><td style="background:rgba(255,255,255,0.2);border-radius:50%;width:60px;height:60px;text-align:center;vertical-align:middle;">
                <span style="color:#fff;font-size:28px;font-weight:700;line-height:60px;">&#10003;</span>
              </td></tr>
            </table>
            <h1 style="margin:16px 0 4px;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">&#161;Solicitud recibida!</h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;">Gracias por contactar a Codvyn</p>
          </td></tr>
        </table>

        <!-- Cuerpo -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:36px 36px 28px;">

            <p style="margin:0 0 20px;color:#333;font-size:15px;line-height:1.8;">
              Hola <strong style="color:#111;">${nombre}</strong>,<br>
              recibimos tu solicitud de cotización para tu <strong style="color:#0ABBA5;">${negocio}</strong>. Ya la tenemos en manos de nuestro equipo y pronto tendrás noticias.
            </p>

            <!-- Bloque 24 hrs -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td style="background:#f7fffe;border:2px solid #0ABBA5;border-radius:14px;padding:24px;text-align:center;">
                <p style="margin:0 0 2px;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">Tiempo máximo de respuesta</p>
                <p style="margin:0;color:#0ABBA5;font-size:44px;font-weight:800;letter-spacing:-2px;line-height:1.1;">24 hrs</p>
                <p style="margin:4px 0 0;color:#aaa;font-size:12px;">Generalmente respondemos antes</p>
              </td></tr>
            </table>

            <p style="margin:0;color:#888;font-size:13px;line-height:1.7;text-align:center;">
              Te escribiremos a<br>
              <a href="mailto:${email}" style="color:#0ABBA5;font-weight:600;text-decoration:none;">${email}</a>
            </p>

          </td></tr>
        </table>

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 36px;"><div style="height:1px;background:#f0f0f0;"></div></td></tr>
        </table>

        <!-- Firma -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:24px 36px;text-align:center;">
            <p style="margin:0 0 2px;color:#333;font-size:13px;font-weight:600;">Equipo Codvyn</p>
            <p style="margin:0;color:#aaa;font-size:12px;">mycodvyn@gmail.com</p>
          </td></tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:24px;text-align:center;">
        <p style="margin:0;color:#aaa;font-size:11px;line-height:1.7;">
          © 2025 Codvyn · Páginas web para negocios locales<br>
          Recibiste este correo porque llenaste nuestro formulario de contacto.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
    console.log('Correo cliente OK:', email);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error correo cliente:', err.message, '| destinatario:', email);
    res.status(500).json({ ok: false, error: 'Error al enviar confirmacion al cliente.' });
  }
};