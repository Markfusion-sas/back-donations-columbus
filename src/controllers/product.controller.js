import { productService, productVariantService } from '#services/index';

export const productControllerFactory = () => {

  const getAllProducts = async(req, res, next) => {
    try {
      const products = await productService.getAllProducts();

      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  };

  const getVariantsByProduct = async(req, res, next) => {
    try {
      const variants = await productVariantService.getVariantsByProduct(req.params.id);

      return res.status(200).json({
        success: true,
        data: variants
      });
    } catch (error) {
      next(error);
    }
  };

  return { getAllProducts, getVariantsByProduct };

};
