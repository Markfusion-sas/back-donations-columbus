import assert from 'node:assert';
import { beforeEach,describe, it } from 'node:test';

import { validateRequestBody } from '#middlewares/validateRequestBody.middleware';
import { mockNext,mockRequest, mockResponse } from '#test/mocks/express.mock';
import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';

describe('Middleware: validateRequestBody', () => {
  let req, res, next;

  const assertValidationError = (expectedMessage) => {
    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called with error');
    const error = next.getCalls()[0];
    assert.strictEqual(error.statusCode, 400, 'Expected error status code to be 400');
    assert.match(error.message, expectedMessage, 'Expected correct error message');
  };
  beforeEach(() => {
    req = mockRequest({ body: { ...wompiTransactionMock } });
    res = mockResponse();
    next = mockNext();
  });

  it('should call next() when the request body is valid', () => {
    validateRequestBody(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called');
    assert.strictEqual(next.getCalls().length, 1, 'Expected next() to be called once');
  });

  it('should call next(error) when event is missing', () => {
    delete req.body.event;

    validateRequestBody(req, res, next);

    assertValidationError(/'event' and 'status' are required fields/i);
   
  });

  it('should call next(error) when transaction status is missing', () => {
    delete req.body.data.transaction.status;

    validateRequestBody(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called with error');
    const error = next.getCalls()[0];
    assert.strictEqual(error.statusCode, 400, 'Expected error status code to be 400');
   
  });

  it('should handle missing data.transaction gracefully', () => {
    delete req.body.data.transaction;

    validateRequestBody(req, res, next);

    assertValidationError(/'event' and 'status' are required fields/i);
   
  });
});
