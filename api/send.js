const nodemailer = require('nodemailer');

const LOGO_URL = 'https://raw.githubusercontent.com/cesarfeik/Codvyn/main/logo.png';

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

  // 1. Notificacion interna — estilo claro
  try {
    const filas = [
      ['Nombre', nombre],
      ['Correo', '<a href="mailto:' + email + '" style="color:#0ABBA5;text-decoration:none;font-weight:600;">' + email + '</a>'],
      ['Negocio', negocio],
      telefono ? ['Teléfono', telefono] : null,
      urgencia ? ['Urgencia', urgencia] : null,
    ].filter(Boolean);

    const filasHTML = filas.map((f, i) =>
      '<tr>' +
        '<td style="padding:13px 20px;color:#888;font-size:13px;width:110px;' + (i > 0 ? 'border-top:1px solid #f0f0f0;' : '') + '">' + f[0] + '</td>' +
        '<td style="padding:13px 20px;color:#111;font-size:13px;font-weight:600;' + (i > 0 ? 'border-top:1px solid #f0f0f0;' : '') + '">' + f[1] + '</td>' +
      '</tr>'
    ).join('');

    await transporter.sendMail({
      from: '"Codvyn Web" <' + process.env.GMAIL_USER + '>',
      to: 'mycodvyn@gmail.com',
      replyTo: email,
      subject: 'Nueva cotizacion de ' + nombre + ' — ' + negocio,
      text: 'Nombre: ' + nombre + '\nCorreo: ' + email + '\nNegocio: ' + negocio + (telefono ? '\nTelefono: ' + telefono : '') + (urgencia ? '\nUrgencia: ' + urgencia : '') + '\nMensaje: ' + (mensaje || 'sin mensaje'),
      html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
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

        <!-- Banner -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:#0ABBA5;padding:32px 36px;text-align:center;">
            <span style="background:rgba(255,255,255,0.2);display:inline-block;border-radius:100px;padding:4px 16px;color:#fff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;">Nueva cotización</span>
            <h1 style="margin:0 0 4px;color:#fff;font-size:20px;font-weight:800;">${nombre} quiere cotizar</h1>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;">${fecha}</p>
          </td></tr>
        </table>

        <!-- Datos -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:28px 36px 0;">
            <p style="margin:0 0 12px;color:#aaa;font-size:11px;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">Información del cliente</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f0f0f0;border-radius:12px;overflow:hidden;">
              ${filasHTML}
            </table>
          </td></tr>
        </table>

        ${mensaje ? `
        <!-- Mensaje -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:20px 36px 0;">
            <p style="margin:0 0 12px;color:#aaa;font-size:11px;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">Mensaje</p>
            <div style="background:#fafafa;border:1px solid #f0f0f0;border-radius:12px;padding:16px 20px;">
              <p style="margin:0;color:#444;font-size:14px;line-height:1.7;">${mensaje}</p>
            </div>
          </td></tr>
        </table>` : ''}

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:28px 36px 32px;text-align:center;">
            <a href="mailto:${email}?subject=Tu cotizacion — Codvyn" style="display:inline-block;background:#0ABBA5;color:#fff;font-size:13px;font-weight:700;padding:13px 28px;border-radius:100px;text-decoration:none;">Responder a ${nombre}</a>
          </td></tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:24px;text-align:center;">
        <p style="margin:0;color:#aaa;font-size:11px;">© 2025 Codvyn · Notificación automática del formulario web</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
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
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
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