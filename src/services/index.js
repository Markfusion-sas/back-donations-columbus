import { mapDonation } from '#mappers/donation.mapper';
import { mapWompiTransaction } from '#mappers/wompiTransaction.mapper';
import { Donation } from '#models/donation.model';
import { Transaction } from '#models/transaction.model';
import { errorLog,log } from '#utils/logger.util';

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
