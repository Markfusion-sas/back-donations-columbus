import { Worker } from 'bullmq';
import { randomUUID } from 'crypto';

import { PAYMENT_SOURCE_STATUS } from '#config/constants.config';
import { redisConnection } from '#config/redis.config';
import { RecurringCharge } from '#models/recurringCharge.model';
import { scheduleBillingJobs } from '#schedulers/billing.scheduler';
import { errorLog, log } from '#utils/logger.util';
import { chargePaymentSource, getAcceptanceTokens } from '#utils/wompiApi.util';

const calculateNextBillingDate = (frequency) => {
  const date = new Date();

  if (frequency === 'weekly') date.setDate(date.getDate() + 7);
  if (frequency === 'biweekly') date.setDate(date.getDate() + 15);
  if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);

  return date.toISOString().split('T')[0];
};

export const startBillingWorker = (PaymentSource) => new Promise((resolve) => {
  const worker = new Worker('billing', async (job) => {

    if (job.data.type === 'scheduled') {
      await scheduleBillingJobs(PaymentSource);
      return;
    }

    const { paymentSourceId } = job.data;

    const paymentSource = await PaymentSource.findByPk(paymentSourceId);

    if (!paymentSource || paymentSource.status !== PAYMENT_SOURCE_STATUS.AVAILABLE) {
      log(`Fuente de pago ${paymentSourceId} no disponible, saltando cobro`);
      return;
    }

    const { acceptance_token } = await getAcceptanceTokens();
    const reference = `REC-${randomUUID()}`;

    const recurringCharge = await RecurringCharge.create({
      payment_source_id: paymentSource.id,
      reference,
      amount: paymentSource.donation_value,
      status: 'pending'
    });

    await chargePaymentSource({
      payment_source_id: paymentSource.wompi_source_id,
      type: paymentSource.type,
      phone_number: paymentSource.phone_number,
      amount_in_cents: paymentSource.donation_value * 100,
      currency: 'COP',
      reference,
      customer_email: paymentSource.customer_email,
      acceptance_token
    });

    const next_billing_date = calculateNextBillingDate(paymentSource.billing_frequency);
    await paymentSource.update({ next_billing_date });

    log(`Cobro iniciado - ${paymentSource.customer_email} - ref: ${reference} - próximo cobro: ${next_billing_date}`);

  }, { connection: redisConnection });

  worker.on('ready', () => {
    log('Worker de cobros conectado a Redis');
    resolve(worker);
  });
  worker.on('active', (job) => log(`Procesando job: ${job.id}`));
  worker.on('completed', (job) => log(`Job completado: ${job.id}`));
  worker.on('failed', (job, error) => errorLog(`Cobro fallido para job ${job.id}:`, JSON.stringify(error.response?.data, null, 2) || error.message));
  worker.on('error', (error) => errorLog('Error en worker:', error.message));
});
