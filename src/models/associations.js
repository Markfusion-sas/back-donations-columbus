import { BingoTable } from './bingoTable.model.js';
import { BingoTableOrder } from './bingoTableOrder.model.js';
import { Donation } from './donation.model.js';
import { Transaction } from './transaction.model.js';

export const setupAssociations = () => {

  // Transaction → Donation (FK transaction_id en Donation)
  Transaction.hasOne(Donation, {
    foreignKey: 'transaction_id',
    as: 'donation'
  });

  Donation.belongsTo(Transaction, {
    foreignKey: 'transaction_id',
    as: 'transaction'
  });

  // Transaction → BingoTableOrder (FK transaction_id en BingoTableOrder)
  Transaction.hasOne(BingoTableOrder, {
    foreignKey: 'transaction_id',
    as: 'bingoTableOrder'
  });

  BingoTableOrder.belongsTo(Transaction, {
    foreignKey: 'transaction_id',
    as: 'transaction'
  });

  // BingoTable → BingoTableOrder
  BingoTable.hasMany(BingoTableOrder, {
    foreignKey: 'bingo_table_id',
    as: 'orders'
  });

  BingoTableOrder.belongsTo(BingoTable, {
    foreignKey: 'bingo_table_id',
    as: 'bingoTable'
  });

};
