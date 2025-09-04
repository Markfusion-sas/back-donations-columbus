import assert from 'node:assert';
import { beforeEach,describe, it } from 'node:test';

import { validateWompiStatus } from '#middlewares/validateWompiStatus.middleware';
import { mockNext,mockRequest, mockResponse } from '#test/mocks/express.mock';
import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';

describe('Middleware: validateWompiStatus', () => {
  let req, res, next;

  const expectNextCalled = () => {
    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called');
  };

  beforeEach(() => {
    req = mockRequest({ body: wompiTransactionMock });
    res = mockResponse();
    next = mockNext();
  });

  it('should call next() when transaction status is valid', () => {
    req.body.data.transaction.status = 'APPROVED';

    validateWompiStatus(req, res, next);

    expectNextCalled();
    assert.strictEqual(res.statusCode, 0, 'Expected no response to be sent');
  });

  it('should call next(error) when transaction status is invalid', () => {
    req.body.data.transaction.status = 'FAILED';

    validateWompiStatus(req, res, next);

    expectNextCalled();

    const firstCall = next.getCalls()[0];
    assert.ok(firstCall instanceof Error, 'Expected an error object to be passed to next()');
    assert.match(
      firstCall.message,
      /Transaction not approved/i,
      `Expected error message to indicate transaction was not approved, but got: ${firstCall.message}`
    );
  });

  it('should call next(error) when transaction status is missing', () => {
    delete req.body.data.transaction.status;

    validateWompiStatus(req, res, next);

    expectNextCalled();
    
    const firstCall = next.getCalls()[0];
    assert.ok(firstCall instanceof Error, 'Expected an error object to be passed to next()');
    assert.match(firstCall.message, /required|missing|status/i, 'Expected error message to indicate missing status');
  });
});
