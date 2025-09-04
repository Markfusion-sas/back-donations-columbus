import assert from 'node:assert';
import { describe, it } from 'node:test';

import { wompiChecksumMock } from '#test/mocks/wompiChecksum.mock';
import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';
import { validateChecksum } from '#utils/validateCheksum.util';

describe('Utils: validateCheksum.util', () => {

  it('should NOT throw an error when checksum is valid', () => {
    assert.doesNotThrow(
      () => validateChecksum(wompiTransactionMock, wompiChecksumMock.validChecksum),
      'Expected checksum to be valid'
    );
  });
  
  it('should throw an error when checksum does not match', () => {
    assert.throws(
      () => validateChecksum(wompiTransactionMock, wompiChecksumMock.invalidChecksum),
      { message: /The request does not meet security standards/i },
      'Expected an error when checksum does not match'
    );
  });

  it('should throw an error when checksum is missing', () => {
    const alteredMock = structuredClone(wompiTransactionMock);
    delete alteredMock.signature.checksum;

    assert.throws(
      () => validateChecksum(alteredMock, wompiChecksumMock.validChecksum),
      { message: /The request does not meet security standards/i },
      'Expected an error when checksum is missing'
    );
  });

  it('should throw an error when response checksum is missing', () => {
    assert.throws(
      () => validateChecksum(wompiTransactionMock, undefined),
      { message: /The request does not meet security standards/i },
      'Expected an error when response checksum is missing'
    );
  });
});
