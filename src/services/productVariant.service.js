export const productVariantServiceFactory = ({ ProductVariant }) => {

  const getVariantsByProduct = async(productId) => {
    const variants = await ProductVariant.findAll({
      where: { product_id: productId }
    });
    return variants;
  };

  return { getVariantsByProduct };

};
