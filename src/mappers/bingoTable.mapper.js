export const mapBingoTable = (data = {}) => {
  const { title, image_url, stock, description, price } = data;

  return {
    title,
    image_url,
    stock,
    description,
    price
  };
};
