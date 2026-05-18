import axios from 'axios';

import { WOMPI_API_URL, WOMPI_PRIVATE_KEY, WOMPI_PUBLIC_KEY } from '#config/environment.config';

const wompiPrivateClient = axios.create({
  baseURL: WOMPI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`
  }
});

const wompiPublicClient = axios.create({
  baseURL: WOMPI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
  }
});

export const getAcceptanceTokens = async () => {
  const { data } = await wompiPublicClient.get(`/merchants/${WOMPI_PUBLIC_KEY}`);
  return {
    acceptance_token: data.data.presigned_acceptance.acceptance_token,
    accept_personal_auth: data.data.presigned_personal_data_auth.acceptance_token
  };
};

export const createPaymentSource = async ({ type, token, customer_email, acceptance_token, accept_personal_auth }) => {
  const { data } = await wompiPrivateClient.post('/payment_sources', {
    type,
    token,
    customer_email,
    acceptance_token,
    accept_personal_auth
  });
  return data.data;
};

export const getNequiTokenStatus = async (token_id) => {
  const { data } = await wompiPublicClient.get(`/tokens/nequi/${token_id}`);
  return data.data;
};
