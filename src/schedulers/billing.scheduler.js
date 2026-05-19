import { Op } from 'sequelize';

import { PAYMENT_SOURCE_STATUS } from '#config/constants.config';
import { billingQueue } from '#queues/billing.queue';
import { log, errorLog } from '#utils/logger.util';

export const scheduleBillingJobs = async (PaymentSource) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const dueSources = await PaymentSource.findAll({
      where: {
        status: PAYMENT_SOURCE_STATUS.AVAILABLE,
        next_billing_date: { [Op.lte]: today }
      }
    });

    if (dueSources.length === 0) {
      log('No hay cobros pendientes para hoy');
      return;
    }

    for (const source of dueSources) {
      await billingQueue.add(
        `charge-${source.id}`,
        { paymentSourceId: source.id },
        { jobId: `charge-${source.id}-${today}` }
      );
    }

    log(`${dueSources.length} cobros agendados para hoy`);

  } catch (error) {
    errorLog('Error al agendar cobros:', error.message);
  }
};
