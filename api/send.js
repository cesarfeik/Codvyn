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
      subject: 'Codvyn recibio tu mensaje, ' + nombre,
      text: 'Hola ' + nombre + ',\n\nRecibimos tu solicitud para tu ' + negocio + '. Te contactaremos en menos de 24 horas.\n\nWhatsApp: https://wa.me/525515255638\nCorreo: mycodvyn@gmail.com\n\nEquipo Codvyn',
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:auto;background:#f4f4f5;border-radius:12px;overflow:hidden;"><div style="background:#000;padding:28px;text-align:center;"><span style="color:#0ABBA5;font-weight:800;font-size:22px;">Codvyn</span></div><div style="background:#fff;padding:32px;text-align:center;"><div style="display:inline-block;background:#0ABBA5;width:52px;height:52px;border-radius:50%;line-height:52px;text-align:center;"><span style="color:#000;font-size:24px;font-weight:700;">&#10003;</span></div><h1 style="margin:16px 0 6px;color:#111;font-size:20px;font-weight:800;">Mensaje recibido</h1><p style="margin:0 0 24px;color:#777;font-size:14px;">Hola <b style="color:#111;">' + nombre + '</b>, gracias por contactarnos.</p><p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.7;text-align:left;">Recibimos tu solicitud para tu <b>' + negocio + '</b>. Nuestro equipo la esta revisando y te contactaremos con una propuesta personalizada.</p><div style="background:#f9f9f9;border-radius:10px;border:1px solid #eee;padding:20px;margin-bottom:20px;"><p style="margin:0 0 4px;color:#0ABBA5;font-size:26px;font-weight:800;">24 hrs</p><p style="margin:0;color:#888;font-size:12px;">Tiempo maximo de respuesta</p></div><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-right:6px;"><a href="https://wa.me/525515255638" style="display:block;background:#000;color:#fff;font-size:12px;font-weight:600;padding:11px;border-radius:100px;text-decoration:none;text-align:center;">WhatsApp</a></td><td style="padding-left:6px;"><a href="mailto:mycodvyn@gmail.com" style="display:block;background:#f4f4f5;color:#111;font-size:12px;font-weight:600;padding:11px;border-radius:100px;text-decoration:none;text-align:center;border:1px solid #ddd;">Correo</a></td></tr></table></div><div style="background:#fafafa;padding:16px;border-top:1px solid #eee;"><p style="margin:0;color:#bbb;font-size:11px;text-align:center;">2025 Codvyn · Recibiste este correo porque llenaste nuestro formulario</p></div></div>',
    });
    console.log('Correo cliente OK:', email);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error correo cliente:', err.message, '| destinatario:', email);
    res.status(500).json({ ok: false, error: 'Error al enviar confirmacion al cliente.' });
  }
};