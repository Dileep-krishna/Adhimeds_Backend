import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    items: [
      {
        productName: String,
        storeName: String,
        mrp: Number,
        rate: Number,
        quantity: Number,
        stock: Number,
        qtyPerBox: Number,
        company: String,
        hsn: String,
        batch: String,
        expiry: String,
        pack: String,
        scheme: String,
        gst: String,
        status: {                              // ✅ New per‑item status
          type: String,
          enum: ['pending', 'processing', 'completed', 'cancelled'],
          default: 'pending',
        },
      },
    ],
    total: Number,
    status: {                                 // Overall order status (optional)
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);