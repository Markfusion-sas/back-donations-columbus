import assert from 'node:assert';
import { beforeEach,describe, it } from 'node:test';

import { wompiTransactionServiceFactory } from '#services/wompiTransaction.service';
import { wompiTransactionMock } from '#test/mocks/wompiTransaction.mock';

describe('Service: wompiTransactionService', () => {
  let fakeTransactionModel;
  let fakeMapper;
  let service;

  beforeEach(() => {
    
    fakeTransactionModel = {
      findOrCreate: async() => [{}]
    };

    fakeMapper = () => wompiTransactionMock.data.transaction;

    service = wompiTransactionServiceFactory({
      Transaction: fakeTransactionModel,
      mapWompiTransaction: fakeMapper
    });
  });

  it('should save a new transaction successfully', async() => {
    const fakeTransaction = { id: 1, transaction_id: '0000000-0000000000-00006' };

    fakeTransactionModel.findOrCreate = async() => [fakeTransaction, true];

    const result = await service.saveWompiTransaction(wompiTransactionMock.data.transaction);

    assert.deepStrictEqual(result, fakeTransaction, 'Expected transaction to be saved');
  });

  it('should return the existing transaction when it already exists', async() => {
    const existingTransaction = { id: 2, transaction_id: '0000000-0000000000-00006' };

    fakeTransactionModel.findOrCreate = async() => [existingTransaction, false];

    const result = await service.saveWompiTransaction(wompiTransactionMock.data.transaction);

    assert.deepStrictEqual(result, existingTransaction, 'Expected to return existing transaction');
  });

  it('should return null when database throws an error', async() => {
    fakeTransactionModel.findOrCreate = async() => {
      throw new Error('DB failure');
    };

    const result = await service.saveWompiTransaction(wompiTransactionMock.data.transaction);

    assert.strictEqual(result, null, 'Expected null when DB fails');
  });

  it('should call mapWompiTransaction with the original wompiData', async() => {
    let calledWithData = null;

    fakeMapper = (data) => {
      calledWithData = data;
      return wompiTransactionMock.data.transaction;
    };

    service = wompiTransactionServiceFactory({
      Transaction: fakeTransactionModel,
      mapWompiTransaction: fakeMapper
    });

    await service.saveWompiTransaction(wompiTransactionMock.data.transaction);

    assert.deepStrictEqual(
      calledWithData,
      wompiTransactionMock.data.transaction,
      'Expected mapWompiTransaction to be called with the correct wompiData'
    );
  });
});
