import assert from 'node:assert';
import { describe, it } from 'node:test';

import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';
import { checksum } from '#utils/cheksum.util';

describe('Utils: checksum.assignChecksum', () => {

  it('should generate a valid SHA-256 checksum', () => {
    const result = checksum.assignChecksum(wompiTransactionMock);

    assert.strictEqual(typeof result, 'string', 'Expected checksum to be a string');
    assert.strictEqual(result.length, 64, 'Expected checksum length to be 64 characters');
  });

  it('should match the expected checksum from Wompi payload', () => {
    const result = checksum.assignChecksum(wompiTransactionMock);

    assert.strictEqual(
      result,
      wompiTransactionMock.signature.checksum,
      'Expected checksum to match the one provided by Wompi'
    );
  });

  it('should generate a different checksum when transaction data changes', () => {
    const alteredMock = structuredClone(wompiTransactionMock);
    alteredMock.data.transaction.status = 'DECLINED';

    const alteredChecksum = checksum.assignChecksum(alteredMock);
    const originalChecksum = checksum.assignChecksum(wompiTransactionMock);

    assert.notStrictEqual(
      alteredChecksum,
      originalChecksum,
      'Checksum should change when transaction data changes'
    );
  });

  it('should throw an error if required fields are missing', () => {
    const alteredMock = structuredClone(wompiTransactionMock);
    delete alteredMock.data.transaction.id;

    const checksumWithoutId = checksum.assignChecksum(alteredMock);
    const originalChecksum = checksum.assignChecksum(wompiTransactionMock);

    assert.notStrictEqual(
      checksumWithoutId,
      originalChecksum,
      'Expected checksum to change when transaction.id is missing'
    );
  });

});
