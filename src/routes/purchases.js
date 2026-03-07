// src/routes/purchases.js
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { PurchaseOrder } from '../models/purchaseOrder.js';
import { normalizePurchaseItems, computePurchaseTotals } from '../utils/purchaseItems.js';
import { requireAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const uploadRoot = path.join(process.cwd(), 'uploads', 'purchases');
fs.mkdirSync(uploadRoot, { recursive: true });

const ALLOWED_ATTACHMENT_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const attachmentStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const orderId = String(req.params.id || 'general');
    const dir = path.join(uploadRoot, orderId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${sanitized}`);
  }
});

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_ATTACHMENT_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type'));
  }
});

const removeUploadedFiles = async (files = []) => {
  await Promise.all(files.map(file => fs.promises.unlink(file.path).catch(() => {})));
};

const asInt = (value, defaultValue = 0) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) ? num : defaultValue;
};

const asFloat = (value, defaultValue = 0) => {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : defaultValue;
};

const trimValue = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const safeISODate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

function ensureObjectId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid purchase order id' });
  }
  next();
}

router.use(requireAuth);
router.use((req, _res, next) => {
  req.shopId = String(req.query.shop || req.get('X-Shop-ID') || 'shop-1');
  next();
});

const normalizeAttachment = (attachment = {}, orderId) => {
  const url = attachment.url || `/uploads/purchases/${orderId}/${attachment.filename || ''}`;
  const uploadedAt = attachment.uploadedAt instanceof Date
    ? attachment.uploadedAt.getTime()
    : (attachment.uploadedAt ? new Date(attachment.uploadedAt).getTime() : null);
  const identifier = attachment._id ? String(attachment._id) : (attachment.id ? String(attachment.id) : undefined);
  return {
    _id: identifier,
    id: identifier,
    filename: attachment.filename || '',
    originalName: attachment.originalName || '',
    mimeType: attachment.mimeType || '',
    size: Number(attachment.size) || 0,
    url,
    uploadedAt
  };
};

const normalizeOrder = (order = {}) => {
  const out = { ...order };
  out.id = order._id || order.id;
  out.orderNumber = trimValue(order.orderNumber) || '';
  out.supplier = trimValue(order.supplier) || '';
  out.status = trimValue(order.status) || 'draft';
  out.warehouseId = trimValue(order.warehouseId) || '';
  out.expectedDate = order.expectedDate instanceof Date ? order.expectedDate.getTime() : (order.expectedDate ? new Date(order.expectedDate).getTime() : null);
  out.receivedAt = order.receivedAt instanceof Date ? order.receivedAt.getTime() : (order.receivedAt ? new Date(order.receivedAt).getTime() : null);
  out.trackingNumber = trimValue(order.trackingNumber) || '';
  out.createdAt = order.createdAt instanceof Date ? order.createdAt.getTime() : order.createdAt;
  out.updatedAt = order.updatedAt instanceof Date ? order.updatedAt.getTime() : order.updatedAt;
  out.totalItems = Number(order.totalItems) || 0;
  out.totalCost = Number(order.totalCost) || 0;
  out.items = Array.isArray(order.items) ? order.items : [];
  const attachments = Array.isArray(order.attachments) ? order.attachments : [];
  out.attachments = attachments.map(att => normalizeAttachment(att, out.id));
  return out;
};

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, asInt(req.query.page, 1));
    const limit = Math.min(200, Math.max(1, asInt(req.query.limit, 50)));
    const sortField = String(req.query.sort || 'createdAt');
    const sortDir = String(req.query.dir || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const filter = { shopId: req.shopId };
    const status = trimValue(req.query.status);
    if (status) filter.status = status;
    const supplier = trimValue(req.query.supplier);
    if (supplier) filter.supplier = new RegExp(supplier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(filter)
    ]);

    res.json({ data: orders.map(normalizeOrder), total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid purchase order id' });
    }
    const order = await PurchaseOrder.findOne({ _id: id, shopId: req.shopId }).lean();
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(normalizeOrder(order));
  } catch (err) {
    next(err);
  }
});

router.post('/', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const body = req.body || {};
    const orderNumber = trimValue(body.orderNumber);
    const supplier = trimValue(body.supplier);
    if (!orderNumber) return res.status(400).json({ error: 'Order number is required.' });
    if (!supplier) return res.status(400).json({ error: 'Supplier is required.' });

    const status = ['draft', 'ordered', 'received', 'cancelled'].includes(body.status) ? body.status : 'draft';
    const items = normalizePurchaseItems(body.items);
    let totalItems = asInt(body.totalItems, 0);
    let totalCost = asFloat(body.totalCost, 0);
    if (items.length) {
      const totals = computePurchaseTotals(items);
      totalItems = totals.totalItems;
      totalCost = totals.totalCost;
    }
    totalItems = Math.max(0, totalItems);
    totalCost = Math.max(0, totalCost);
    const trackingNumber = trimValue(body.trackingNumber);
    const receivedAt = status === 'received'
      ? (safeISODate(body.receivedAt) || new Date())
      : null;

    const doc = await PurchaseOrder.create({
      shopId: req.shopId,
      orderNumber,
      supplier,
      status,
      warehouseId: trimValue(body.warehouseId),
      expectedDate: safeISODate(body.expectedDate) || undefined,
      receivedAt: receivedAt || undefined,
      trackingNumber,
      totalItems,
      totalCost,
      notes: trimValue(body.notes),
      items,
      createdBy: trimValue(body.createdBy) || body.updatedBy || 'system',
      updatedBy: trimValue(body.updatedBy) || body.createdBy || 'system'
    });

    res.status(201).json(normalizeOrder(doc.toObject()));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Order number already exists.' });
    }
    next(err);
  }
});

router.put('/:id', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid purchase order id' });
    }
    const body = req.body || {};
    const doc = await PurchaseOrder.findOne({ _id: id, shopId: req.shopId });
    if (!doc) return res.status(404).json({ error: 'Purchase order not found' });

    if (doc.status === 'cancelled' && body.status && body.status !== 'cancelled') {
      return res.status(400).json({ error: 'Cancelled purchase orders cannot change status.' });
    }

    if (body.orderNumber !== undefined) {
      const nextOrderNumber = trimValue(body.orderNumber);
      if (nextOrderNumber) doc.orderNumber = nextOrderNumber;
    }
    if (body.supplier !== undefined) doc.supplier = trimValue(body.supplier) || doc.supplier;
    if (body.status !== undefined && ['draft', 'ordered', 'received', 'cancelled'].includes(body.status)) doc.status = body.status;
    if (body.expectedDate !== undefined) doc.expectedDate = safeISODate(body.expectedDate);
    if (body.notes !== undefined) doc.notes = trimValue(body.notes);
    if (body.warehouseId !== undefined) doc.warehouseId = trimValue(body.warehouseId);
    if (body.trackingNumber !== undefined) doc.trackingNumber = trimValue(body.trackingNumber);

    if (body.items !== undefined) {
      const items = normalizePurchaseItems(body.items);
      doc.items = items;
      if (items.length) {
        const totals = computePurchaseTotals(items);
        doc.totalItems = totals.totalItems;
        doc.totalCost = totals.totalCost;
      } else {
        if (body.totalItems !== undefined) doc.totalItems = asInt(body.totalItems, 0);
        if (body.totalCost !== undefined) doc.totalCost = asFloat(body.totalCost, 0);
      }
    } else {
      if (body.totalItems !== undefined) doc.totalItems = asInt(body.totalItems, 0);
      if (body.totalCost !== undefined) doc.totalCost = asFloat(body.totalCost, 0);
    }

    doc.totalItems = Math.max(0, Number(doc.totalItems) || 0);
    doc.totalCost = Math.max(0, Number(doc.totalCost) || 0);

    const nextStatus = doc.status;
    if (nextStatus === 'received') {
      const receivedOverride = body.receivedAt !== undefined ? safeISODate(body.receivedAt) : doc.receivedAt;
      doc.receivedAt = receivedOverride || doc.receivedAt || new Date();
    } else if (body.receivedAt !== undefined) {
      doc.receivedAt = safeISODate(body.receivedAt);
    } else {
      doc.receivedAt = null;
    }

    doc.updatedBy = trimValue(body.updatedBy) || 'system';

    await doc.save();
    res.json(normalizeOrder(doc.toObject()));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Order number already exists.' });
    }
    next(err);
  }
});

router.post('/:id/attachments', authorizeRoles('admin', 'manager'), ensureObjectId, attachmentUpload.array('files', 10), async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    const order = await PurchaseOrder.findOne({ _id: id, shopId: req.shopId });
    if (!order) {
      await removeUploadedFiles(files);
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (!files.length) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    if (order.attachments.length + files.length > 10) {
      await removeUploadedFiles(files);
      return res.status(400).json({ error: 'Maximum of 10 attachments per purchase order.' });
    }

    const entries = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/purchases/${id}/${file.filename}`,
      uploadedAt: new Date()
    }));

    order.attachments.push(...entries);
    await order.save();

    res.status(201).json({ attachments: order.attachments.map(att => normalizeAttachment(att, order._id)) });
  } catch (err) {
    if (Array.isArray(req.files) && req.files.length) {
      await removeUploadedFiles(req.files);
    }
    next(err);
  }
});

router.delete('/:id/attachments/:attachmentId', authorizeRoles('admin', 'manager'), ensureObjectId, async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;
    const order = await PurchaseOrder.findOne({ _id: id, shopId: req.shopId });
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });

    const attachment = order.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.join(uploadRoot, id, attachment.filename || '');
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') console.warn('Attachment delete warning:', err);
    }

    attachment.remove();
    await order.save();

    res.json({ attachments: order.attachments.map(att => normalizeAttachment(att, order._id)) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid purchase order id' });
    }
    const deleted = await PurchaseOrder.findOneAndDelete({ _id: id, shopId: req.shopId }).lean();
    if (!deleted) return res.status(404).json({ error: 'Purchase order not found' });
    const dir = path.join(uploadRoot, id);
    try {
      await fs.promises.rm(dir, { recursive: true, force: true });
    } catch (_err) {
      // ignore cleanup errors
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
