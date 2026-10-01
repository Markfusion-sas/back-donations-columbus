import { paymentSourceService } from '#services/index';

export const paymentSourceControllerFactory = () => {

  const registerNequi = async (req, res, next) => {
    try {
      const {
        token,
        customer_email,
        password,
        acceptance_token,
        accept_personal_auth,
        name,
        last_name,
        identity_document,
        phone,
        address,
        donation_destination,
        donation_value,
        billing_frequency
      } = req.body;

      const paymentSource = await paymentSourceService.registerNequi({
        token,
        customer_email,
        password,
        acceptance_token,
        accept_personal_auth,
        name,
        last_name,
        identity_document,
        phone,
        address,
        donation_destination,
        donation_value,
        billing_frequency
      });

      return res.status(200).json({
        success: true,
        data: {
          id: paymentSource.id,
          wompi_source_id: paymentSource.wompi_source_id,
          type: paymentSource.type,
          phone_number: paymentSource.phone_number,
          billing_frequency: paymentSource.billing_frequency,
          next_billing_date: paymentSource.next_billing_date,
          status: paymentSource.status
        }
      });

    } catch (error) {
      next(error);
    }
  };

  const verify = async (req, res, next) => {
    try {
      const { customer_email, password } = req.body;

      const paymentSource = await paymentSourceService.verify({ customer_email, password });

      return res.status(200).json({
        success: true,
        data: {
          id: paymentSource.id,
          type: paymentSource.type,
          phone_number: paymentSource.phone_number,
          donation_value: paymentSource.donation_value,
          donation_destination: paymentSource.donation_destination,
          billing_frequency: paymentSource.billing_frequency,
          next_billing_date: paymentSource.next_billing_date,
          status: paymentSource.status
        }
      });

    } catch (error) {
      next(error);
    }
  };

  const cancel = async (req, res, next) => {
    try {
      const { id } = req.params;

      await paymentSourceService.cancel(id);

      return res.status(200).json({
        success: true,
        message: 'Donación recurrente cancelada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  };

  const listCharges = async (req, res, next) => {
    try {
      const { customer_email, status } = req.query;

      const charges = await paymentSourceService.getAllCharges({ customer_email, status });

      return res.status(200).json({
        success: true,
        data: charges
      });

    } catch (error) {
      next(error);
    }
  };

  const registerCard = async (req, res, next) => {
    try {
      const {
        token,
        customer_email,
        password,
        acceptance_token,
        accept_personal_auth,
        name,
        last_name,
        identity_document,
        phone,
        address,
        donation_destination,
        donation_value,
        billing_frequency,
        brand,
        last_four,
        exp_month,
        exp_year,
        card_holder
      } = req.body;

      const paymentSource = await paymentSourceService.registerCard({
        token,
        customer_email,
        password,
        acceptance_token,
        accept_personal_auth,
        name,
        last_name,
        identity_document,
        phone,
        address,
        donation_destination,
        donation_value,
        billing_frequency,
        brand,
        last_four,
        exp_month,
        exp_year,
        card_holder
      });

      return res.status(200).json({
        success: true,
        data: {
          id: paymentSource.id,
          wompi_source_id: paymentSource.wompi_source_id,
          type: paymentSource.type,
          brand: paymentSource.brand,
          last_four: paymentSource.last_four,
          exp_month: paymentSource.exp_month,
          exp_year: paymentSource.exp_year,
          billing_frequency: paymentSource.billing_frequency,
          next_billing_date: paymentSource.next_billing_date,
          status: paymentSource.status
        }
      });

    } catch (error) {
      next(error);
    }
  };

  return { registerNequi, registerCard, verify, cancel, listCharges };

};
