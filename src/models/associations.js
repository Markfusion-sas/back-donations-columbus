import { Donation } from './donation.model.js';
import { Order } from './order.model.js';
import { OrderDetail } from './orderDetail.model.js';
import { Product } from './product.model.js';
import { ProductVariant } from './productVariant.model.js';
import { Transaction } from './transaction.model.js';

export const setupAssociations = () => {

  // Transaction → Donation
  Transaction.hasOne(Donation, {
    foreignKey: 'transaction_id',
    as: 'donation'
  });

  Donation.belongsTo(Transaction, {
    foreignKey: 'transaction_id',
    as: 'transaction'
  });

  // Transaction → Order
  Transaction.hasOne(Order, {
    foreignKey: 'transaction_id',
    as: 'order'
  });

  Order.belongsTo(Transaction, {
    foreignKey: 'transaction_id',
    as: 'transaction'
  });

  // Product → ProductVariant
  Product.hasMany(ProductVariant, {
    foreignKey: 'product_id',
    as: 'variants'
  });

  ProductVariant.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Order → OrderDetail
  Order.hasMany(OrderDetail, {
    foreignKey: 'order_id',
    as: 'details'
  });

  OrderDetail.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
  });

  // ProductVariant → OrderDetail
  ProductVariant.hasMany(OrderDetail, {
    foreignKey: 'product_variant_id',
    as: 'orderDetails'
  });

  OrderDetail.belongsTo(ProductVariant, {
    foreignKey: 'product_variant_id',
    as: 'variant'
  });

};
