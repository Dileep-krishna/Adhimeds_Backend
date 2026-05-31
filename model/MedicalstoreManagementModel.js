import mongoose from "mongoose";

const medicalStoreSchema = new mongoose.Schema(
  {
    // Store Name (required, as shown in form with *)
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },

    // Search location entered by user (city, landmark, address)
    searchLocation: {
      type: String,
      trim: true,
      required: [true, 'Search location is required'],
    },

    // Exact coordinates from map marker
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    // Auto-filled address from geocoding service
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Status field with allowed values (active, inactive, pending)
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',          // default to pending until verified/approved
      required: true,
    },
  },
  {
    timestamps: true,               // automatically adds createdAt & updatedAt
  }
);

// Optional: Create a geospatial index for location-based queries (e.g., nearby stores)
medicalStoreSchema.index({ latitude: 1, longitude: 1 });

// If you prefer a GeoJSON point field for advanced spatial queries (e.g., $nearSphere):
// Uncomment the following block and remove latitude/longitude fields above.
/*
medicalStoreSchema.add({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});
medicalStoreSchema.index({ location: '2dsphere' });
*/

const MedicalStore = mongoose.model('MedicalStore', medicalStoreSchema);
export default MedicalStore;