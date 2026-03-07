// src/models/shop.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ShopSchema = new Schema(
  {
    shopId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ShopSchema.index({ name: 1 }, { unique: false });

export const Shop = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);