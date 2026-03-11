export const mapOrderDetail = (data = {}) => {
  const { order_id, product_variant_id, unit_price, quantity, total } = data;

  return { order_id, product_variant_id, unit_price, quantity, total };
};
