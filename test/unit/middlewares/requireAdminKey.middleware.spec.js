import assert from 'node:assert';
import { describe, it } from 'node:test';

import { mockNext, mockRequest, mockResponse } from '#test/mocks/express.mock';

// ADMIN_API_KEY se lee al importar el módulo; se fija antes del import dinámico.
process.env.ADMIN_API_KEY = 'clave-secreta';
const { requireAdminKey } = await import('#middlewares/requireAdminKey.middleware');

describe('Middleware: requireAdminKey', () => {
  it('should pass when the x-admin-key header matches', () => {
    const req = mockRequest({ headers: { 'x-admin-key': 'clave-secreta' } });
    const next = mockNext();

    requireAdminKey(req, mockResponse(), next);

    assert.strictEqual(next.callCount(), 1);
    assert.strictEqual(next.getCalls()[0], undefined, 'Expected next() without error');
  });

  it('should reject with 401 when the header is missing or wrong', () => {
    const req = mockRequest({ headers: { 'x-admin-key': 'otra' } });
    const next = mockNext();

    requireAdminKey(req, mockResponse(), next);

    const error = next.getCalls()[0];
    assert.ok(error instanceof Error);
    assert.strictEqual(error.statusCode, 401);
  });
});
