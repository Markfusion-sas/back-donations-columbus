import assert from 'node:assert';
import { beforeEach,describe, it } from 'node:test';

import { responseHandler } from '#middlewares/responseHandler.middleware';
import { mockRequest, mockResponse } from '#test/mocks/express.mock';

describe('Middleware: responseHandler', () => {
  let req, res;

  const assertStatusOK = () => {
    assert.strictEqual(res.statusCode, 200, 'Expected status code to be 200');
  };

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  it('should respond with 200 and success when res.locals.data has values', () => {
    res.locals = { data: { cliente: { id: 1, nombre: 'Mauricio' } } };

    responseHandler(req, res);

    assertStatusOK();
    assert.strictEqual(res.jsonPayload.success, true, 'Expected success to be true');
    assert.deepStrictEqual(res.jsonPayload.cliente, { id: 1, nombre: 'Mauricio' }, 'Expected cliente data to match');
  });

  it('should respond with 200 and success when res.locals.data is empty', () => {
    res.locals = { data: {} };

    responseHandler(req, res);

    assertStatusOK();
    assert.strictEqual(res.jsonPayload.success, true, 'Expected success to be true');
    assert.deepStrictEqual(res.jsonPayload, { success: true }, 'Expected only success property in response');
  });

  it('should not allow success flag from res.locals.data to override true', () => {
    res.locals = { data: { success: false, cliente: { id: 10 } } };

    responseHandler(req, res);

    assertStatusOK();
    assert.strictEqual(res.jsonPayload.success, true, 'Expected success to always be true');
    assert.deepStrictEqual(res.jsonPayload.cliente, { id: 10 }, 'Expected cliente data to remain unchanged');
  });
});
