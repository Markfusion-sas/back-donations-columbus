import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';

import { paymentControllerFactory } from '#controllers/wompiTransaction.controller';
import { mockNext, mockRequest, mockResponse } from '#test/mocks/express.mock';
import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';

describe('Controller: paymentController', () => {
  let req, res, next;
  let fakeValidateChecksum, fakeSaveTransaction, paymentController;

  beforeEach(() => {
    req = mockRequest({ body: wompiTransactionMock, wompiChecksum: 'valid-checksum' });
    res = mockResponse();
    next = mockNext();

    fakeValidateChecksum = () => {};
    fakeSaveTransaction = async() => ({ id: 1, transaction_id: '0000000-0000000000-00006' });

    paymentController = paymentControllerFactory(fakeValidateChecksum, fakeSaveTransaction);
  });

  it('should return 200 and transaction data when saved successfully', async() => {
    const expectedTransaction = { id: 1, transaction_id: '0000000-0000000000-00006' };

    fakeSaveTransaction = async() => expectedTransaction;
    paymentController = paymentControllerFactory(fakeValidateChecksum, fakeSaveTransaction);

    await paymentController(req, res, next);

    assert.strictEqual(res.statusCode, 200, 'Expected status code to be 200');
    assert.deepStrictEqual(res.jsonPayload, {
      success: true,
      message: 'Transaction registered successfully',
      transaction: expectedTransaction
    });
    assert.strictEqual(next.wasCalled(), false, 'Expected next() NOT to be called');
  });

  it('should return 200 when transaction is processed but not saved', async() => {
    fakeSaveTransaction = async() => null;
    paymentController = paymentControllerFactory(fakeValidateChecksum, fakeSaveTransaction);

    await paymentController(req, res, next);

    assert.strictEqual(res.statusCode, 200, 'Expected status code to be 200');
    assert.deepStrictEqual(res.jsonPayload, {
      success: true,
      message: 'Transaction processed but not saved in DB',
      transaction: null
    });
    assert.strictEqual(next.wasCalled(), false, 'Expected next() NOT to be called');
  });

  it('should call next(error) when checksum validation fails', async() => {
    const error = new Error('Invalid checksum');
    fakeValidateChecksum = () => { throw error; };
    paymentController = paymentControllerFactory(fakeValidateChecksum, fakeSaveTransaction);

    await paymentController(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called');
    assert.strictEqual(next.getCalls()[0], error, 'Expected next to receive the checksum error');
  });

  it('should call next(error) when saveTransaction throws an unexpected error', async() => {
    const error = new Error('Database unavailable');
    fakeSaveTransaction = async() => { throw error; };
    paymentController = paymentControllerFactory(fakeValidateChecksum, fakeSaveTransaction);

    await paymentController(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called');
    assert.strictEqual(next.getCalls()[0], error, 'Expected next to receive the DB error');
  });
});
