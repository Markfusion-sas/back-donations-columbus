import assert from 'node:assert';
import { describe, it } from 'node:test';

import { wompiSignatureMock } from '#test/mocks/wompiSignature.mock';
import { generateWompiSignature } from '#utils/signature.util';

describe('Utils: signature.util', () => {
  const secret = 'test_secret';

  it('should generate a valid signature hash', () => {
    const signature = generateWompiSignature(wompiSignatureMock, secret);

    assert.strictEqual(typeof signature, 'string', 'Expected signature to be a string');
    assert.strictEqual(signature.length, 64, 'Expected SHA-256 hash length to be 64 characters');
  });

  it('should throw an error if required fields are missing', () => {
    const invalidMock = { reference: wompiSignatureMock.reference };

    assert.throws(
      () => generateWompiSignature(invalidMock, secret),
      { message: /Missing required parameters to generate signature/i },
      'Expected error when fields are missing'
    );
  });

  it('should generate different signatures for different inputs', () => {
    const sig1 = generateWompiSignature(wompiSignatureMock, secret);

    const alteredMock = structuredClone(wompiSignatureMock);
    alteredMock.reference = 'ORD-99999';

    const sig2 = generateWompiSignature(alteredMock, secret);

    assert.notStrictEqual(sig1, sig2, 'Expected different signatures for different references');
  });
});
