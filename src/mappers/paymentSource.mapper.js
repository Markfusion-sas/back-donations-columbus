import { PAYMENT_SOURCE_STATUS } from '#config/constants.config';

export const mapPaymentSource = ({ wompiResponse, customerData }) => {
  const { id, type, status, public_data } = wompiResponse;
  const {
    customer_email,
    password,
    name,
    last_name,
    identity_document,
    phone,
    address,
    donation_destination,
    donation_value,
    billing_frequency,
    next_billing_date,
    brand = null,
    last_four = null,
    exp_month = null,
    exp_year = null,
    card_holder = null
  } = customerData;

  return {
    wompi_source_id: id,
    customer_email,
    password,
    type,
    status: status === 'AVAILABLE' ? PAYMENT_SOURCE_STATUS.AVAILABLE : PAYMENT_SOURCE_STATUS.INACTIVE,
    name,
    last_name,
    identity_document,
    phone,
    address,
    donation_destination,
    donation_value,
    billing_frequency,
    next_billing_date,
    phone_number: public_data?.phone_number || null,
    brand,
    last_four,
    exp_month,
    exp_year,
    card_holder
  };
};
