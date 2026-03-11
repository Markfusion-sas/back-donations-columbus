export const mapProduct = (data = {}) => {
  const { title, image_url, stock, description } = data;

  return { title, image_url, stock, description };
};
