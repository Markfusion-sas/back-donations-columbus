import { Resend } from 'resend';

import { RESEND_API_KEY, RESEND_EMAIL } from '#config/environment.config';
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
