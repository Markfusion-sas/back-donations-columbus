import assert from 'node:assert';
import { beforeEach,describe, it } from 'node:test';

import { verifyWompiChecksum } from '#middlewares/verifyWompiChecksum.middleware';
import { mockNext,mockRequest, mockResponse } from '#test/mocks/express.mock';
import { wompiChecksumMock } from '#test/mocks/wompiChecksum.mock';
import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';
import * as checksumUtil from '#utils/cheksum.util';

describe('Middleware: verifyWompiChecksum', () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest({ body: wompiTransactionMock });
    res = mockResponse();
    next = mockNext();
  });

  it('should call next() when checksum is valid', () => {
    req.body.signature.checksum = wompiChecksumMock.validChecksum;

    verifyWompiChecksum(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called');
    assert.strictEqual(res.statusCode, 0, 'Response should not be sent');
  });

  it('should respond with 403 when checksum is invalid', () => {
    
    req.body.data.transaction.status = 'DECLINED';

    verifyWompiChecksum(req, res, next);

    assert.strictEqual(res.statusCode, 403, 'Expected status code 403');
    assert.deepStrictEqual(res.jsonPayload, {
      success: false,
      message: 'Invalid checksum'
    });
  });

  it('should respond with 400 when checksum is missing', async() => {
    delete req.body.signature.checksum;

    verifyWompiChecksum(req, res, next);

    assert.strictEqual(res.statusCode, 400, 'Expected status code 400');
    assert.deepStrictEqual(res.jsonPayload, {
      success: false,
      message: 'Missing checksum',
    });
  });
  
  it('should call next(err) when an unexpected error occurs', () => {
    const originalAssignChecksum = checksumUtil.checksum.assignChecksum;
    checksumUtil.checksum.assignChecksum = () => { throw new Error('Unexpected failure'); };

    req.body.signature.checksum = wompiChecksumMock.validChecksum;

    verifyWompiChecksum(req, res, next);

    assert.strictEqual(next.wasCalled(), true, 'Expected next() to be called with error');
    const error = next.getCalls()[0];
    assert.strictEqual(error.message, 'Unexpected failure', 'Expected the thrown error to match');

    checksumUtil.checksum.assignChecksum = originalAssignChecksum;
  });
});
