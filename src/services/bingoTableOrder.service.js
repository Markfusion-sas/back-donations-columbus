import { randomUUID } from 'crypto';

import { errorLog } from '#utils/logger.util';

export const bingoTableOrderServiceFactory = ({ BingoTable, BingoTableOrder, mapBingoTableOrder }) => {

  const createBingoTableOrder = async(orderData) => {
    const { bingo_table_id, quantity, total: totalFromBody } = orderData;

    const table = await BingoTable.findByPk(bingo_table_id);

    if (!table) {
      const error = new Error('Tabla de bingo no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (table.stock < quantity) {
      const error = new Error(`Stock insuficiente. Disponible: ${table.stock}, solicitado: ${quantity}`);
      error.statusCode = 400;
      throw error;
    }

    const unit_price =  quantity > 1 ? table.price_offer : table.price;
    console.log(unit_price);
    const calculatedTotal = parseFloat((unit_price * quantity).toFixed(2));
    const receivedTotal = parseFloat(totalFromBody.toFixed(2));
    if (calculatedTotal !== receivedTotal) {
      const error = new Error(`Total no coincide. Esperado: ${calculatedTotal}, recibido: ${receivedTotal}`);
      error.statusCode = 400;
      throw error;
    }

    const reference = `BINGO-${randomUUID()}`;

    const dbData = mapBingoTableOrder({ ...orderData, reference, unit_price, total: calculatedTotal });

    try {
      const order = await BingoTableOrder.create(dbData);
      return order;
    } catch (error) {
      errorLog('Error al crear la orden de bingo en la BD:', error);
      throw error;
    }
  };

  const decrementBingoTableStock = async(order) => {
    const table = await BingoTable.findByPk(order.bingo_table_id);

    if (!table) {
      const error = new Error(`Tabla de bingo no encontrada para la orden: ${order.id}`);
      error.statusCode = 404;
      throw error;
    }

    if (table.stock < order.quantity) {
      const error = new Error(`Stock insuficiente para completar la orden. Disponible: ${table.stock}, requerido: ${order.quantity}`);
      error.statusCode = 400;
      throw error;
    }

    await table.decrement('stock', { by: order.quantity });
  };

  const getAllBingoTableOrders = async() => {
    const orders = await BingoTableOrder.findAll();
    return orders;
  };

  const getBingoTableOrderByReference = async(reference) => {
    const order = await BingoTableOrder.findOne({ where: { reference } });
    return order;
  };

  return { createBingoTableOrder, getAllBingoTableOrders, getBingoTableOrderByReference, decrementBingoTableStock };

};
