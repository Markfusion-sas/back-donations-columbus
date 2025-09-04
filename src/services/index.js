import { mapWompiTransaction } from '#mappers/wompiTransaction.mapper';
import { Transaction } from '#models/transaction.model';
import { errorLog,log } from '#utils/logger.util';

import { wompiTransactionServiceFactory } from './wompiTransaction.service.js';

export const wompiTransactionService = wompiTransactionServiceFactory({
  Transaction,
  mapWompiTransaction,
  log,
  errorLog
});
