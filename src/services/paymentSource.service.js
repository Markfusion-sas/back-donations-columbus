import { PAYMENT_SOURCE_TYPE } from '#config/constants.config';
import { errorLog } from '#utils/logger.util';
import { createPaymentSource } from '#utils/wompiApi.util';

export const paymentSourceServiceFactory = ({ PaymentSource, mapPaymentSource }) => {

  const registerNequi = async ({ token, customer_email, acceptance_token, accept_personal_auth }) => {
    const wompiResponse = await createPaymentSource({
      type: PAYMENT_SOURCE_TYPE.NEQUI,
      token,
      customer_email,
      acceptance_token,
      accept_personal_auth
    });

    const dbData = mapPaymentSource({
      wompiResponse,
      customerData: { customer_email }
    });

    try {
      const paymentSource = await PaymentSource.create(dbData);
      return paymentSource;
    } catch (error) {
      errorLog('Error al guardar fuente de pago Nequi en DB:', error);
      throw error;
    }
  };

  return { registerNequi };

};
