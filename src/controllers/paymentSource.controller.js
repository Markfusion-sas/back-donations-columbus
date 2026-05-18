import { paymentSourceService } from '#services/index';

export const paymentSourceControllerFactory = () => {

  const registerNequi = async (req, res, next) => {
    try {
      const { token, customer_email, acceptance_token, accept_personal_auth } = req.body;

      const paymentSource = await paymentSourceService.registerNequi({
        token,
        customer_email,
        acceptance_token,
        accept_personal_auth
      });

      return res.status(200).json({
        success: true,
        data: {
          wompi_source_id: paymentSource.wompi_source_id,
          type: paymentSource.type,
          phone_number: paymentSource.phone_number,
          status: paymentSource.status
        }
      });

    } catch (error) {
      next(error);
    }
  };

  return { registerNequi };

};
