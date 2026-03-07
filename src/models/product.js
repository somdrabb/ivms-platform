// src/models/product.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

/* ---------- Subdocument: stock history ---------- */
const HistorySchema = new Schema(
  {
    timestamp:   { type: Date, default: Date.now },   // ISO date
    changedAtMs: { type: Number, default: () => Date.now() }, // numeric ms for fast sort
    userName:    { type: String, trim: true },
    oldAmount:   { type: Number, default: 0 },
    newAmount:   { type: Number, default: 0 },
    reason:      { type: String, trim: true },
    notes:       { type: String, trim: true },
  },
  { _id: false }
);
/* ---------- Product ---------- */
const ProductSchema = new Schema(
  {
    // inside ProductSchema definition:
pictureUrl:  { type: String, trim: true },   // e.g. "/uploads/products/0123456789-...jpg"
pictureMime: { type: String, trim: true },
shopId: { type: String, required: true, index: true },

    ean:   { type: String, trim: true },
    plu:   {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 3,
      validate: {
        validator: (v) => v == null || v === '' || /^\d{1,3}$/.test(v),
        message: 'PLU must be 1-3 digits'
      }
    },
    name:  { type: String, required: true, maxlength: 100, trim: true, index: true },
    price: { type: Number, default: 0 },
    cost:  { type: Number, default: 0 },
    weight:{ type: Number, default: 0 },
    amount:{ type: Number, default: 0 },

    primaryCategory:   { type: String, trim: true },
    secondaryCategory: { type: String, trim: true },
    category:          { type: String, trim: true }, // derived: secondary || primary

    reorderLevel: { type: Number, default: 10 },
    sku:         { type: String, trim: true },
    brand:       { type: String, trim: true },
    shortDesc:   { type: String, trim: true },
    longDesc:    { type: String, trim: true },
    promoPrice:  { type: String, trim: true },
    taxClass:    { type: Number },
    dimensions:  { type: String, trim: true },
    warehouse:   { type: String, trim: true },
    supplier:    { type: String, trim: true },
    country:     { type: String, trim: true },
    metaTitle:   { type: String, trim: true },
    metaDesc:    { type: String, trim: true },
    visibility:  { type: String, trim: true },

    createdBy:   { type: String, trim: true },
    updatedBy:   { type: String, trim: true },

    // UI helpers (derived)
    lastChange:       { type: Number },   // delta of last stock change
    lastChangeTime:   { type: String },
    lastChangeReason: { type: String, trim: true },
    lastChangeNotes:  { type: String, trim: true },
    isRestocked:      { type: Boolean, default: false },
    
    // ms mirrors for the UI
    createdAtMs: { type: Number },
    updatedAtMs: { type: Number },

    history: { type: [HistorySchema], default: [] },
  },
  {
    timestamps: true,     // adds createdAt (Date) & updatedAt (Date)
    minimize: false,
    versionKey: false
  }
);

/* ---------- Indexes ---------- */
ProductSchema.index(
  { shopId: 1, ean: 1 },
  {
    unique: true,
    partialFilterExpression: { ean: { $exists: true, $ne: '' } }
  }
);
ProductSchema.index(
  { shopId: 1, plu: 1 },
  {
    unique: true,
    partialFilterExpression: { plu: { $exists: true, $ne: '' } }
  }
);
ProductSchema.index({ name: 'text' });
ProductSchema.index({ primaryCategory: 1, secondaryCategory: 1 });
ProductSchema.index({ updatedAt: -1 });

/* ---------- Hooks ---------- */
function num(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; }

ProductSchema.pre('validate', function(next) {
  if (typeof this.ean === 'string') {
    this.ean = this.ean.trim();
    if (!this.ean) this.ean = undefined;
  }
  if (typeof this.plu === 'string') {
    this.plu = this.plu.trim();
    if (!this.plu) this.plu = undefined;
  }
  const hasEan = typeof this.ean === 'string' && this.ean.length > 0;
  const hasPlu = typeof this.plu === 'string' && this.plu.length > 0;
  if (!hasEan && !hasPlu) {
    this.invalidate('ean', 'Either EAN or PLU is required');
    this.invalidate('plu', 'Either EAN or PLU is required');
  }
  this.price        = num(this.price, 0);
  this.cost         = num(this.cost, 0);
  this.weight       = num(this.weight, 0);
  this.amount       = Number.isFinite(this.amount) ? this.amount : 0;
  this.reorderLevel = Number.isFinite(this.reorderLevel) ? this.reorderLevel : 10;
  if (!this.category) this.category = this.secondaryCategory || this.primaryCategory || '';
  next();
});

ProductSchema.pre('save', function(next) {
  const nowMs = Date.now();
  if (!this.createdAtMs && this.createdAt) this.createdAtMs = +this.createdAt;
  this.updatedAtMs = +this.updatedAt || nowMs;

  const last = Array.isArray(this.history) && this.history.length
    ? this.history[this.history.length - 1]
    : null;
  if (last) {
    this.lastChange = num(last.newAmount,0) - num(last.oldAmount,0);
    if (!last.changedAtMs) last.changedAtMs = nowMs;
    this.lastChangeTime   = this.updatedAt?.toISOString?.() ?? new Date().toISOString();
    this.lastChangeReason = last.reason || this.lastChangeReason;
    this.lastChangeNotes  = last.notes  || this.lastChangeNotes;
    this.isRestocked      = this.lastChange > 0 || this.isRestocked;
  }
  next();
});

/* ---------- Clean JSON ---------- */
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export const Product = mongoose.model('Product', ProductSchema);
