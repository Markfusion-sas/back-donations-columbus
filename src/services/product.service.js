export const productServiceFactory = ({ Product }) => {

  const getAllProducts = async() => {
    const products = await Product.findAll();
    return products;
  };

  return { getAllProducts };

};
