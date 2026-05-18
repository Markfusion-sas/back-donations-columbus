import { PAYMENT_SOURCE_STATUS } from '#config/constants.config';

export const mapPaymentSource = ({ wompiResponse, customerData }) => {
  const { id, type, status, public_data } = wompiResponse;

  return {
    wompi_source_id: id,
    customer_email: customerData.customer_email,
    type,
    status: status === 'AVAILABLE' ? PAYMENT_SOURCE_STATUS.AVAILABLE : PAYMENT_SOURCE_STATUS.INACTIVE,
    phone_number: public_data?.phone_number || null,
    brand: customerData.brand || null,
    last_four: customerData.last_four || null,
    exp_month: customerData.exp_month || null,
    exp_year: customerData.exp_year || null,
    card_holder: customerData.card_holder || null
  };
};
