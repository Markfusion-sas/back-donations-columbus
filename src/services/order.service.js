import { randomUUID } from 'crypto';

import { errorLog } from '#utils/logger.util';

export const orderServiceFactory = ({ Product, ProductVariant, Order, OrderDetail, mapOrder, mapOrderDetail }) => {

  const createOrder = async(orderData) => {
    const { items, total: totalFromBody, ...customerData } = orderData;

    // 1. Cargar todas las variantes solicitadas
    const variantIds = items.map(item => item.product_variant_id);
    const variants = await ProductVariant.findAll({ where: { id: variantIds } });

    if (variants.length !== variantIds.length) {
      const error = new Error('Una o más variantes no fueron encontradas');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validar que todas las variantes pertenecen al mismo producto padre
    const productIds = [...new Set(variants.map(v => v.product_id))];
    if (productIds.length > 1) {
      const error = new Error('Todas las variantes deben pertenecer al mismo producto');
      error.statusCode = 400;
      throw error;
    }

    // 3. Cargar el producto padre
    const product = await Product.findByPk(productIds[0]);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const variantMap = Object.fromEntries(variants.map(v => [v.id, v]));

    // 4. Validar precio, total por ítem y calcular stock requerido
    let stockRequerido = 0;
    let calculatedOrderTotal = 0;

    for (const item of items) {
      const variant = variantMap[item.product_variant_id];

      const expectedUnitPrice = parseFloat(variant.price.toFixed(2));
      const receivedUnitPrice = parseFloat(item.unit_price.toFixed(2));
      if (expectedUnitPrice !== receivedUnitPrice) {
        const error = new Error(`Precio unitario incorrecto para la variante "${variant.name}". Esperado: ${expectedUnitPrice}, recibido: ${receivedUnitPrice}`);
        error.statusCode = 400;
        throw error;
      }

      const expectedItemTotal = parseFloat((variant.price * item.quantity).toFixed(2));
      const receivedItemTotal = parseFloat(item.total.toFixed(2));
      if (expectedItemTotal !== receivedItemTotal) {
        const error = new Error(`Total incorrecto para la variante "${variant.name}". Esperado: ${expectedItemTotal}, recibido: ${receivedItemTotal}`);
        error.statusCode = 400;
        throw error;
      }

      stockRequerido += variant.quantity * item.quantity;
      calculatedOrderTotal += expectedItemTotal;
    }

    // 5. Validar total general de la orden
    calculatedOrderTotal = parseFloat(calculatedOrderTotal.toFixed(2));
    const receivedOrderTotal = parseFloat(totalFromBody.toFixed(2));
    if (calculatedOrderTotal !== receivedOrderTotal) {
      const error = new Error(`Total de la orden incorrecto. Esperado: ${calculatedOrderTotal}, recibido: ${receivedOrderTotal}`);
      error.statusCode = 400;
      throw error;
    }

    // 6. Validar stock disponible
    if (product.stock < stockRequerido) {
      const error = new Error(`Stock insuficiente. Disponible: ${product.stock}, requerido: ${stockRequerido}`);
      error.statusCode = 400;
      throw error;
    }

    // 7. Crear la orden y sus detalles
    const reference = `BINGO-${randomUUID()}`;
    const orderDbData = mapOrder({ ...customerData, reference, total: calculatedOrderTotal });

    try {
      const order = await Order.create(orderDbData);

      const detailsDbData = items.map(item => {
        const variant = variantMap[item.product_variant_id];
        return mapOrderDetail({
          order_id: order.id,
          product_variant_id: item.product_variant_id,
          unit_price: variant.price,
          quantity: item.quantity,
          total: parseFloat((variant.price * item.quantity).toFixed(2))
        });
      });

      await OrderDetail.bulkCreate(detailsDbData);

      return order;
    } catch (error) {
      errorLog('Error al crear la orden en la BD:', error);
      throw error;
    }
  };

  const getAllOrders = async() => {
    const orders = await Order.findAll();
    return orders;
  };

  const getOrderByReference = async(reference) => {
    const order = await Order.findOne({ where: { reference } });
    return order;
  };

  const getOrderDetailsByOrderId = async(orderId) => {
    const order = await Order.findByPk(orderId);

    if (!order) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const details = await OrderDetail.findAll({
      where: { order_id: orderId },
      include: [{ model: ProductVariant, as: 'variant' }]
    });

    return { order, details };
  };

  const decrementStock = async(order) => {
    const details = await OrderDetail.findAll({
      where: { order_id: order.id },
      include: [{ model: ProductVariant, as: 'variant' }]
    });

    if (!details.length) {
      const error = new Error(`No se encontraron detalles para la orden: ${order.id}`);
      error.statusCode = 404;
      throw error;
    }

    const product = await Product.findByPk(details[0].variant.product_id);
    if (!product) {
      const error = new Error(`Producto no encontrado para la orden: ${order.id}`);
      error.statusCode = 404;
      throw error;
    }

    const stockRequerido = details.reduce((acc, d) => acc + (d.variant.quantity * d.quantity), 0);

    if (product.stock < stockRequerido) {
      const error = new Error(`Stock insuficiente para completar la orden. Disponible: ${product.stock}, requerido: ${stockRequerido}`);
      error.statusCode = 400;
      throw error;
    }

    await product.decrement('stock', { by: stockRequerido });
  };

  return { createOrder, getAllOrders, getOrderByReference, getOrderDetailsByOrderId, decrementStock };

};
