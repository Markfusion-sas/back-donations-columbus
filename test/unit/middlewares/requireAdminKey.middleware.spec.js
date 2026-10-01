import assert from 'node:assert';
import { describe, it } from 'node:test';

import { mockNext, mockRequest, mockResponse } from '#test/mocks/express.mock';

// ADMIN_PASSWORD se lee al importar los módulos; se fija antes del import dinámico.
process.env.ADMIN_PASSWORD = 'clave-del-panel';
const { requireAdminKey } = await import('#middlewares/requireAdminKey.middleware');
const { checkAdminPassword, createAdminToken, verifyAdminToken } = await import('#utils/adminToken.util');

describe('Middleware: requireAdminKey (sesión del panel)', () => {
  it('should check the password in constant time', () => {
    assert.strictEqual(checkAdminPassword('clave-del-panel'), true);
    assert.strictEqual(checkAdminPassword('otra'), false);
    assert.strictEqual(checkAdminPassword(undefined), false);
  });

  it('should pass with a valid Bearer token', () => {
    const { token } = createAdminToken();
    const next = mockNext();

    requireAdminKey(mockRequest({ headers: { authorization: `Bearer ${token}` } }), mockResponse(), next);

    assert.strictEqual(next.getCalls()[0], undefined, 'Expected next() without error');
  });

  it('should reject a missing, tampered or expired token with 401', () => {
    const { token } = createAdminToken();
    const vencido = createAdminToken(Date.now() - 9 * 60 * 60 * 1000).token;

    for (const authorization of [undefined, 'Bearer x.y', `Bearer ${token}a`, `Bearer ${vencido}`]) {
      const next = mockNext();
      requireAdminKey(mockRequest({ headers: authorization ? { authorization } : {} }), mockResponse(), next);
      const error = next.getCalls()[0];
      assert.ok(error instanceof Error, `Expected 401 for ${authorization}`);
      assert.strictEqual(error.statusCode, 401);
    }
    assert.strictEqual(verifyAdminToken(token), true);
  });

  it('should no longer accept the old x-admin-key header', () => {
    const next = mockNext();
    requireAdminKey(mockRequest({ headers: { 'x-admin-key': 'clave-del-panel' } }), mockResponse(), next);
    assert.strictEqual(next.getCalls()[0].statusCode, 401);
  });
});
