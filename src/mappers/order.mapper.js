export const mapOrder = (data = {}) => {
  const {
    reference,
    identity_document,
    name,
    last_name,
    phone,
    email,
    address,
    total
  } = data;

  return {
    reference,
    identity_document,
    name,
    last_name,
    phone,
    email,
    address,
    total
  };
};
