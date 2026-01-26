import { donationService } from '#services/index';

export const donationControllerFactory = () => {
  
  const createDonation = async(req, res, next) => {

    try {
      const data = req.body;
      
      const { donation_destination: ddest , ...rest } = data;
      const donation_destination = ddest[0] || '';

      const dataFormatted = { donation_destination, ...rest };

      const donation = await donationService.saveDonation(dataFormatted);

      return res.status(200).json({
        success: true,
        data: {
          reference: donation.reference,
          name: donation.name,
        }
      });

    } catch (error) {
      next(error);
    }

  };

  return { createDonation };

};
