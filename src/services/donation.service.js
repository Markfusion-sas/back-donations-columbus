import { errorLog } from '#utils/logger.util';

export const donationServiceFactory = ({ Donation, mapDonation }) => {

  const saveDonation = async(donationData) => {

    const dbData = mapDonation(donationData);

    try {
      const [donation] = await Donation.findOrCreate({
        where: { reference: dbData.reference },
        defaults: dbData
      });

      return donation;
      
    } catch (error) {

      errorLog('Error al guardar donación en DB:', error);

      return null;
    }

  };

  const getDonationByReference = async(reference) => {

    const donation = await Donation.findOne({
      where: { reference }
    });

    return donation;

  };

  return { saveDonation, getDonationByReference };

};
