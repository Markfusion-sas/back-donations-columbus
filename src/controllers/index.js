import { donationControllerFactory } from '#controllers/donation.controller';
import { emprendimientoControllerFactory } from '#controllers/emprendimiento.controller';
import { orderControllerFactory } from '#controllers/order.controller';
import { paymentSourceControllerFactory } from '#controllers/paymentSource.controller';
import { productControllerFactory } from '#controllers/product.controller';
import { siteContentControllerFactory } from '#controllers/siteContent.controller';
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
export const paymentSourceController = paymentSourceControllerFactory();
export const emprendimientoController = emprendimientoControllerFactory();
export const siteContentController = siteContentControllerFactory();
