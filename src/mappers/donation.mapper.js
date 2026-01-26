export const mapDonation= (donationData = {}) => {
  const {
    reference,
    donation_destination,
    identity_document,
    name,
    last_name,
    phone,
    email = null,
    address,
    donation_value,
  } = donationData;

  return {
    reference: reference || null,
    donation_destination,
    identity_document,
    name,
    last_name,
    phone,
    email: email || null,
    address,
    donation_value
  };
};
