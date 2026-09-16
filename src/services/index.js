import { unlink } from 'fs/promises';
import { join } from 'path';

import { UPLOADS_DIR } from '#config/environment.config';
import { mapDonation } from '#mappers/donation.mapper';
import { mapEmprendimientoResponse } from '#mappers/emprendimiento.mapper';
import { mapOrder } from '#mappers/order.mapper';
import { mapOrderDetail } from '#mappers/orderDetail.mapper';
import { mapPaymentSource } from '#mappers/paymentSource.mapper';
import { mapProduct } from '#mappers/product.mapper';
import { mapWompiTransaction } from '#mappers/wompiTransaction.mapper';
import { Donation } from '#models/donation.model';
import { DonationCertificate } from '#models/donationCertificate.model';
import { Emprendimiento } from '#models/emprendimiento.model';
import { Order } from '#models/order.model';
import { OrderDetail } from '#models/orderDetail.model';
import { PaymentSource } from '#models/paymentSource.model';
import { Product } from '#models/product.model';
import { ProductVariant } from '#models/productVariant.model';
import { RecurringCharge } from '#models/recurringCharge.model';
import { Transaction } from '#models/transaction.model';
import { errorLog, log } from '#utils/logger.util';

import { donationServiceFactory } from './donation.service.js';
import { donationCertificateServiceFactory } from './donationCertificate.service.js';
import {
  sendDonationCertificateAlert,
  sendEmprendimientoApprovedEmail,
  sendEmprendimientoRejectedEmail,
  sendNewEmprendimientoAlert
} from './email.service.js';
import { emprendimientoServiceFactory } from './emprendimiento.service.js';
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

// Borra archivos de /api/v1/uploads/... que ya no usa ningún registro
const removeUploadedFiles = async(urls = []) => {
  await Promise.all(urls.map(async(url) => {
    const match = /\/api\/v1\/uploads\/([\w-]+\/[\w.-]+)$/.exec(url ?? '');
    if (!match) return;
    try {
      await unlink(join(UPLOADS_DIR, match[1]));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }));
};

export const emprendimientoService = emprendimientoServiceFactory({
  Emprendimiento,
  mapEmprendimientoResponse,
  removeFiles: removeUploadedFiles,
  notifyNewEmprendimiento: sendNewEmprendimientoAlert,
  notifyApproved: sendEmprendimientoApprovedEmail,
  notifyRejected: sendEmprendimientoRejectedEmail,
  errorLog
});

export const donationCertificateService = donationCertificateServiceFactory({
  DonationCertificate,
  notifyAdmin: sendDonationCertificateAlert,
  errorLog
});
