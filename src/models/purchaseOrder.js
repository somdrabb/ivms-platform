// src/models/purchaseOrder.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const PurchaseItemSchema = new Schema(
  {
    productId: { type: String, trim: true },
    productName: { type: String, trim: true },
    quantity: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 }
  },
  { _id: false }
);

const PurchaseAttachmentSchema = new Schema({
  filename: { type: String, required: true, trim: true },
  originalName: { type: String, trim: true },
  mimeType: { type: String, trim: true },
  size: { type: Number, default: 0 },
  url: { type: String, trim: true },
  uploadedAt: { type: Date, default: Date.now }
});

const PurchaseOrderSchema = new Schema(
  {
    shopId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    status: {
      type: String,
      trim: true,
      enum: ['draft', 'ordered', 'received', 'cancelled'],
      default: 'draft'
    },
    warehouseId: { type: String, trim: true },
    expectedDate: { type: Date },
    receivedAt: { type: Date },
    trackingNumber: { type: String, trim: true },
    totalItems: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    items: { type: [PurchaseItemSchema], default: [] },
    attachments: { type: [PurchaseAttachmentSchema], default: [] },
    createdBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

PurchaseOrderSchema.index({ shopId: 1, orderNumber: 1 }, { unique: true });

export const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema);
