import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';

import { signatureControllerFactory } from '#controllers/wompiSignature.controller';
import { mockNext,mockRequest, mockResponse } from '#test/mocks/express.mock';
import { wompiSignatureMock } from '#test/mocks/wompiSignature.mock';

describe('Controller: signatureController', () => {
  let req, res, next;
  let fakeSignatureUtil;
  let signatureController;

  beforeEach(() => {
    req = mockRequest({ body: wompiSignatureMock });
    res = mockResponse();
    next = mockNext();

    fakeSignatureUtil = ({ reference, amount_in_cents, currency }) =>
      `SIGNATURE-${reference}-${amount_in_cents}-${currency}`;

    signatureController = signatureControllerFactory(fakeSignatureUtil);
  });

  it('should generate a signature and return 200 with expected response', () => {
    signatureController(req, res, next);

    const expectedSignature = `SIGNATURE-${wompiSignatureMock.reference}-${wompiSignatureMock.amount_in_cents}-${wompiSignatureMock.currency}`;

    assert.strictEqual(res.statusCode, 200, 'Expected status code to be 200');
    assert.deepStrictEqual(res.jsonPayload, {
      success: true,
      data: {
        ...wompiSignatureMock,
        signature: expectedSignature
      }
    });
    assert.strictEqual(next.wasCalled(), false, 'Expected next() NOT to be called');
  });

  it('should call next(error) when signatureUtil throws an error', () => {
    const error = new Error('Signature generation failed');
    fakeSignatureUtil = () => { throw error; };

    signatureController = signatureControllerFactory(fakeSignatureUtil);
    signatureController(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called');
    assert.strictEqual(next.getCalls()[0], error, 'Expected next() to receive the thrown error');
  });

  it('should generate signature even if optional fields are missing', () => {
    const partialMock = {
      reference: 'ORD-5678',
      amount_in_cents: 250000,
      currency: 'USD'
    };

    req = mockRequest({ body: partialMock });
    res = mockResponse();

    signatureController(req, res, next);

    const expectedSignature = `SIGNATURE-${partialMock.reference}-${partialMock.amount_in_cents}-${partialMock.currency}`;

    assert.strictEqual(res.statusCode, 200, 'Expected status code to be 200');
    assert.deepStrictEqual(res.jsonPayload, {
      success: true,
      data: {
        ...partialMock,
        signature: expectedSignature
      }
    });
    assert.strictEqual(next.wasCalled(), false, 'Expected next() NOT to be called');
  });
});
