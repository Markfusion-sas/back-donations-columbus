import { mapBingoTable } from '#mappers/bingoTable.mapper';
import { mapBingoTableOrder } from '#mappers/bingoTableOrder.mapper';
import { mapDonation } from '#mappers/donation.mapper';
import { mapWompiTransaction } from '#mappers/wompiTransaction.mapper';
import { BingoTable } from '#models/bingoTable.model';
import { BingoTableOrder } from '#models/bingoTableOrder.model';
import { Donation } from '#models/donation.model';
import { Transaction } from '#models/transaction.model';
import { errorLog,log } from '#utils/logger.util';

import { bingoTableServiceFactory } from './bingoTable.service.js';
import { bingoTableOrderServiceFactory } from './bingoTableOrder.service.js';
import { donationServiceFactory } from './donation.service.js';
import { wompiTransactionServiceFactory } from './wompiTransaction.service.js';

export const wompiTransactionService = wompiTransactionServiceFactory({
  Transaction,
  mapWompiTransaction,
  log,
  errorLog
});

export const donationService = donationServiceFactory({
  Donation,
  mapDonation,
  log,
  errorLog
});

export const bingoTableService = bingoTableServiceFactory({
  BingoTable,
  mapBingoTable
});

export const bingoTableOrderService = bingoTableOrderServiceFactory({
  BingoTable,
  BingoTableOrder,
  mapBingoTableOrder
});
