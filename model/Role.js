import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  actions: [{ type: String, required: true }]
});

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Pharmacist', 'Store Manager', 'Delivery Coordinator', 'Customer Support', 'Accountant', 'Admin']
  },
  permissions: [permissionSchema]
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
export default Role;