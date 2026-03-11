export const mapProductVariant = (data = {}) => {
  const { product_id, name, quantity, price } = data;

  return { product_id, name, quantity, price };
};
