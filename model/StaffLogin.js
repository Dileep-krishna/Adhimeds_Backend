import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const ROLES = ['DELIVERY BOY', 'ADMIN', 'PHARMACIST', 'DELIVERY HEAD'];

// 🧨 Force delete old model (important)
delete mongoose.models.StaffLogin;

const staffLoginSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2 },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9\s\-\(\)]{10,15}$/, 'Invalid phone']
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      required: true,
      enum: ROLES
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalStore'
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },

    joiningDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// 🧨 CLEAR ALL INDEXES FIRST
staffLoginSchema.clearIndexes();

// ✅ ADD ONLY WHAT YOU NEED
staffLoginSchema.index({ email: 1 }, { unique: true });
staffLoginSchema.index({ role: 1 });
staffLoginSchema.index({ status: 1 });

// 🔐 Password hash
staffLoginSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare password
staffLoginSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

console.log("🔥 StaffLogin model loaded");
console.log("INDEXES:", staffLoginSchema.indexes());
const StaffLogin = mongoose.model('StaffLogin', staffLoginSchema);

export default StaffLogin;