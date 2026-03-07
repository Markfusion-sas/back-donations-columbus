import { randomUUID } from 'crypto';

import { errorLog } from '#utils/logger.util';

export const donationServiceFactory = ({ Donation, mapDonation }) => {

  const saveDonation = async(donationData) => {
    const reference = `DON-${randomUUID()}`;
    const dbData = mapDonation({ ...donationData, reference });

    try {
      const donation = await Donation.create(dbData);
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
