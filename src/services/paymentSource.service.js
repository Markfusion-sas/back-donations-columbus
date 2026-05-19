import bcrypt from 'bcrypt';

import { PAYMENT_SOURCE_STATUS, PAYMENT_SOURCE_TYPE } from '#config/constants.config';
import { errorLog } from '#utils/logger.util';
import { createPaymentSource } from '#utils/wompiApi.util';

const SALT_ROUNDS = 10;

const calculateNextBillingDate = (frequency) => {
  const date = new Date();

  if (frequency === 'weekly') date.setDate(date.getDate() + 7);
  if (frequency === 'biweekly') date.setDate(date.getDate() + 15);
  if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);

  return date.toISOString().split('T')[0];
};

export const paymentSourceServiceFactory = ({ PaymentSource, mapPaymentSource }) => {

  const registerNequi = async ({ token, customer_email, password, acceptance_token, accept_personal_auth, name, last_name, identity_document, phone, address, donation_destination, donation_value, billing_frequency }) => {
    const wompiResponse = await createPaymentSource({
      type: PAYMENT_SOURCE_TYPE.NEQUI,
      token,
      customer_email,
      acceptance_token,
      accept_personal_auth
    });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const next_billing_date = calculateNextBillingDate(billing_frequency);

    const dbData = mapPaymentSource({
      wompiResponse,
      customerData: {
        customer_email,
        password: hashedPassword,
        name,
        last_name,
        identity_document,
        phone,
        address,
        donation_destination,
        donation_value,
        billing_frequency,
        next_billing_date
      }
    });

    try {
      const paymentSource = await PaymentSource.create(dbData);
      return paymentSource;
    } catch (error) {
      errorLog('Error al guardar fuente de pago Nequi en DB:', error);
      throw error;
    }
  };

  const verify = async ({ customer_email, password }) => {
    const paymentSource = await PaymentSource.findOne({
      where: { customer_email, status: PAYMENT_SOURCE_STATUS.AVAILABLE }
    });

    if (!paymentSource) {
      const error = new Error('No se encontró una fuente de pago activa para este correo');
      error.statusCode = 404;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(password, paymentSource.password);

    if (!passwordMatch) {
      const error = new Error('Correo o contraseña incorrectos');
      error.statusCode = 401;
      throw error;
    }

    return paymentSource;
  };

  const cancel = async (id) => {
    const paymentSource = await PaymentSource.findByPk(id);

    if (!paymentSource) {
      const error = new Error('Fuente de pago no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await paymentSource.update({ status: PAYMENT_SOURCE_STATUS.INACTIVE });
    return paymentSource;
  };

  return { registerNequi, verify, cancel };

};
