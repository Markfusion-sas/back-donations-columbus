import assert from 'node:assert';
import { beforeEach,describe, it } from 'node:test';

import { validateSignatureRequest } from '#middlewares/validateSignatureRequest.middleware';
import { mockNext,mockRequest, mockResponse } from '#test/mocks/express.mock';
import { wompiSignatureMock } from '#test/mocks/wompiSignature.mock';

describe('Middleware: validateSignatureRequest', () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest({ body: { ...wompiSignatureMock } });
    res = mockResponse();
    next = mockNext();
  });

  it('should call next() when request body is valid', () => {
    validateSignatureRequest(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called');
    assert.strictEqual(res.statusCode, 0, 'Expected no response to be sent');
  });

  it('should respond with 400 when request body is invalid', () => {
    req.body = {};

    validateSignatureRequest(req, res, next);

    assert.strictEqual(res.statusCode, 400, 'Expected status 400');
    assert.strictEqual(res.jsonPayload.success, false, 'Expected success to be false');
    assert.match(
      res.jsonPayload.message,
      /reference.*required/i,
      'Expected Joi to return a message about missing fields'
    );
  });

  it('should respond with 400 when amount_in_cents is invalid', () => {
    req.body = { ...wompiSignatureMock, amount_in_cents: 'invalid' };

    validateSignatureRequest(req, res, next);

    assert.strictEqual(res.statusCode, 400, 'Expected status 400');
    assert.strictEqual(res.jsonPayload.success, false, 'Expected success to be false');
    assert.match(
      res.jsonPayload.message,
      /amount.*must be a number/i,
      'Expected Joi to validate numeric fields'
    );
  });
});
