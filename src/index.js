// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import warehousesRouter from './routes/warehouses.js';
import purchasesRouter from './routes/purchases.js';
import shopsRouter from './routes/shops.js';
import productsRouter from './routes/products.js';
import historyRouter from './routes/history.js';
import authRouter from './routes/auth.js';
import { authenticateRequest } from './middleware/auth.js';
import { Product } from './models/product.js';
import { PurchaseOrder } from './models/purchaseOrder.js';

const DEFAULT_SHOP_ID = 'shop-1';

async function backfillDefaultShopData() {
  const criteria = { $or: [{ shopId: { $exists: false } }, { shopId: null }, { shopId: '' }] };
  try {
    const [productResult, purchaseResult] = await Promise.all([
      Product.updateMany(criteria, { $set: { shopId: DEFAULT_SHOP_ID } }),
      PurchaseOrder.updateMany(criteria, { $set: { shopId: DEFAULT_SHOP_ID } })
    ]);
    if (productResult.modifiedCount || purchaseResult.modifiedCount) {
      console.log(
        `🔧 Backfilled shopId for ${productResult.modifiedCount} product(s) and ${purchaseResult.modifiedCount} purchase order(s)`
      );
    }
  } catch (err) {
    console.error('Failed to backfill default shop data:', err);
  }
}
const app = express();
// Middlewares
app.use(cors({ origin: true }));                 // reflect request origin (good for dev)
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(authenticateRequest);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files under /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
// Serve storefront and auxiliary frontends
app.use('/storefront', express.static(path.join(__dirname, '..', 'storefront')));
app.use('/pos', express.static(path.join(__dirname, '..', 'pos')));
app.use('/backoffice', express.static(path.join(__dirname, '..', 'Backoffice')));
// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/history', historyRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/shops', shopsRouter);
// Error handler (last)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});
// Start after DB is ready
const PORT = process.env.PORT || 4000;
connectDB().then(async () => {
  await backfillDefaultShopData();
  app.listen(PORT, () =>
    console.log(`🚀 API listening on http://localhost:${PORT}`)
  );
});
