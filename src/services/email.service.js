import { Resend } from 'resend';

import { ADMIN_EMAIL, FRONTEND_URL, RESEND_API_KEY, RESEND_EMAIL } from '#config/environment.config';
import { errorLog, log } from '#utils/logger.util';

const resend = new Resend(RESEND_API_KEY);

const buildOrderConfirmationHtml = ({ order, details }) => {
  const itemsRows = details.map(detail => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">Bingo - ${detail.variant.name}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${detail.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${detail.unit_price.toLocaleString('es-CO')}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${detail.total.toLocaleString('es-CO')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="background-color: #ffffff; padding: 24px 32px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="https://res.cloudinary.com/dsgd6xc37/image/upload/v1773274793/logo-col_afn3xn.png" alt="Fundación The Columbus School" style="max-width: 220px; height: auto;" />
                </td>
              </tr>
              <tr>
                <td style="background-color: #003087; padding: 24px 32px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px;">¡Compra confirmada!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px;">
                  <p style="font-size: 16px; color: #333;">Hola, <strong>${order.name} ${order.last_name}</strong></p>
                  <p style="font-size: 15px; color: #555;">Tu pago fue aprobado exitosamente. Aquí está el resumen de tu orden:</p>

                  <p style="font-size: 13px; color: #888; margin-bottom: 4px;">Referencia</p>
                  <p style="font-size: 15px; font-weight: bold; color: #1a1a2e; margin-top: 0;">${order.reference}</p>

                  <!-- Items table -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f0f0f0;">
                        <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #555;">Producto</th>
                        <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #555;">Cantidad</th>
                        <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #555;">Precio unit.</th>
                        <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #555;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRows}
                    </tbody>
                  </table>

                  <!-- Total -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                    <tr>
                      <td style="text-align: right; font-size: 17px; font-weight: bold; color: #1a1a2e; padding: 12px 0;">
                        Total: $${order.total.toLocaleString('es-CO')} COP
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 14px; color: #777; margin-top: 32px;">Si tienes alguna pregunta, responde a este correo y con gusto te ayudamos.</p>
                  <p style="font-size: 14px; color: #333;">¡Gracias por tu compra!</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 16px 32px; text-align: center; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #aaa; margin: 0;">Este correo fue enviado automáticamente, por favor no lo respondas directamente.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const sendOrderConfirmationEmail = async({ order, details }) => {
  try {
    const result = await resend.emails.send({
      from: `Bingo <${RESEND_EMAIL}>`,
      to: order.email,
      subject: `¡Compra confirmada! Orden ${order.reference}`,
      html: buildOrderConfirmationHtml({ order, details })
    });

    log(`Correo de confirmación enviado a ${order.email} para la orden ${order.reference}`);
    log('Resend response:', JSON.stringify(result));
  } catch (error) {
    errorLog('Error al enviar correo de confirmación:', error?.message ?? error);
    errorLog('Detalle Resend:', JSON.stringify(error));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DIRECTORIO COMERCIAL (emprendimientos)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIA_LABEL = {
  moda: 'Moda y accesorios',
  belleza: 'Belleza y bienestar',
  hogar: 'Hogar y decoración',
  gastronomia: 'Gastronomía',
  arte: 'Arte y diseño',
  tecnologia: 'Tecnología',
  educacion: 'Educación',
  salud: 'Salud',
  mascotas: 'Mascotas',
  servicios: 'Servicios profesionales',
  deportes: 'Deportes',
  infantil: 'Infantil',
  sostenibilidad: 'Sostenibilidad y manejo ambiental',
  eventos: 'Producción de eventos',
  otro: 'Otro'
};

const RELACION_LABEL = { padre: 'Papá/mamá', egresado: 'Egresado', estudiante: 'Estudiante', staff: 'Staff' };

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const categoriasTexto = (e) => (e.categorias ?? [])
  .map((c) => (c === 'otro' && e.categoria_otro ? `Otro: ${e.categoria_otro}` : CATEGORIA_LABEL[c] || c))
  .join(', ');

const infoRow = (label, value) => value ? `
  <tr>
    <td style="padding: 6px 12px; font-size: 13px; color: #888; vertical-align: top; width: 40%;">${label}</td>
    <td style="padding: 6px 12px; font-size: 14px; color: #333;">${escapeHtml(value)}</td>
  </tr>` : '';

/**
 * Plantilla base con encabezado de la Fundación.
 * @param {object} p
 * @param {string} p.title    - Título de la franja azul
 * @param {string} p.bodyHtml - Contenido ya escapado
 */
const buildEmprendimientoLayout = ({ title, bodyHtml }) => `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #ffffff; padding: 24px 32px; text-align: center; border-bottom: 1px solid #eee;">
                <img src="https://res.cloudinary.com/dsgd6xc37/image/upload/v1773274793/logo-col_afn3xn.png" alt="Fundación The Columbus School" style="max-width: 220px; height: auto;" />
              </td>
            </tr>
            <tr>
              <td style="background-color: #003087; padding: 24px 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background-color: #f9f9f9; padding: 16px 32px; text-align: center; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #aaa; margin: 0;">Este correo fue enviado automáticamente, por favor no lo respondas directamente.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

const resumenEmprendimiento = (e) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; border: 1px solid #eee; border-radius: 6px;">
    ${infoRow('Emprendimiento', e.nombre_emprendimiento)}
    ${infoRow('Representante', e.nombre_representante)}
    ${infoRow('Relación con TCS', (e.relacion_tcs ?? []).map((r) => RELACION_LABEL[r] || r).join(', '))}
    ${infoRow('Categorías', categoriasTexto(e))}
    ${infoRow('Correo de la marca', e.email)}
    ${infoRow('Contacto de la marca', e.telefono_marca ? `+${e.telefono_marca}` : '')}
    ${infoRow('Contacto personal', e.telefono_personal ? `+${e.telefono_personal}` : '')}
    ${infoRow('Red social', e.red_social ? `@${e.red_social}` : '')}
    ${infoRow('Web / portafolio', e.web)}
    ${infoRow('Punto físico', e.punto_fisico)}
    ${infoRow('Envíos', e.envios)}
    ${infoRow('Beneficio TCS', e.beneficio_tcs ? (e.beneficio_descripcion || 'Sí') : 'No')}
    ${infoRow('Historia', e.historia)}
    ${infoRow('Productos / servicios', e.descripcion)}
  </table>
`;

const sendEmail = async({ to, subject, html, tag }) => {
  try {
    const result = await resend.emails.send({
      from: `Fundación The Columbus School <${RESEND_EMAIL}>`,
      to,
      subject,
      html
    });
    if (result?.error) {
      errorLog(`Resend rechazó el correo "${tag}" a ${to}:`, JSON.stringify(result.error));
      return;
    }
    log(`Correo "${tag}" enviado a ${to}`, JSON.stringify(result?.data ?? result));
  } catch (error) {
    errorLog(`Error al enviar correo "${tag}" a ${to}:`, error?.message ?? error);
    errorLog('Detalle Resend:', JSON.stringify(error));
  }
};

/**
 * Alerta al administrador: hay un nuevo emprendimiento por aprobar.
 * @param {object} emprendimiento - registro recién creado (modelo o plain object)
 */
export const sendNewEmprendimientoAlert = async(emprendimiento) => {
  const e = typeof emprendimiento.get === 'function' ? emprendimiento.get({ plain: true }) : emprendimiento;
  const adminUrl = `${FRONTEND_URL ?? ''}/admin`;

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Hola,</p>
    <p style="font-size: 15px; color: #555;">
      <strong>${escapeHtml(e.nombre_representante)}</strong> registró el emprendimiento
      <strong>${escapeHtml(e.nombre_emprendimiento)}</strong> en el directorio comercial y está
      <strong>pendiente de aprobación</strong>.
    </p>
    ${resumenEmprendimiento(e)}
    ${e.logo ? `<p style="margin-top: 16px;"><a href="${escapeHtml(e.logo)}" style="color: #003087;">Ver logo</a></p>` : ''}
    <p style="margin-top: 24px; text-align: center;">
      <a href="${escapeHtml(adminUrl)}" style="display: inline-block; background-color: #92c83e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-weight: bold;">
        Revisar en el panel administrativo
      </a>
    </p>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Nuevo emprendimiento por aprobar: ${e.nombre_emprendimiento}`,
    html: buildEmprendimientoLayout({ title: 'Nuevo emprendimiento por aprobar', bodyHtml }),
    tag: 'nuevo emprendimiento'
  });
};

/**
 * Notifica al representante que su emprendimiento fue aprobado y publicado.
 */
export const sendEmprendimientoApprovedEmail = async(emprendimiento) => {
  const e = typeof emprendimiento.get === 'function' ? emprendimiento.get({ plain: true }) : emprendimiento;
  const detalleUrl = `${FRONTEND_URL ?? ''}/marketplace/${e.id}`;

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Hola, <strong>${escapeHtml(e.nombre_representante)}</strong></p>
    <p style="font-size: 15px; color: #555;">
      ¡Buenas noticias! Tu emprendimiento <strong>${escapeHtml(e.nombre_emprendimiento)}</strong> fue
      aprobado y ya está publicado en el directorio comercial de la comunidad Columbus.
    </p>
    <p style="margin-top: 24px; text-align: center;">
      <a href="${escapeHtml(detalleUrl)}" style="display: inline-block; background-color: #92c83e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-weight: bold;">
        Ver mi emprendimiento
      </a>
    </p>
    <p style="font-size: 14px; color: #777; margin-top: 32px;">Si necesitas actualizar tu información, responde a este correo o escríbenos a ${escapeHtml(ADMIN_EMAIL)}.</p>
    <p style="font-size: 14px; color: #333;">¡Gracias por hacer parte de nuestra comunidad!</p>
  `;

  await sendEmail({
    to: e.email,
    subject: `¡Tu emprendimiento ${e.nombre_emprendimiento} ya está publicado!`,
    html: buildEmprendimientoLayout({ title: '¡Emprendimiento aprobado!', bodyHtml }),
    tag: 'emprendimiento aprobado'
  });
};

/**
 * Notifica al representante que su emprendimiento no fue aprobado, con el motivo.
 */
export const sendEmprendimientoRejectedEmail = async(emprendimiento) => {
  const e = typeof emprendimiento.get === 'function' ? emprendimiento.get({ plain: true }) : emprendimiento;
  const registroUrl = `${FRONTEND_URL ?? ''}/marketplace/registro`;

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Hola, <strong>${escapeHtml(e.nombre_representante)}</strong></p>
    <p style="font-size: 15px; color: #555;">
      Gracias por registrar tu emprendimiento <strong>${escapeHtml(e.nombre_emprendimiento)}</strong> en el
      directorio comercial. Por ahora no pudimos aprobarlo por el siguiente motivo:
    </p>
    <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #742a2a;">
      ${escapeHtml(e.motivo_rechazo || 'No especificado')}
    </div>
    <p style="font-size: 15px; color: #555;">Puedes corregir la información y volver a registrarlo cuando quieras.</p>
    <p style="margin-top: 24px; text-align: center;">
      <a href="${escapeHtml(registroUrl)}" style="display: inline-block; background-color: #003087; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-weight: bold;">
        Registrar de nuevo
      </a>
    </p>
    <p style="font-size: 14px; color: #777; margin-top: 32px;">Si tienes dudas, escríbenos a ${escapeHtml(ADMIN_EMAIL)}.</p>
  `;

  await sendEmail({
    to: e.email,
    subject: `Sobre tu registro de ${e.nombre_emprendimiento} en el directorio comercial`,
    html: buildEmprendimientoLayout({ title: 'Registro no aprobado', bodyHtml }),
    tag: 'emprendimiento rechazado'
  });
};
