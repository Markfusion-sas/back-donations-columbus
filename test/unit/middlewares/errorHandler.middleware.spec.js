import assert from 'node:assert';
import { beforeEach,describe, it } from 'node:test';

import { errorHandler } from '#middlewares/errorHandler.middleware';
import { mockNext,mockRequest, mockResponse } from '#test/mocks/express.mock';

describe('Middleware: errorHandler', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    
  });

  it('should return the provided error message and status code', () => {
    const error = new Error('Bad request');
    error.statusCode = 400;

    errorHandler(error, req, res, next);

    assert.strictEqual(res.statusCode, 400, 'Expected status code to be 400');
    assert.deepStrictEqual(res.jsonPayload, {
      success: false,
      message: 'Bad request'
    }, 'Expected correct error response');
  });

  it('should default to status 500 and internal server message if not provided', () => {
    const error = new Error();
    errorHandler(error, req, res, next);

    assert.strictEqual(res.statusCode, 500, 'Expected status code to be 500');
    assert.deepStrictEqual(res.jsonPayload, {
      success: false,
      message: 'Internal server error'
    }, 'Expected default internal server error message');
  });

  it('should default to status 500 and "Internal server error" when no message provided', () => {
    const error = new Error();
    delete error.message;

    errorHandler(error, req, res, next);

    assert.strictEqual(res.statusCode, 500);
    assert.deepStrictEqual(res.jsonPayload, {
      success: false,
      message: 'Internal server error'
    });
  });
});
