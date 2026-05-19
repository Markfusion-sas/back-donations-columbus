import sequelize from '#config/database.config';
import { setupAssociations } from '#models/associations';
import { Donation } from '#models/donation.model';
import { Order } from '#models/order.model';
import { OrderDetail } from '#models/orderDetail.model';
import { PaymentSource } from '#models/paymentSource.model';
import { RecurringCharge } from '#models/recurringCharge.model';
import { Product } from '#models/product.model';
import { ProductVariant } from '#models/productVariant.model';
import { Transaction } from '#models/transaction.model';
import { errorLog, sqlLog } from '#utils/logger.util';

export const initDatabase = async() => {
  try {
    await sequelize.authenticate();
    sqlLog('Conexión establecida con la base de datos');

    setupAssociations();

    await Transaction.sync({ alter: true });
    await Donation.sync({ alter: false });
    await Product.sync({ alter: false });
    await ProductVariant.sync({ alter: false });
    await Order.sync({ alter: false });
    await OrderDetail.sync({ alter: false });
    await PaymentSource.sync({ alter: true });
    await RecurringCharge.sync({ alter: true });

    const [product] = await Product.findOrCreate({
      where: { title: 'Tabla bingo' },
      defaults: {
        title: 'Tabla bingo',
        image_url: 'https://postimg.cc/N5X569GQ',
        stock: 500,
        description: null
      }
    });

    await ProductVariant.findOrCreate({
      where: { product_id: product.id, name: 'Individual' },
      defaults: {
        product_id: product.id,
        name: 'Individual',
        quantity: 1,
        price: 45000
      }
    });

    await ProductVariant.findOrCreate({
      where: { product_id: product.id, name: 'Par' },
      defaults: {
        product_id: product.id,
        name: 'Par',
        quantity: 2,
        price: 80000
      }
    });
  } catch (error) {
    errorLog('Error al iniciar conexión:', error.message);
    process.exit(1);
  }
};
