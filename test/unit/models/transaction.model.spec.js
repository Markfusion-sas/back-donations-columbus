import assert from 'node:assert';
import { describe, it } from 'node:test';

import { Transaction } from '#models/transaction.model';

describe('Model: Transaction', () => {
  it('should have all required properties defined', () => {
    const attributes = Transaction.getAttributes();

    const requiredFields = [
      'id',
      'transaction_id',
      'reference',
      'amount_in_cents',
      'currency',
      'payment_method_type',
      'status'
    ];

    requiredFields.forEach(field => {
      assert.ok(attributes[field], `Expected ${field} to be defined`);

      if (field !== 'id') {
        assert.strictEqual(
          attributes[field].allowNull,
          false,
          `Expected ${field} to be NOT NULL`
        );
      }
    });
  });

  it('should define optional fields with allowNull true', () => {
    const attributes = Transaction.getAttributes();

    const optionalFields = [
      'brand',
      'last_four',
      'customer_email',
      'full_name',
      'phone_number',
      'legal_id',
      'legal_id_type',
      'redirect_url'
    ];

    optionalFields.forEach(field => {
      assert.ok(attributes[field], `Expected ${field} to exist`);
      assert.strictEqual(attributes[field].allowNull, true, `Expected ${field} to allow NULL`);
    });
  });

  it('should validate email format for customer_email', async() => {
    try {
      await Transaction.build({
        transaction_id: 'T-001',
        reference: 'REF-123',
        amount_in_cents: 500000,
        currency: 'COP',
        payment_method_type: 'CARD',
        status: 'APPROVED',
        customer_email: 'invalid-email'
      }).validate();
      assert.fail('Expected validation to fail for invalid email');
    } catch (error) {
      assert.match(error.message, /Validation error/, 'Expected Sequelize validation error');
    }
  });

  it('should correctly build a valid transaction', () => {
    const data = {
      transaction_id: 'TX-999',
      reference: 'ORD-456',
      amount_in_cents: 120000,
      currency: 'COP',
      payment_method_type: 'NEQUI',
      status: 'PENDING',
      customer_email: 'cliente@test.com',
      full_name: 'Mauricio López',
      last_four: '1234'
    };

    const transaction = Transaction.build(data);

    Object.keys(data).forEach(key => {
      assert.strictEqual(transaction[key], data[key], `Expected ${key} to match`);
    });
  });

  it('should limit last_four field to 4 characters', () => {
    const attributes = Transaction.getAttributes();
    assert.strictEqual(attributes.last_four.type.options.length, 4, 'Expected last_four to be VARCHAR(4)');
  });

});
