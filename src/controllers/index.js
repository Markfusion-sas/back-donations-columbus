import { donationControllerFactory } from '#controllers/donation.controller';
import { orderControllerFactory } from '#controllers/order.controller';
import { productControllerFactory } from '#controllers/product.controller';
import { signatureControllerFactory } from '#controllers/wompiSignature.controller';
import { listTransactions, paymentControllerFactory } from '#controllers/wompiTransaction.controller';
import { wompiTransactionService } from '#services/index';
import { generateWompiSignature } from '#utils/signature.util';
import { validateChecksum } from '#utils/validateCheksum.util';

export const wompiController = paymentControllerFactory(
  validateChecksum,
  wompiTransactionService.saveWompiTransaction
);

export const wompiSignatureController = signatureControllerFactory(
  generateWompiSignature
);

export const listTransactionsController = listTransactions(
  wompiTransactionService.getAllTransactions
);

export const donationController = donationControllerFactory();
export const productController = productControllerFactory();
export const orderController = orderControllerFactory();
