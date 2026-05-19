import { mapDonation } from '#mappers/donation.mapper';
import { mapOrder } from '#mappers/order.mapper';
import { mapOrderDetail } from '#mappers/orderDetail.mapper';
import { mapPaymentSource } from '#mappers/paymentSource.mapper';
import { mapProduct } from '#mappers/product.mapper';
import { mapWompiTransaction } from '#mappers/wompiTransaction.mapper';
import { Donation } from '#models/donation.model';
import { Order } from '#models/order.model';
import { OrderDetail } from '#models/orderDetail.model';
import { PaymentSource } from '#models/paymentSource.model';
import { RecurringCharge } from '#models/recurringCharge.model';
import { Product } from '#models/product.model';
import { ProductVariant } from '#models/productVariant.model';
import { Transaction } from '#models/transaction.model';
import { errorLog, log } from '#utils/logger.util';

import { donationServiceFactory } from './donation.service.js';
import { orderServiceFactory } from './order.service.js';
import { paymentSourceServiceFactory } from './paymentSource.service.js';
import { productServiceFactory } from './product.service.js';
import { productVariantServiceFactory } from './productVariant.service.js';
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

export const productService = productServiceFactory({
  Product,
  mapProduct
});

export const productVariantService = productVariantServiceFactory({
  ProductVariant
});

export const orderService = orderServiceFactory({
  Product,
  ProductVariant,
  Order,
  OrderDetail,
  mapOrder,
  mapOrderDetail
});

export const paymentSourceService = paymentSourceServiceFactory({
  PaymentSource,
  RecurringCharge,
  mapPaymentSource
});
