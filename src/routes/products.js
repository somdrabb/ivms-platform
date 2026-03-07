
// src/routes/products.js
import express from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/product.js'; 
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { requireAuth, authorizeRoles } from '../middleware/auth.js';
const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'products', req.shopId); // 👈 per shop folder
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ean = String(req.params.ean || 'unknown').replace(/[^\w.-]/g, '_');
    const ext = path.extname(file.originalname) || ({
      'image/jpeg': '.jpg','image/png': '.png','image/webp': '.webp','image/gif': '.gif'
    }[file.mimetype] || '.bin');
    cb(null, `${ean}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});
router.use(requireAuth);
/* -------------------- helpers -------------------- */
const asInt = (v, d = 0) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};
const asNum = (v, d = 0) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : d;
};
const asNumDecimal = (v, d = 0) => {
  if (v === undefined || v === null || v === '') return d;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : d;
};

function validationError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const trimOrUndefined = (value) => {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  return str === '' ? undefined : str;
};

function applyIdentifierRules(payload, {
  existingEan,
  existingPlu,
  requireAny = false
} = {}) {
  const hasOwn = Object.prototype.hasOwnProperty;

  let finalEan = trimOrUndefined(existingEan);
  let finalPlu = trimOrUndefined(existingPlu);

  if (hasOwn.call(payload, 'ean')) {
    const candidate = trimOrUndefined(payload.ean);
    if (candidate !== undefined && !/^\d{8,13}$/.test(candidate)) {
      throw validationError('EAN must be 8-13 digits');
    }
    if (candidate === undefined) delete payload.ean;
    else payload.ean = candidate;
    finalEan = candidate;
  }

  if (hasOwn.call(payload, 'plu')) {
    const candidate = trimOrUndefined(payload.plu);
    if (candidate !== undefined && !/^\d{1,3}$/.test(candidate)) {
      throw validationError('PLU must be 1-3 digits');
    }
    if (candidate === undefined) delete payload.plu;
    else payload.plu = candidate;
    finalPlu = candidate;
  }

  if (requireAny && !finalEan && !finalPlu) {
    throw validationError('Either EAN or PLU is required');
  }

  return { finalEan, finalPlu };
}

function duplicateKeyMessage(err) {
  const key = Object.keys(err?.keyPattern || {})[0] || '';
  if (key.includes('plu')) return 'PLU already exists for another product';
  if (key.includes('ean')) return 'EAN already exists for another product';
  return 'Duplicate value for a unique field';
}

const SORT_WHITELIST = new Set([
  'createdAt','updatedAt','name','price','amount','primaryCategory','secondaryCategory','ean','plu','lastUpdated'
]);

function safeSort(sort = 'updatedAt', dir = 'desc') {
  const field = SORT_WHITELIST.has(sort) ? sort : 'updatedAt';
  const order = String(dir).toLowerCase() === 'asc' ? 1 : -1;
  return { [field]: order };
}

function pickUpdatableFields(body = {}) {
  const allowed = [
    'ean','plu','name','price','cost','weight','amount','primaryCategory','secondaryCategory',
    'reorderLevel','sku','brand','shortDesc','longDesc','promoPrice','taxClass','dimensions',
    'warehouse','supplier','country','metaTitle','metaDesc','visibility','createdBy','updatedBy'
  ];
  const out = {};
  for (const k of allowed) if (k in body) out[k] = body[k];

  // coercions
  if (out.price !== undefined) out.price = asNum(out.price);
  if (out.cost !== undefined) out.cost = asNum(out.cost);
  if (out.weight !== undefined) out.weight = asNum(out.weight);
  if (out.amount !== undefined) out.amount = asInt(out.amount);
  if (out.reorderLevel !== undefined) out.reorderLevel = asInt(out.reorderLevel, 10);

  if (out.primaryCategory || out.secondaryCategory) {
    out.category = out.secondaryCategory || out.primaryCategory;
  }
  if (typeof out.name === 'string') out.name = out.name.trim();
  if (typeof out.ean === 'string') out.ean = out.ean.trim();
  if (typeof out.plu === 'string') out.plu = out.plu.trim();
  return out;
}

function ensureObjectId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  next();
}
//++++++++++++++++++++++++++
// Put this near the top, before any router.get/post(...)
const SHOP_CODE_BASE = 1997;
function codeFromShopId(shopId) {
  const m = String(shopId).match(/(\d+)$/);
  const n = m ? parseInt(m[1], 10) : 1;
  return String(SHOP_CODE_BASE - 1 + n);
}
//++++++++++++++++++++++++++
// Put this near the top, before any router.get/post(...)
router.use((req, res, next) => {
  const id = String(req.query.shop || req.get('X-Shop-ID') || 'shop-1');
  req.shopId = id;
  req.shopCode = codeFromShopId(id);
  // expose headers for UI
  res.set('X-Shop-ID', req.shopId);
  res.set('X-Shop-Code', req.shopCode);
  next();
});
/* -------------------- base CRUD & utilities -------------------- */
/** List (paged) — GET /api/products */
router.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, asInt(req.query.page, 1));
    const limit = Math.min(5000, Math.max(1, asInt(req.query.limit, 50)));
    const sort  = safeSort(req.query.sort, req.query.dir);

    const filter = { shopId: req.shopId };
    const { q, category } = req.query;

    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: rx }, { ean: rx }, { plu: rx }, { sku: rx }, { brand: rx },
        { primaryCategory: rx }, { secondaryCategory: rx },
        { warehouse: rx }, { supplier: rx }, { country: rx },
        { metaTitle: rx }, { metaDesc: rx }, { visibility: rx },
        { shortDesc: rx }, { longDesc: rx }
      ];
    }
    if (category) {
      (filter.$or ||= []).push({ primaryCategory: category }, { secondaryCategory: category });
    }
    const [data, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);
    res.json({ data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

/********************************************************************************
 *  Server-side search (wide, ranked) — GET /api/products/search 
 * ******************************************************************************/
router.get('/search', async (req, res, next) => {
  try {
    const { q = '', ean, plu, category, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim     = Math.min(5000, Math.max(1, parseInt(limit, 10) || 50));
    const skip    = (pageNum - 1) * lim;

    const norm = s => String(s ?? '').toLowerCase();
    const esc  = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const tokens   = norm(q).split(/\s+/).filter(Boolean);
    const exactEAN = ean || (/^\d{8,13}$/.test(q) ? q : null);
    const exactPLU = plu || (/^\d{1,3}$/.test(q) ? q : null);
    const qEsc     = esc(norm(q));

    const pipelineBase = [
      { $match: { shopId: req.shopId } },
      // derive fields (status, dates, history) –– same as your current code
      {
        $addFields: {
          _amount:       { $ifNull: ['$amount', 0] },
          _reorderLevel: { $ifNull: ['$reorderLevel', 10] },
          _price:        { $ifNull: ['$price', 0] },
          _cost:         { $ifNull: ['$cost', 0] },
          _createdAt:    '$createdAt',
          _updatedAt:    '$updatedAt',
          _expiryDate:   '$expiryDate',
          _lastUpdatedMs:'$lastUpdated',
        }
      },
      {
        $addFields: {
          statusText: {
            $switch: {
              branches: [
                { case: { $lte: ['$_amount', 0] }, then: 'out of stock' },
                { case: { $lte: ['$_amount', '$_reorderLevel'] }, then: 'low stock' },
              ],
              default: 'in stock'
            }
          },
          profitPctText: {
            $cond: [
              { $gt: ['$_price', 0] },
              {
                $concat: [
                  {
                    $toString: {
                      $round: [
                        { $multiply: [{ $divide: [{ $subtract: ['$_price', '$_cost'] }, '$_price'] }, 100] },
                        2
                      ]
                    }
                  },
                  '%'
                ]
              },
              ''
            ]
          },
          createdAtStr:  { $cond: [{ $ifNull: ['$_createdAt', false] }, { $dateToString: { date: '$_createdAt', format: '%Y-%m-%d %H:%M:%S' } }, '' ] },
          updatedAtStr:  { $cond: [{ $ifNull: ['$_updatedAt', false] }, { $dateToString: { date: '$_updatedAt', format: '%Y-%m-%d %H:%M:%S' } }, '' ] },
          expiryDateStr: { $cond: [{ $ifNull: ['$_expiryDate', false] }, { $dateToString: { date: '$_expiryDate', format: '%Y-%m-%d' } }, '' ] },
          lastUpdatedStr:{
            $let: {
              vars: { d: { $toDate: { $ifNull: ['$_lastUpdatedMs', null] } } },
              in: { $cond: [{ $ifNull: ['$$d', false] }, { $dateToString: { date: '$$d', format: '%Y-%m-%d %H:%M:%S' } }, '' ] }
            }
          },
          historyText: {
            $reduce: {
              input: { $ifNull: ['$history', []] },
              initialValue: '',
              in: {
                $concat: [
                  '$$value',' ',
                  { $toString: { $ifNull: ['$$this.oldAmount', ''] } },' ',
                  { $toString: { $ifNull: ['$$this.newAmount', ''] } },' ',
                  { $ifNull: ['$$this.userName', ''] },' ',
                  { $ifNull: ['$$this.reason', ''] },' ',
                  { $ifNull: ['$$this.notes', ''] },' ',
                  {
                    $let: {
                      vars: { hd: { $toDate: { $ifNull: ['$$this.changedAt', '$$this.timestamp'] } } },
                      in: { $cond: [{ $ifNull: ['$$hd', false] }, { $dateToString: { date: '$$hd', format: '%Y-%m-%d %H:%M:%S' } }, '' ] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          haystack: {
            $toLower: {
              $concat: [
                ' ', { $ifNull: ['$ean', ''] },
                ' ', { $ifNull: ['$plu', ''] },
                ' ', { $ifNull: ['$name', ''] },
                ' ', { $ifNull: ['$primaryCategory', ''] },
                ' ', { $ifNull: ['$secondaryCategory', ''] },
                ' ', { $ifNull: ['$category', ''] },
                ' ', { $ifNull: ['$sku', ''] },
                ' ', { $ifNull: ['$brand', ''] },
                ' ', { $ifNull: ['$shortDesc', ''] },
                ' ', { $ifNull: ['$longDesc', ''] },
                ' ', { $ifNull: ['$warehouse', ''] },
                ' ', { $ifNull: ['$supplier', ''] },
                ' ', { $ifNull: ['$country', ''] },
                ' ', { $ifNull: ['$visibility', ''] },
                ' ', { $ifNull: ['$dimensions', ''] },
                ' ', { $ifNull: ['$promoPrice', ''] },
                ' ', { $toString: '$_price' },
                ' ', { $toString: '$_cost' },
                ' ', { $toString: '$_amount' },
                ' ', { $toString: '$_reorderLevel' },
                ' ', { $toString: { $ifNull: ['$_weight', ''] } },
                ' ', '$statusText',
                ' ', '$profitPctText',
                ' ', '$createdAtStr',
                ' ', '$updatedAtStr',
                ' ', '$expiryDateStr',
                ' ', '$lastUpdatedStr',
                ' ', '$historyText'
              ]
            }
          }
        }
      }
    ];

    if (category) {
      pipelineBase.push({
        $match: { $or: [{ primaryCategory: category }, { secondaryCategory: category }] }
      });
    }
    if (plu) {
      pipelineBase.push({ $match: { plu } });
    }

    // Token AND-matching + scoring
    const scoreAdd = tokens.length ? [{
      $addFields: {
        // sum of regex hits for each token
        tokenHits: {
          $sum: [
            ...tokens.map(t => ({
              $size: {
                $regexFindAll: { input: '$haystack', regex: esc(t), options: 'i' }
              }
            }))
          ]
        },
        // simple boosts
        namePrefixBoost: { $cond: [{ $regexMatch: { input: { $toLower: '$name' }, regex: '^' + qEsc } }, 5, 0] },
        eanPrefixBoost:  { $cond: [{ $regexMatch: { input: { $toLower: { $ifNull: ['$ean', ''] } }, regex: '^' + qEsc } }, 10, 0] },
        pluPrefixBoost:  { $cond: [{ $regexMatch: { input: { $toLower: { $ifNull: ['$plu', ''] } }, regex: '^' + qEsc } }, 8, 0] },
        exactEanBoost:   exactEAN ? { $cond: [{ $eq: ['$ean', exactEAN] }, 1000, 0] } : 0,
        exactPluBoost:   exactPLU ? { $cond: [{ $eq: ['$plu', exactPLU] }, 600, 0] } : 0
      }
    }, {
      $addFields: {
        score: {
          $add: [
            '$tokenHits',
            '$namePrefixBoost',
            '$eanPrefixBoost',
            '$pluPrefixBoost',
            '$exactEanBoost',
            '$exactPluBoost'
          ]
        }
      }
    }] : [{
      $addFields: {
        score: {
          $add: [
            exactEAN ? { $cond: [{ $eq: ['$ean', exactEAN] }, 1000, 0] } : 0,
            exactPLU ? { $cond: [{ $eq: ['$plu', exactPLU] }, 600, 0] } : 0
          ]
        }
      }
    }];

    const matchTokens = (!exactEAN && tokens.length) ? [{
      $match: { $and: tokens.map(t => ({ haystack: { $regex: esc(t), $options: 'i' } })) }
    }] : [];

    const pipeline = [
      ...pipelineBase,
      ...matchTokens,
      ...scoreAdd
    ];

    const paged = [
      ...pipeline,
      { $sort: { score: -1, updatedAt: -1 } },   // ⬅️ best matches first
      { $skip: skip },
      { $limit: lim }
    ];

    const counted = [
      ...pipeline,
      { $count: 'total' }
    ];

    const [data, countArr] = await Promise.all([
      Product.aggregate(paged),
      Product.aggregate(counted)
    ]);

    const total = countArr?.[0]?.total || 0;
    res.json({ data, total, page: pageNum, limit: lim });
  } catch (err) {
    console.error('wide search error', err);
    next(err);
  }
});
/** Create — POST /api/products */
router.post('/', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    if (!req.body?.name) return res.status(400).json({ error: 'name is required' });

    const payload = pickUpdatableFields(req.body);
    applyIdentifierRules(payload, {
      requireAny: true
    });

    const doc = await Product.create({
      ...payload,
      shopId: req.shopId,              // 👈 add this
      updatedBy: payload.createdBy || 'system',
      category: payload.category || payload.secondaryCategory || payload.primaryCategory || '',
      isRestocked: (payload.amount || 0) > 0
    });

    res.status(201).json(doc.toJSON());
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    if (err?.code === 11000) return res.status(409).json({ error: duplicateKeyMessage(err) });
    next(err);
  }
});

/** Update — PUT /api/products/:id */
router.put('/:id', ensureObjectId, authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const payload = pickUpdatableFields(req.body);

    const doc = await Product.findOne({ _id: req.params.id, shopId: req.shopId });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    applyIdentifierRules(payload, {
      existingEan: doc.ean,
      existingPlu: doc.plu,
      requireAny: true
    });

    doc.set(payload);
    if (!payload.updatedBy) doc.updatedBy = 'system';

    await doc.save();
    res.json(doc.toJSON());
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    if (err?.code === 11000) return res.status(409).json({ error: duplicateKeyMessage(err) });
    next(err);
  }
});

/** Delete — DELETE /api/products/:id */
router.delete('/:id', ensureObjectId, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, shopId: req.shopId });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/** Stock change — PATCH /api/products/:id/stock */
/** Stock change — PATCH /api/products/:id/stock */
router.patch('/:id/stock', ensureObjectId, async (req, res, next) => {
  try {
    const { newAmount, oldAmount, reason, notes, userName } = req.body || {};

    // newAmount is required; oldAmount becomes optional
    if (newAmount === undefined || newAmount === null) {
      return res.status(400).json({ error: 'newAmount is required' });
    }

    // Scope by shopId so we never touch another shop's doc
    const doc = await Product.findOne({ _id: req.params.id, shopId: req.shopId });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // Coerce numbers and clamp
    const asInt = (v, d = 0) => {
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) ? n : d;
    };
    let newInt = asInt(newAmount, 0);
    let oldInt = (oldAmount === undefined || oldAmount === null) ? asInt(doc.amount, 0) : asInt(oldAmount, 0);
    if (newInt < 0) newInt = 0;
    if (oldInt < 0) oldInt = 0;

    // If client sent a stale oldAmount, trust server
    const serverOld = asInt(doc.amount, 0);
    if (oldAmount !== undefined && oldInt !== serverOld) {
      oldInt = serverOld;
    }

    const now = Date.now();

    // Build history entry (use changedAtMs to match schema)
    const entry = {
      timestamp: new Date(now),
      changedAtMs: now,
      userName: userName || 'system',
      oldAmount: oldInt,
      newAmount: newInt,
      reason: (reason && String(reason)) || 'N/A',
      notes: (notes && String(notes)) || 'N/A',
    };

    // Update product
    doc.amount = newInt;
    doc.updatedBy = userName || 'system';
    doc.lastUpdated = now;
    doc.lastChange = newInt - oldInt;
    doc.lastChangeTime = new Date(now).toISOString();
    doc.lastChangeReason = entry.reason;
    doc.lastChangeNotes = entry.notes;
    if (oldInt <= 0 && newInt > 0) doc.isRestocked = true;

    (doc.history ||= []).push(entry);

    await doc.save();
    res.json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});
/* -------------------- duplicates & merge -------------------- */
/** Duplicate EANs — GET /api/products/duplicates/by-ean */
router.get('/duplicates/by-ean', async (req, res, next)=> {
  try {
    const dupes = await Product.aggregate([
      { $match: { shopId: req.shopId, ean: { $exists: true, $ne: null, $ne: '' } } }, // 👈
      { $group: { _id: '$ean', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);    
    res.json(dupes);
  } catch (err) { next(err); }
});
/**
 * Delete duplicates for one EAN — keep one winner, delete the rest.
 * POST /api/products/duplicates/delete  { ean: "....", keep?: "highestStock"|"newest"|"oldest"|"first" }
 */
router.post('/duplicates/delete', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const ean = String(req.body?.ean || '').trim();
    const keep = String(req.body?.keep || 'highestStock');

    if (!ean) return res.status(400).json({ error: 'ean required' });

    const docs = await Product.find({ shopId: req.shopId, ean }).sort({ updatedAt: -1 }).lean();
    if (docs.length < 2) return res.status(400).json({ error: 'Not enough duplicates to delete' });

    const pickWinner = () => {
      const byHighestStock = [...docs].sort((a, b) =>
        (b.amount || 0) - (a.amount || 0) ||
        (b.lastUpdated || 0) - (a.lastUpdated || 0) ||
        String(a._id).localeCompare(String(b._id))
      )[0];

      if (keep === 'highestStock') return byHighestStock;
      if (keep === 'newest') return [...docs].sort((a,b) =>
        (b.lastUpdated || 0) - (a.lastUpdated || 0) ||
        String(a._id).localeCompare(String(b._id))
      )[0];
      if (keep === 'oldest') return [...docs].sort((a,b) =>
        (a.lastUpdated || 0) - (b.lastUpdated || 0) ||
        String(a._id).localeCompare(String(b._id))
      )[0];
      // 'first' fallback
      return [...docs].sort((a,b) => String(a._id).localeCompare(String(b._id)))[0];
    };

    const winner = pickWinner();
    const losers = docs.filter(d => String(d._id) !== String(winner._id));
    const loserIds = losers.map(d => d._id);

    const del  = await Product.deleteMany({ _id: { $in: loserIds }, shopId: req.shopId });

    res.json({
      keptId: winner._id,
      deletedIds: loserIds,
      deletedCount: del.deletedCount || 0
    });
  } catch (err) { next(err); }
});
/**
 * Delete duplicates for ALL EANs — keep one per group.
 * POST /api/products/duplicates/delete-all  { keep?: "highestStock"|"newest"|"oldest"|"first" }
 */
router.post('/duplicates/delete-all', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const keep = String(req.body?.keep || 'highestStock');

    const groups = await Product.aggregate([
      { $match: { shopId: req.shopId, ean: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$ean', ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    

    let totalDeleted = 0;
    const perGroup = [];

    for (const g of groups) {
      const docs = await Product.find({ _id: { $in: g.ids }, shopId: req.shopId }).lean();

      // choose winner
      const choose = () => {
        if (keep === 'newest') return [...docs].sort((a,b) =>
          (b.lastUpdated || 0) - (a.lastUpdated || 0) ||
          String(a._id).localeCompare(String(b._id))
        )[0];
        if (keep === 'oldest') return [...docs].sort((a,b) =>
          (a.lastUpdated || 0) - (b.lastUpdated || 0) ||
          String(a._id).localeCompare(String(b._id))
        )[0];
        if (keep === 'first') return [...docs].sort((a,b) =>
          String(a._id).localeCompare(String(b._id))
        )[0];
        // highestStock default
        return [...docs].sort((a,b) =>
          (b.amount || 0) - (a.amount || 0) ||
          (b.lastUpdated || 0) - (a.lastUpdated || 0) ||
          String(a._id).localeCompare(String(b._id))
        )[0];
      };

      const winner = choose();
      const losers = docs.filter(d => String(d._id) !== String(winner._id));
      const loserIds = losers.map(d => d._id);

      const del  = await Product.deleteMany({ _id: { $in: loserIds }, shopId: req.shopId });

      totalDeleted += del.deletedCount || 0;
      perGroup.push({
        ean: g._id,
        keptId: winner?._id,
        deletedIds: loserIds,
        deletedCount: del.deletedCount || 0
      });
    }

    res.json({ groupsAffected: groups.length, totalDeleted, details: perGroup });
  } catch (err) { next(err); }
});

/**
 * Merge duplicates for one EAN into a single document.
 * POST /api/products/merge/by-ean { ean: "...", keep?: "highestStock"|"newest"|"oldest"|"first", updatedBy? }
 */
router.post('/merge/by-ean', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const ean = String(req.body?.ean || '').trim();
    const keep = String(req.body?.keep || 'highestStock');
    const actor = String(req.body?.updatedBy || 'merge-tool');

    if (!ean) return res.status(400).json({ error: 'ean required' });

    const docs = await Product.find({ shopId: req.shopId, ean }).lean(); // 👈

    if (docs.length < 2) return res.status(400).json({ error: 'Not enough duplicates to merge' });

    const chooseWinner = () => {
      if (keep === 'newest') return [...docs].sort((a,b) =>
        (b.lastUpdated || 0) - (a.lastUpdated || 0) ||
        String(a._id).localeCompare(String(b._id))
      )[0];
      if (keep === 'oldest') return [...docs].sort((a,b) =>
        (a.lastUpdated || 0) - (b.lastUpdated || 0) ||
        String(a._id).localeCompare(String(b._id))
      )[0];
      if (keep === 'first') return [...docs].sort((a,b) =>
        String(a._id).localeCompare(String(b._id))
      )[0];
      // default: highest stock
      return [...docs].sort((a,b) =>
        (b.amount || 0) - (a.amount || 0) ||
        (b.lastUpdated || 0) - (a.lastUpdated || 0) ||
        String(a._id).localeCompare(String(b._id))
      )[0];
    };

    const winner = chooseWinner();
    const losers = docs.filter(d => String(d._id) !== String(winner._id));
    const loserIds = losers.map(d => d._id);

    // helpers
    const firstNonEmpty = (...vals) =>
      vals.find(v => v !== undefined && v !== null && String(v).trim?.() !== '');

    const latestNonZero = (pairs) => {
      const filtered = pairs
        .filter(p => p && p.val !== undefined && p.val !== null && Number(p.val) !== 0)
        .sort((a, b) => (b.t || 0) - (a.t || 0));
      return filtered.length ? filtered[0].val : undefined;
    };

    // merge numbers
    const amountSum = docs.reduce((s, d) => s + (d.amount || 0), 0);
    const reorderMax = Math.max(...docs.map(d => (d.reorderLevel ?? 10)));

    const priceLatest  = latestNonZero(docs.map(d => ({ val: d.price,  t: d.lastUpdated })));
    const costLatest   = latestNonZero(docs.map(d => ({ val: d.cost,   t: d.lastUpdated })));
    const weightLatest = latestNonZero(docs.map(d => ({ val: d.weight, t: d.lastUpdated })));

    const fill = (k) => firstNonEmpty(winner[k], ...losers.map(l => l[k]));

    const primary   = fill('primaryCategory');
    const secondary = fill('secondaryCategory');
    const mergedCategory = secondary || primary || '';

    // merge history (sort newest first, avoiding ?? + || mix)
    const allHistory = docs.flatMap(d => Array.isArray(d.history) ? d.history : []);
    allHistory.sort((a, b) => {
      const bt = (b.changedAt !== undefined && b.changedAt !== null)
        ? b.changedAt
        : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      const at = (a.changedAt !== undefined && a.changedAt !== null)
        ? a.changedAt
        : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      return (bt || 0) - (at || 0);
    });
    const now = Date.now();
    const update = {
      amount: amountSum,
      reorderLevel: reorderMax,
      price:  priceLatest  ?? (winner.price  || 0),
      cost:   costLatest   ?? (winner.cost   || 0),
      weight: weightLatest ?? (winner.weight || 0),
      primaryCategory: primary || undefined,
      secondaryCategory: secondary || undefined,
      category: mergedCategory,
      ean,
      name: fill('name'),
      sku: fill('sku'),
      brand: fill('brand'),
      shortDesc: fill('shortDesc'),
      longDesc: fill('longDesc'),
      promoPrice: fill('promoPrice'),
      taxClass: (winner.taxClass !== undefined && winner.taxClass !== null)
        ? winner.taxClass
        : firstNonEmpty(...losers.map(l => l.taxClass)),
      dimensions: fill('dimensions'),
      warehouse: fill('warehouse'),
      supplier: fill('supplier'),
      country: fill('country'),
      metaTitle: fill('metaTitle'),
      metaDesc: fill('metaDesc'),
      visibility: fill('visibility'),
      lastUpdated: now,
      updatedBy: actor,
      isRestocked: docs.some(d => d.isRestocked),
      lastChange: amountSum - (winner.amount || 0),
      lastChangeTime: new Date().toLocaleString(),
      lastChangeReason: 'merge-duplicates',
      lastChangeNotes: `Merged ${losers.length} duplicate(s) for EAN ${ean}`,
      history: allHistory
    };
    await Product.updateOne({ _id: winner._id, shopId: req.shopId }, { $set: update }); // 👈
    const delRes = await Product.deleteMany({ _id: { $in: loserIds }, shopId: req.shopId });
const merged = await Product.findOne({ _id: winner._id, shopId: req.shopId }).lean();
res.json({
  merged,
  deletedIds: loserIds,
  deletedCount: delRes.deletedCount || 0
});
  } catch (err) { next(err); }
});



/* -------------------- bulk import/export/metrics/reset -------------------- */
/** Bulk import — POST /api/products/bulk */
router.post('/bulk', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (!items.length) return res.status(400).json({ error: 'Expected JSON array of products' });
    const docs = items.map(raw => {
      const p = {
        ...raw,
        price: asNumDecimal(raw.price, 0),
        cost: asNumDecimal(raw.cost, 0),
        weight: asNumDecimal(raw.weight, 0),
        amount: asInt(raw.amount, 0),
        reorderLevel: asInt(raw.reorderLevel, 10),
        promoPrice: raw.promoPrice,
        taxClass: (raw.taxClass === '' || raw.taxClass === undefined) ? undefined : asNumDecimal(raw.taxClass),
      };
      const picked = pickUpdatableFields(p);
      applyIdentifierRules(picked, {
        requireAny: true
      });
      return {
        ...picked,
        shopId: req.shopId,            // 👈 add this
        updatedBy: picked.createdBy || 'system',
        category: picked.secondaryCategory || picked.primaryCategory || '',
        isRestocked: (picked.amount || 0) > 0,
        history: Array.isArray(raw.history) ? raw.history : [],
      };
    }).filter(d => d.name);
    if (!docs.length) return res.status(400).json({ error: 'No valid rows to import' });
    const created = await Product.insertMany(docs, { ordered: false });
    res.status(201).json({ inserted: created.length });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    if (err?.code === 11000) return res.status(409).json({ error: duplicateKeyMessage(err) });
    if (err.writeErrors?.length) {
      return res.status(201).json({ inserted: err.result?.nInserted || 0, partial: true });
    }
    next(err);
  }
});
/** CSV export — GET /api/products/export.csv */
router.get('/export.csv', async (req, res, next) => {
  try {
    const headers = [
      'ean','plu','name','price','cost','weight','amount','primaryCategory','secondaryCategory',
      'reorderLevel','sku','brand','shortDesc','longDesc','promoPrice','taxClass','dimensions',
      'warehouse','supplier','country','metaTitle','metaDesc','visibility'
    ];
    const all = await Product.find({ shopId: req.shopId }).select(headers.join(' ')).lean(); // 👈
    const esc = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [headers.join(',')].concat(
      all.map(p => headers.map(h => esc(p[h])).join(','))
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
    res.send(rows.join('\n'));
  } catch (err) { next(err); }
});
//1234
/** Metrics — GET /api/products/metrics */
router.get('/metrics', async (req, res, next) => {
  try {
    const [m] = await Product.aggregate([
      { $match: { shopId: req.shopId } },
      {
        $project: {
          amount:       { $ifNull: ['$amount', 0] },
          reorderLevel: { $ifNull: ['$reorderLevel', 10] },
          price:        { $ifNull: ['$price', 0] },
          cost:         { $ifNull: ['$cost', 0] },
          weight:       { $ifNull: ['$weight', 0] },
          isRestocked:  { $ifNull: ['$isRestocked', false] },
          // derive restock by history (any entry crossing 0 -> >0)
          restockedByHistory: {
            $anyElementTrue: {
              $map: {
                input: { $ifNull: ['$history', []] },
                as: 'h',
                in: {
                  $and: [
                    { $lte: [{ $ifNull: ['$$h.oldAmount', 0] }, 0] },
                    { $gt:  [{ $ifNull: ['$$h.newAmount', 0] }, 0] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalProducts:      { $sum: 1 },
          totalStockQuantity: { $sum: '$amount' },
          totalCostValue:     { $sum: { $multiply: ['$amount', '$cost'] } },
          totalSalesValue:    { $sum: { $multiply: ['$amount', '$price'] } },
          totalWeightKg:      { $sum: { $divide: [{ $multiply: ['$amount', '$weight'] }, 1000] } },
          lowStockItems:      { $sum: { $cond: [{ $lte: ['$amount', '$reorderLevel'] }, 1, 0] } },
          restockedItems:     { $sum: { $cond: [{ $or: ['$isRestocked', '$restockedByHistory'] }, 1, 0] } }
        }
      }
    ]);
    res.json(m || {
      totalProducts: 0,
      totalStockQuantity: 0,
      totalCostValue: 0,
      totalSalesValue: 0,
      totalWeightKg: 0,
      lowStockItems: 0,
      restockedItems: 0
    });
  } catch (err) { next(err); }
});

/** Danger reset — DELETE /api/products/reset/all */
// DELETE /api/products/reset/all
router.delete('/reset/all', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const r = await Product.deleteMany({ shopId: req.shopId });
    return res.json({ deleted: r.deletedCount || 0 });
  } catch (err) {
    console.error('DELETE /api/products/reset/all failed:', err); // <— add this
    next(err);
  }
});
/** Bulk delete — POST /api/products/bulk-delete { ids: [] } */
router.post('/bulk-delete', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ error: 'ids[] required' });
    const r = await Product.deleteMany({ _id: { $in: ids }, shopId: req.shopId }); 
    res.json({ deleted: r.deletedCount || 0 });
  } catch (err) { next(err); }
});
/**
 * POST /api/products/picture/by-ean/:ean
 * Body: multipart/form-data with field "picture"
 * Saves file, updates Product.pictureUrl & pictureMime, and returns { url }.
 */
router.post('/picture/by-ean/:ean', authorizeRoles('admin', 'manager'), upload.single('picture'), async (req, res, next) => {
  try {
    const ean = String(req.params.ean || '').trim();
    if (!ean) return res.status(400).json({ error: 'ean required' });
    if (!req.file) return res.status(400).json({ error: 'picture file required' });
    const doc = await Product.findOne({ shopId: req.shopId, ean });  // 👈 fix
    if (!doc) return res.status(404).json({ error: 'Product not found for this EAN in this shop' });
    const relUrl = `/uploads/products/${encodeURIComponent(req.shopId)}/${req.file.filename}`;
    doc.pictureUrl = relUrl;
    doc.pictureMime = req.file.mimetype;
    await doc.save();
    res.json({ url: relUrl });
  } catch (err) { next(err); }
});
/**
 * GET /api/products/picture/by-ean/:ean
 * Sends the image file if present; 204 if not set.
 */
router.get('/picture/by-ean/:ean', async (req, res, next) => {
  try {
    const ean = String(req.params.ean || '').trim();
    const doc = await Product.findOne({ shopId: req.shopId, ean }).lean(); // 👈
    if (!doc || !doc.pictureUrl) return res.status(204).end();
    const abs = path.join(process.cwd(), doc.pictureUrl.replace(/^\/+/, ''));
    if (!fs.existsSync(abs)) return res.status(404).json({ error: 'Picture not found on disk' });
    res.type(doc.pictureMime || 'image/*');
    fs.createReadStream(abs).pipe(res);
  } catch (err) { next(err); }
});
export default router;
