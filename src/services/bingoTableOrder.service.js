import { randomUUID } from 'crypto';

import { errorLog } from '#utils/logger.util';

export const bingoTableOrderServiceFactory = ({ BingoTable, BingoTableOrder, mapBingoTableOrder }) => {

  const createBingoTableOrder = async(orderData) => {
    const { bingo_table_id, quantity, total: totalFromBody } = orderData;

    const table = await BingoTable.findByPk(bingo_table_id);

    if (!table) {
      const error = new Error('Bingo table not found');
      error.statusCode = 404;
      throw error;
    }

    if (table.stock < quantity) {
      const error = new Error(`Insufficient stock. Available: ${table.stock}, requested: ${quantity}`);
      error.statusCode = 400;
      throw error;
    }

    const unit_price =  quantity > 1 ? table.offer_price : table.price;
    const calculatedTotal = parseFloat((unit_price * quantity).toFixed(2));
    const receivedTotal = parseFloat(totalFromBody.toFixed(2));

    if (calculatedTotal !== receivedTotal) {
      const error = new Error(`Total mismatch. Expected: ${calculatedTotal}, received: ${receivedTotal}`);
      error.statusCode = 400;
      throw error;
    }

    const reference = `BINGO-${randomUUID()}`;

    const dbData = mapBingoTableOrder({ ...orderData, reference, unit_price, total: calculatedTotal });

    try {
      const order = await BingoTableOrder.create(dbData);
      await table.decrement('stock', { by: quantity });
      return order;
    } catch (error) {
      errorLog('Error creating bingo table order in DB:', error);
      throw error;
    }
  };

  const getAllBingoTableOrders = async() => {
    const orders = await BingoTableOrder.findAll();
    return orders;
  };

  const getBingoTableOrderByReference = async(reference) => {
    const order = await BingoTableOrder.findOne({ where: { reference } });
    return order;
  };

  return { createBingoTableOrder, getAllBingoTableOrders, getBingoTableOrderByReference };

};
