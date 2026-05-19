export const mapWompiTransaction = (wompiData = {}) => {
  const {
    id,
    transaction_type,
    reference,
    amount_in_cents = 0,
    currency,
    payment_method_type = null,
    status,
    customer_email = null,
    redirect_url = null,
    payment_method = {},
    customer_data
  } = wompiData;

  return {
    transaction_id: id || null,
    transaction_type: transaction_type || null,
    reference: reference || null,
    amount_in_cents: Math.round(amount_in_cents / 100),
    currency: currency || null,
    payment_method_type,
    brand: payment_method.brand || null,
    last_four: payment_method.last_four || null,
    status: status || null,
    customer_email,
    full_name: customer_data?.full_name || null,
    phone_number: customer_data?.phone_number || null,
    legal_id: payment_method.user_legal_id || null,
    legal_id_type: payment_method.user_legal_id_type || null,
    redirect_url
  };
};
