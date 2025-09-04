import assert from 'node:assert';
import { describe, it } from 'node:test';

import { mapWompiTransaction } from '#mappers/wompiTransaction.mapper';
import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';

describe('Mapper: wompiTransaction', () => {
  it('should correctly map a full Wompi transaction', () => {
    const wompiData = wompiTransactionMock.data.transaction;

    const result = mapWompiTransaction(wompiData);

    assert.deepStrictEqual(result, {
      transaction_id: wompiData.id,
      reference: wompiData.reference,
      amount_in_cents: Math.round(wompiData.amount_in_cents / 100),
      currency: wompiData.currency,
      payment_method_type: wompiData.payment_method_type,
      brand: wompiData.payment_method.brand || null,
      last_four: wompiData.payment_method.last_four || null,
      status: wompiData.status,
      customer_email: wompiData.customer_email,
      full_name: wompiData.customer_data.full_name,
      phone_number: wompiData.customer_data.phone_number,
      legal_id: wompiData.payment_method.user_legal_id,
      legal_id_type: wompiData.payment_method.user_legal_id_type,
      redirect_url: wompiData.redirect_url
    });
  });

  it('should handle missing optional fields gracefully', () => {
    const wompiData = {
      id: '123',
      reference: 'TEST-123',
      amount_in_cents: 100000,
      currency: 'COP',
      status: 'PENDING'
      // Falta: payment_method, customer_data, redirect_url, etc.
    };

    const result = mapWompiTransaction(wompiData);

    assert.deepStrictEqual(result, {
      transaction_id: wompiData.id,
      reference: wompiData.reference,
      amount_in_cents: Math.round(wompiData.amount_in_cents / 100),
      currency: wompiData.currency,
      payment_method_type: null,
      brand: null,
      last_four: null,
      status: wompiData.status,
      customer_email: null,
      full_name: null,
      phone_number: null,
      legal_id: null,
      legal_id_type: null,
      redirect_url: null
    });
  });

  it('should handle empty input without throwing', () => {
    const result = mapWompiTransaction(undefined);

    assert.deepStrictEqual(result, {
      transaction_id: null,
      reference: null,
      amount_in_cents: 0,
      currency: null,
      payment_method_type: null,
      brand: null,
      last_four: null,
      status: null,
      customer_email: null,
      full_name: null,
      phone_number: null,
      legal_id: null,
      legal_id_type: null,
      redirect_url: null
    });
  });

  it('should round amount_in_cents correctly', () => {
    const wompiData = { amount_in_cents: 12345 }; // 123.45 COP

    const result = mapWompiTransaction(wompiData);

    assert.strictEqual(result.amount_in_cents, 123, 'Expected amount to be rounded correctly');
  });
});
