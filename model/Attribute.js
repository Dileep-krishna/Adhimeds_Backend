import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  values: { type: [String], required: true }
}, { timestamps: true });

// Remove the pre-save hook entirely for now
// attributeSchema.pre('save', function(next) { next(); }); // not needed

export default mongoose.models.Attribute || mongoose.model('Attribute', attributeSchema);