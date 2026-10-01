import { readFile } from 'fs/promises';

import { ADMIN_EMAIL, FRONTEND_URL } from '#config/environment.config';
import { errorLog, log } from '#utils/logger.util';
import { deliverMail } from '#utils/mailer.util';

// FRONTEND_URL puede traer varios orígenes separados por coma (CORS); los
// enlaces de los correos usan el primero
const SITE_URL = String(FRONTEND_URL ?? '').split(',')[0].trim().replace(/\/$/, '');

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
    const result = await deliverMail({
      fromName: 'Bingo',
      to: order.email,
      subject: `¡Compra confirmada! Orden ${order.reference}`,
      html: buildOrderConfirmationHtml({ order, details })
    });

    log(`Correo de confirmación enviado a ${order.email} para la orden ${order.reference}`, result.id);
  } catch (error) {
    errorLog('Error al enviar correo de confirmación:', error?.message ?? error);
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

const VERIFICACION_LABEL = {
  verificado: 'Verificado en la base del colegio',
  revisar: 'Revisar manualmente',
  no_encontrado: 'No aparece en la base del colegio',
  pendiente: 'Sin verificar (no se pudo consultar la base)'
};

const FRECUENCIA_LABEL = { weekly: 'semanal', biweekly: 'quincenal', monthly: 'mensual' };

const donacionTexto = (fuentePago) => {
  if (!fuentePago) return '';
  const f = typeof fuentePago.get === 'function' ? fuentePago.get({ plain: true }) : fuentePago;
  const valor = `$${Number(f.donation_value ?? 0).toLocaleString('es-CO')} COP`;
  const frecuencia = FRECUENCIA_LABEL[f.billing_frequency] || f.billing_frequency;
  const metodo = f.type === 'CARD' ? `tarjeta ${f.brand ?? ''} •••• ${f.last_four ?? ''}`.trim() : 'Nequi';
  const donante = [f.name, f.last_name].filter(Boolean).join(' ');
  return `${valor} ${frecuencia} · ${metodo} · ${donante}`;
};

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
    ${infoRow('Cédula', e.cedula)}
    ${infoRow('Código de familia', e.codigo_familia)}
    ${infoRow('Grado', e.grado)}
    ${infoRow('Categorías', categoriasTexto(e))}
    ${infoRow('Correo de la marca', e.email)}
    ${infoRow('Contacto de la marca', e.telefono_marca ? `+${e.telefono_marca}` : '')}
    ${infoRow('Contacto personal', e.telefono_personal ? `+${e.telefono_personal}` : '')}
    ${infoRow('Red social', e.red_social ? `@${e.red_social}` : '')}
    ${infoRow('Web / portafolio', e.web)}
    ${infoRow('Punto físico', e.punto_fisico)}
    ${infoRow('Horario', e.horario)}
    ${infoRow('Envíos', e.envios)}
    ${infoRow('Beneficio TCS', e.beneficio_tcs ? (e.beneficio_descripcion || 'Sí') : 'No')}
    ${infoRow('Cómo se hace efectivo', e.beneficio_como)}
    ${infoRow('Condiciones', (e.beneficio_condiciones ?? []).join(', '))}
    ${infoRow('Detalle de condiciones', e.beneficio_condiciones_detalle)}
    ${infoRow('Historia', e.historia)}
    ${infoRow('Productos / servicios', e.descripcion)}
  </table>
`;

const sendEmail = async({ to, subject, html, tag, attachments }) => {
  try {
    const result = await deliverMail({
      fromName: 'Fundación The Columbus School',
      to,
      subject,
      html,
      attachments
    });
    log(`Correo "${tag}" enviado a ${to}`, result.id);
  } catch (error) {
    errorLog(`Error al enviar correo "${tag}" a ${to}:`, error?.message ?? error);
  }
};

/**
 * Alerta al administrador: hay un nuevo emprendimiento por aprobar.
 * @param {object} emprendimiento - registro recién creado (modelo o plain object)
 * @param {object} [fuentePago]   - donación recurrente registrada con el formulario
 */
export const sendNewEmprendimientoAlert = async(emprendimiento, fuentePago) => {
  const e = typeof emprendimiento.get === 'function' ? emprendimiento.get({ plain: true }) : emprendimiento;
  const adminUrl = `${SITE_URL}/admin?tab=emprendimientos`;

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Hola,</p>
    <p style="font-size: 15px; color: #555;">
      <strong>${escapeHtml(e.nombre_representante)}</strong> registró el emprendimiento
      <strong>${escapeHtml(e.nombre_emprendimiento)}</strong> en el directorio comercial y está
      <strong>pendiente de aprobación</strong>.
    </p>
    ${e.verificacion_comunidad === 'verificado' ? `
    <div style="background-color: #f1f8e9; border-left: 4px solid #92c83e; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #33691e;">
      <strong>${VERIFICACION_LABEL.verificado}.</strong><br />
      Cédula: ${escapeHtml(e.cedula || '')}${e.codigo_familia ? ` · Código de familia: ${escapeHtml(e.codigo_familia)}` : ''}.
    </div>` : `
    <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #742a2a;">
      <strong>⚠ ${escapeHtml(VERIFICACION_LABEL[e.verificacion_comunidad] || 'Verificar manualmente')}.</strong><br />
      ${escapeHtml(e.verificacion_detalle || 'Confirma con la base de datos del colegio antes de aprobar o rechazar.')}<br />
      Cédula: ${escapeHtml(e.cedula || 'no registrada')}${e.codigo_familia ? ` · Código de familia: ${escapeHtml(e.codigo_familia)}` : ''}.
    </div>`}
    ${fuentePago ? `
    <div style="background-color: #f1f8e9; border-left: 4px solid #92c83e; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #33691e;">
      <strong>Donación recurrente registrada:</strong> ${escapeHtml(donacionTexto(fuentePago))}
    </div>` : ''}
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
    subject: `${e.verificacion_comunidad === 'verificado' ? '' : '⚠ Revisar · '}Nuevo emprendimiento por aprobar: ${e.nombre_emprendimiento}`,
    html: buildEmprendimientoLayout({ title: 'Nuevo emprendimiento por aprobar', bodyHtml }),
    tag: 'nuevo emprendimiento'
  });
};

/**
 * Notifica al representante que su emprendimiento fue aprobado y publicado.
 * Texto definido por la Fundación (revisión 30/09/2026).
 */
export const sendEmprendimientoApprovedEmail = async(emprendimiento) => {
  const e = typeof emprendimiento.get === 'function' ? emprendimiento.get({ plain: true }) : emprendimiento;
  const detalleUrl = `${SITE_URL}/directoriocomercial/${e.id}`;
  const directorioUrl = `${SITE_URL}/directoriocomercial`;
  const link = (url) => `<a href="${escapeHtml(url)}" style="color: #003087; font-weight: bold;">${escapeHtml(url)}</a>`;

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Hola, <strong>${escapeHtml(e.nombre_representante)}</strong>:</p>
    <p style="font-size: 15px; color: #555;">
      ¡Es un gusto saludarte! Nos alegra informarte que la solicitud de <strong>${escapeHtml(e.nombre_emprendimiento)}</strong>
      ha sido aprobada para formar parte de nuestro Directorio Comercial TCS.
    </p>
    <p style="font-size: 15px; color: #555; margin-bottom: 4px;">Aquí tienes los enlaces clave:</p>
    <ul style="font-size: 15px; color: #555; margin-top: 4px;">
      <li>Perfil de tu marca: ${link(detalleUrl)}</li>
      <li>Directorio general: ${link(directorioUrl)}</li>
    </ul>
    <p style="font-size: 15px; color: #555;">
      Te invitamos a compartir este directorio con toda tu comunidad TCS, queremos llegar a más personas y
      seguir tejiendo una red colaborativa entre todos.
    </p>
    <p style="font-size: 15px; color: #333; margin-top: 24px;">Un abrazo,<br />Fundación The Columbus School y Asopaf</p>
  `;

  await sendEmail({
    to: e.email,
    subject: `¡Bienvenidos! La participación de ${e.nombre_emprendimiento} ya está aprobada 🎉`,
    html: buildEmprendimientoLayout({ title: '¡Bienvenidos al Directorio Comercial TCS!', bodyHtml }),
    tag: 'emprendimiento aprobado'
  });
};

/**
 * Notifica al representante que su emprendimiento no fue aprobado, con el motivo.
 */
export const sendEmprendimientoRejectedEmail = async(emprendimiento) => {
  const e = typeof emprendimiento.get === 'function' ? emprendimiento.get({ plain: true }) : emprendimiento;
  const registroUrl = `${SITE_URL}/directoriocomercial/registro`;

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

// ─────────────────────────────────────────────────────────────────────────────
//  CERTIFICADO DE DONACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Alerta al administrador: un donante solicitó certificado de donación.
 * Adjunta la cédula / RUT que subió.
 * @param {object} certificado - registro creado (modelo o plain object)
 * @param {string} [documentoPath] - ruta local del archivo para adjuntarlo
 */
export const sendDonationCertificateAlert = async(certificado, documentoPath) => {
  const c = typeof certificado.get === 'function' ? certificado.get({ plain: true }) : certificado;
  const monto = c.donation_value ? `$${Number(c.donation_value).toLocaleString('es-CO')} COP` : '';

  const bodyHtml = `
    <p style="font-size: 16px; color: #333;">Hola,</p>
    <p style="font-size: 15px; color: #555;">
      <strong>${escapeHtml(c.name)} ${escapeHtml(c.last_name)}</strong> solicitó un
      <strong>certificado de donación</strong> desde el formulario de la página. Adjuntamos el documento que subió.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; border: 1px solid #eee; border-radius: 6px;">
      ${infoRow('Nombre', `${c.name} ${c.last_name}`)}
      ${infoRow('Documento de identidad', c.identity_document)}
      ${infoRow('Correo', c.email)}
      ${infoRow('Teléfono', c.phone)}
      ${infoRow('Monto de la donación', monto)}
      ${infoRow('Destino', c.donation_destination)}
      ${infoRow('Referencia de la donación', c.donation_reference || 'Pendiente (aún no ha pagado)')}
      ${infoRow('Archivo', c.documento_nombre)}
    </table>
    <p style="margin-top: 16px;">
      <a href="${escapeHtml(c.documento_url)}" style="color: #003087;">Ver / descargar documento</a>
    </p>
    <p style="font-size: 14px; color: #777; margin-top: 24px;">
      Recuerda verificar en el panel administrativo que la donación haya sido aprobada antes de emitir el certificado.
    </p>
  `;

  let attachments;
  if (documentoPath) {
    try {
      attachments = [{ filename: c.documento_nombre || 'documento', content: await readFile(documentoPath) }];
    } catch (error) {
      errorLog('No se pudo leer el documento para adjuntarlo:', error?.message ?? error);
    }
  }

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Solicitud de certificado de donación: ${c.name} ${c.last_name}`,
    html: buildEmprendimientoLayout({ title: 'Solicitud de certificado de donación', bodyHtml }),
    tag: 'certificado de donación',
    attachments
  });
};
