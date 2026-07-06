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
        status: {
          type: String,
          enum: ['pending', 'processing', 'completed', 'cancelled', 'assigned'],
          default: 'pending',
        },
        // ✅ ADD THIS: Store which delivery boy is assigned
        assignedTo: {
          type: String,
          default: '',
        },
      },
    ],
    total: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled', 'assigned'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);