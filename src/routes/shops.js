// src/routes/shops.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { Shop } from '../models/shop.js';
import { Product } from '../models/product.js';
import { PurchaseOrder } from '../models/purchaseOrder.js';
import { requireAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

const SHOP_CODE_BASE = 1997;
const uploadsRoot = path.join(process.cwd(), 'uploads');

function trim(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function parseShopIndex(shopId = '') {
  const match = String(shopId).match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

function normalizeShop(doc) {
  if (!doc) return null;
  return {
    id: doc.shopId,
    name: doc.name,
    code: doc.code,
    isActive: doc.isActive !== false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

async function ensureDefaultShop() {
  let shops = await Shop.find().sort({ createdAt: 1 }).lean();
  if (!shops.length) {
    const defaultShop = await Shop.create({
      shopId: 'shop-1',
      name: 'Shop 1',
      code: String(SHOP_CODE_BASE),
      isActive: true
    });
    shops = [defaultShop.toObject()];
  }
  return shops;
}

router.get('/', async (_req, res, next) => {
  try {
    const shops = await ensureDefaultShop();
    res.json(shops.map(normalizeShop));
  } catch (err) {
    next(err);
  }
});

router.post('/', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const nameRaw = trim(req.body?.name);
    const existing = await Shop.find().lean();
    const nextIndex = existing.reduce((max, shop) => Math.max(max, parseShopIndex(shop.shopId)), 0) + 1;
    const shopId = `shop-${nextIndex}`;
    const code = String(SHOP_CODE_BASE + nextIndex - 1);
    const name = nameRaw || `Shop ${nextIndex}`;

    if (existing.some(shop => shop.name?.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'A shop with this name already exists.' });
    }

    const doc = await Shop.create({
      shopId,
      name,
      code,
      isActive: true
    });

    res.status(201).json(normalizeShop(doc));
  } catch (err) {
    if (err?.code === 11000) {
      err.status = 409;
      err.message = 'Shop code or id already exists.';
    }
    next(err);
  }
});

router.put('/:shopId', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const shopId = String(req.params.shopId || '').trim();
    if (!shopId) return res.status(400).json({ error: 'shopId is required' });

    const updates = {};
    if ('name' in req.body) {
      const name = trim(req.body.name);
      if (!name) return res.status(400).json({ error: 'Name cannot be empty' });
      updates.name = name;
    }
    if ('isActive' in req.body) {
      updates.isActive = !!req.body.isActive;
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const doc = await Shop.findOneAndUpdate(
      { shopId },
      { $set: updates },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Shop not found' });

    res.json(normalizeShop(doc));
  } catch (err) {
    next(err);
  }
});

router.delete('/:shopId', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const shopId = String(req.params.shopId || '').trim();
    if (!shopId) return res.status(400).json({ error: 'shopId is required' });

    const total = await Shop.countDocuments();
    if (total <= 1) {
      return res.status(400).json({ error: 'At least one shop must remain.' });
    }

    const doc = await Shop.findOneAndDelete({ shopId });
    if (!doc) return res.status(404).json({ error: 'Shop not found' });

    await Promise.all([
      Product.deleteMany({ shopId }),
      PurchaseOrder.deleteMany({ shopId })
    ]);

    const productDir = path.join(uploadsRoot, 'products', shopId);
    const purchaseDir = path.join(uploadsRoot, 'purchases', shopId);
    await Promise.all([
      fs.promises.rm(productDir, { recursive: true, force: true }).catch(() => {}),
      fs.promises.rm(purchaseDir, { recursive: true, force: true }).catch(() => {})
    ]);

    res.json({ ok: true, shop: normalizeShop(doc) });
  } catch (err) {
    next(err);
  }
});

export default router;
