export const mapBingoTableOrder = (data = {}) => {
  const {
    bingo_table_id,
    reference,
    identity_document,
    name,
    last_name,
    phone,
    email,
    address,
    quantity,
    unit_price,
    total
  } = data;

  return {
    bingo_table_id,
    reference,
    identity_document,
    name,
    last_name,
    phone,
    email,
    address,
    quantity,
    unit_price,
    total
  };
};
