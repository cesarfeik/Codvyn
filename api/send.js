const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, email, negocio, mensaje } = req.body;

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
    await transporter.sendMail({
      from: '"Codvyn Web" <' + process.env.GMAIL_USER + '>',
      to: 'mycodvyn@gmail.com',
      replyTo: email,
      subject: 'Nueva cotizacion de ' + nombre + ' — ' + negocio,
      text: 'Nombre: ' + nombre + '\nCorreo: ' + email + '\nNegocio: ' + negocio + '\nMensaje: ' + (mensaje || 'sin mensaje'),
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:auto;background:#111;color:#fff;border-radius:12px;overflow:hidden;"><div style="background:#000;padding:24px 28px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;"><b style="color:#0ABBA5;font-size:18px;">Codvyn</b><span style="background:#0ABBA5;color:#000;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;">NUEVA COTIZACION</span></div><div style="padding:28px;"><p style="color:#666;font-size:12px;margin:0 0 20px;">Recibido: ' + fecha + '</p><table style="width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:20px;"><tr style="border-bottom:1px solid #222;"><td style="padding:12px 16px;color:#666;font-size:13px;width:120px;">Nombre</td><td style="padding:12px 16px;color:#fff;font-size:13px;font-weight:600;">' + nombre + '</td></tr><tr style="border-bottom:1px solid #222;"><td style="padding:12px 16px;color:#666;font-size:13px;">Correo</td><td style="padding:12px 16px;"><a href="mailto:' + email + '" style="color:#0ABBA5;font-size:13px;">' + email + '</a></td></tr><tr><td style="padding:12px 16px;color:#666;font-size:13px;">Negocio</td><td style="padding:12px 16px;color:#fff;font-size:13px;">' + negocio + '</td></tr></table>' + (mensaje ? '<div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:20px;"><p style="color:#0ABBA5;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 8px;">Mensaje</p><p style="color:#ccc;font-size:14px;line-height:1.7;margin:0;">' + mensaje + '</p></div>' : '') + '<a href="mailto:' + email + '?subject=Tu cotizacion Codvyn" style="display:inline-block;background:#0ABBA5;color:#000;font-weight:700;font-size:13px;padding:12px 24px;border-radius:100px;text-decoration:none;">Responder al cliente</a></div></div>',
    });
    console.log('Correo interno OK');
  } catch (err) {
    console.error('Error correo interno:', err.message);
    return res.status(500).json({ ok: false, error: 'Error al enviar notificacion interna.' });
  }

  // 2. Confirmacion al cliente
  try {
    console.log('Enviando a cliente:', email);
    await transporter.sendMail({
      from: '"Codvyn" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Gracias ' + nombre + ', recibimos tu solicitud',
      text: 'Hola ' + nombre + ',\n\nGracias por contactarnos. Recibimos tu solicitud y ya estamos trabajando en una propuesta personalizada para tu ' + negocio + '.\n\nNos pondremos en contacto contigo en menos de 24 horas.\n\nEquipo Codvyn\nmycodvyn@gmail.com',
      html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:48px 16px;">
  <tr><td align="center">
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

      <!-- Logo -->
      <tr><td style="padding-bottom:32px;text-align:center;">
        <span style="color:#0ABBA5;font-weight:800;font-size:22px;letter-spacing:-0.5px;">Codvyn</span>
      </td></tr>

      <!-- Card principal -->
      <tr><td style="background:#161616;border-radius:20px;overflow:hidden;border:1px solid #222;">

        <!-- Franja verde superior -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:linear-gradient(135deg,#0ABBA5,#07a090);padding:40px 36px;text-align:center;">
            <div style="display:inline-block;background:rgba(0,0,0,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;margin-bottom:16px;">
              <span style="color:#fff;font-size:30px;font-weight:700;">&#10003;</span>
            </div>
            <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.3px;">Solicitud recibida</h1>
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">Tu mensaje llego correctamente</p>
          </td></tr>
        </table>

        <!-- Cuerpo -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:36px;">

            <p style="margin:0 0 6px;color:#888;font-size:13px;">Hola,</p>
            <h2 style="margin:0 0 20px;color:#fff;font-size:20px;font-weight:700;">${nombre} 👋</h2>

            <p style="margin:0 0 28px;color:#aaa;font-size:14px;line-height:1.8;">
              Gracias por ponerte en contacto con nosotros. Recibimos tu solicitud de cotizacion para tu <span style="color:#fff;font-weight:600;">${negocio}</span> y ya la tenemos en nuestras manos.
            </p>

            <!-- Bloque destacado -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#0f0f0f;border-radius:14px;border:1px solid #1e1e1e;padding:24px;text-align:center;">
                  <p style="margin:0 0 4px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">Tiempo de respuesta</p>
                  <p style="margin:0;color:#0ABBA5;font-size:42px;font-weight:800;letter-spacing:-1px;">24 hrs</p>
                  <p style="margin:4px 0 0;color:#555;font-size:12px;">maximo — generalmente antes</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#555;font-size:13px;line-height:1.7;text-align:center;">
              Nos pondremos en contacto contigo a este correo<br>
              <span style="color:#0ABBA5;">${email}</span>
            </p>

          </td></tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:28px;text-align:center;">
        <p style="margin:0;color:#333;font-size:11px;line-height:1.7;">
          © 2025 Codvyn · Paginas web para negocios locales<br>
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