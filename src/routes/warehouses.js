// src/routes/warehouses.js
import express from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/product.js';
import { requireAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  res.json([]);
});

router.use((req, _res, next) => {
  req.shopId = String(req.query.shop || req.get('X-Shop-ID') || 'shop-1');
  next();
});

const parseQuantity = (value) => {
  const qty = Number.parseInt(value, 10);
  return Number.isFinite(qty) ? qty : NaN;
};

router.post('/transfer', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const {
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      notes,
      initiatedBy
    } = req.body || {};

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Valid productId is required.' });
    }
    const destination = String(toWarehouseId || '').trim();
    if (!destination) {
      return res.status(400).json({ error: 'Destination warehouse is required.' });
    }
    const qty = parseQuantity(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    const product = await Product.findOne({ _id: productId, shopId: req.shopId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const currentWarehouse = String(product.warehouse || '').trim();
    const expectedSource = String(fromWarehouseId || '').trim();
    if (expectedSource && currentWarehouse && expectedSource !== currentWarehouse) {
      return res.status(409).json({
        error: `Product is currently assigned to warehouse "${currentWarehouse}", not "${expectedSource}".`,
        currentWarehouse
      });
    }

    if (Number.isFinite(product.amount) && qty > product.amount) {
      return res.status(400).json({
        error: 'Transfer quantity exceeds available stock.',
        available: product.amount
      });
    }

    const now = new Date();
    const detailParts = [
      `Transfer ${qty} unit(s)`,
      expectedSource ? `from ${expectedSource}` : '',
      `to ${destination}`
    ].filter(Boolean);
    const detail = detailParts.join(' ');
    const historyNotes = [detail, notes?.trim()].filter(Boolean).join(' — ');

    const historyEntry = {
      timestamp: now,
      changedAtMs: now.getTime(),
      userName: initiatedBy || 'system',
      oldAmount: product.amount ?? 0,
      newAmount: product.amount ?? 0,
      reason: 'warehouse-transfer',
      notes: historyNotes
    };

    product.warehouse = destination;
    product.updatedBy = initiatedBy || 'system';
    product.lastChange = 0;
    product.lastChangeReason = 'warehouse-transfer';
    product.lastChangeNotes = historyNotes;
    product.lastChangeTime = now.toISOString();
    product.history = Array.isArray(product.history) ? product.history : [];
    product.history.push(historyEntry);

    await product.save();

    res.json({
      ok: true,
      message: 'Transfer recorded successfully.',
      product: product.toObject(),
      historyEntry
    });
  } catch (err) {
    next(err);
  }
});

export default router;
