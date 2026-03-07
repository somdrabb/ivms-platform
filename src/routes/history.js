// src/routes/history.js
import express from 'express';
import { Product } from '../models/product.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// helper:  shop-1 -> 1997, shop-2 -> 1998, ...
function codeFromShopId(shopId) {
  const m = String(shopId).match(/-(\d+)$/);
  const n = m ? parseInt(m[1], 10) : 1;
  return String(1996 + n);
}

// read shopId like products router does
router.use((req, _res, next) => {
  req.shopId = String(req.query.shop || req.get('X-Shop-ID') || 'shop-1');
  next();
});

/** GET /api/history — newest first (limit via ?limit=) */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(5000, Math.max(1, parseInt(req.query.limit ?? '2000', 10)));

    const pipeline = [
      { $match: { shopId: req.shopId, history: { $exists: true, $ne: [] } } },
      { $unwind: '$history' },
      { $sort: { 'history.changedAtMs': -1, 'history.timestamp': -1 } },
      {
        $project: {
          productId: '$_id',
          productName: '$name',
          productEAN: '$ean',
          timestamp: '$history.timestamp',
          changedAtMs: '$history.changedAtMs',
          userName: '$history.userName',
          oldAmount: '$history.oldAmount',
          newAmount: '$history.newAmount',
          reason: '$history.reason',
          notes: '$history.notes',
        }
      },
      { $limit: limit }
    ];

    const rows = await Product.aggregate(pipeline);

    // expose a friendly code for the client header
    res.set('X-Shop-Code', codeFromShopId(req.shopId));
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
