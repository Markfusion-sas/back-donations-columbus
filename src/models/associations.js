import { Donation } from './donation.model.js';
import { Transaction } from './transaction.model.js';

export const setupAssociations = () => {
  
  Donation.hasOne(Transaction, {
    foreignKey: 'donation_id',
    as: 'transaction'
  });

  Transaction.belongsTo(Donation, {
    foreignKey: 'donation_id',
    as: 'donation'
  });

};
