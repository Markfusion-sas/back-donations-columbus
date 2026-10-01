import sequelize, { isMssql } from '#config/database.config';
import { DB_SCHEMA } from '#config/environment.config';
import { setupAssociations } from '#models/associations';
import { Donation } from '#models/donation.model';
import { DonationCertificate } from '#models/donationCertificate.model';
import { Emprendimiento } from '#models/emprendimiento.model';
import { Order } from '#models/order.model';
import { OrderDetail } from '#models/orderDetail.model';
import { PaymentSource } from '#models/paymentSource.model';
import { Product } from '#models/product.model';
import { ProductVariant } from '#models/productVariant.model';
import { RecurringCharge } from '#models/recurringCharge.model';
import { SiteContent } from '#models/siteContent.model';
import { Transaction } from '#models/transaction.model';
import { errorLog, sqlLog } from '#utils/logger.util';

export const initDatabase = async() => {
  try {
    await sequelize.authenticate();
    sqlLog('Conexión establecida con la base de datos');

    // SQL Server: las tablas del sitio viven en su propio esquema (idempotente)
    if (isMssql && DB_SCHEMA) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(DB_SCHEMA)) throw new Error(`DB_SCHEMA no válido: ${DB_SCHEMA}`);
      await sequelize.query(
        `IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'${DB_SCHEMA}') EXEC('CREATE SCHEMA [${DB_SCHEMA}]')`
      );
    }

    setupAssociations();

    await Transaction.sync({ alter: false });
    await Donation.sync({ alter: false });
    await Product.sync({ alter: false });
    await ProductVariant.sync({ alter: false });
    await Order.sync({ alter: false });
    await OrderDetail.sync({ alter: false });
    await PaymentSource.sync({ alter: false });
    await RecurringCharge.sync({ alter: false });
    await Emprendimiento.sync({ alter: false });
    await DonationCertificate.sync({ alter: false });
    await SiteContent.sync({ alter: false });

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
    errorLog('Error al iniciar conexión:', error.message, error.original?.message ?? '', error.sql ?? '');
    process.exit(1);
  }
};
