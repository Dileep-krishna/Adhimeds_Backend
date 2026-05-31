import mongoose from 'mongoose';

const staffMemberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[0-9\s\-\(\)]{10,15}$/, 'Please enter a valid phone number'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',               // ✅ References the Role model
      required: [true, 'Role is required'],
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalStore',
      required: false,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Indexes
staffMemberSchema.index({ storeId: 1 });
staffMemberSchema.index({ status: 1 });

const StaffMember = mongoose.model('StaffMember', staffMemberSchema);
export default StaffMember;