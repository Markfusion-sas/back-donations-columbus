import nodemailer from 'nodemailer';
import { Resend } from 'resend';

import {
  MAIL_FROM,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_USER,
  RESEND_API_KEY,
  RESEND_EMAIL
} from '#config/environment.config';

/**
 * Envío de correos. Prioridad:
 *  1. SMTP (MAIL_HOST): la Fundación pidió enviar desde su propio buzón,
 *     fundaciontcs@columbus.edu.co (Google Workspace), igual que TCS Run (2026-10-01).
 *  2. Resend (RESEND_API_KEY), como estaba antes.
 *  3. Sin configuración: no se envía y se avisa en el log (el servidor no se cae).
 */
const smtp = MAIL_HOST
  ? nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: Number(MAIL_PORT) === 465,
    auth: { user: MAIL_USER, pass: MAIL_PASSWORD }
  })
  : null;

const resend = !smtp && RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const mailProvider = smtp ? 'smtp' : resend ? 'resend' : 'ninguno';

/**
 * @param {object} mail
 * @param {string} mail.fromName   - Nombre visible del remitente
 * @param {string|string[]} mail.to
 * @param {string} mail.subject
 * @param {string} mail.html
 * @param {Array<{filename: string, content: Buffer}>} [mail.attachments]
 * @returns {Promise<{id: string}>} - lanza error si el proveedor rechaza el correo
 */
export const deliverMail = async({ fromName, to, subject, html, attachments }) => {
  if (smtp) {
    const info = await smtp.sendMail({
      from: { name: fromName, address: MAIL_FROM || MAIL_USER },
      to,
      subject,
      html,
      ...(attachments ? { attachments } : {})
    });
    return { id: info.messageId };
  }

  if (resend) {
    const result = await resend.emails.send({
      from: `${fromName} <${RESEND_EMAIL}>`,
      to,
      subject,
      html,
      ...(attachments ? { attachments } : {})
    });
    if (result?.error) throw new Error(`Resend rechazó el correo: ${JSON.stringify(result.error)}`);
    return { id: result?.data?.id };
  }

  throw new Error('No hay proveedor de correo configurado (MAIL_HOST o RESEND_API_KEY)');
};

/** Comprueba usuario y contraseña SMTP sin enviar ningún correo. */
export const verifyMailer = async() => {
  if (!smtp) return { provider: mailProvider, ok: false, message: 'SMTP no configurado' };
  await smtp.verify();
  return { provider: 'smtp', ok: true };
};
