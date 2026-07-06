// controllers/medicalStoreController.js
import MedicalStore from '../model/MedicalstoreManagementModel.js';
import bcrypt from 'bcrypt';

// ✅ Helper – matches static route "/imgUploads"
const getFileUrls = (files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => `/imgUploads/${file.filename}`);
};

// ---------------------------
// 1. ADD a new medical store (with shopid)
// ---------------------------
export const addMedicalStore = async (req, res) => {
  try {
    const {
      storeName,
      shopid,                 // ✅ NEW: Medisoft shop ID
      latitude,
      longitude,
      searchLocation,
      address,
      status,
      vendorCategory,
      pincode,
      emailAddress,
      password,
      drugLicenseNumber,
      gstNumber,
      contactNumber,
      pharmacistName,
    } = req.body;

    // --- Required fields validation ---
    if (!storeName || storeName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Store name is required' });
    }

    // Parse latitude/longitude (they come as strings from FormData)
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude must be valid numbers' });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    // --- Optional fields ---
    let hashedPassword = undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const thumbnailUrls = getFileUrls(req.files);

    const newStore = new MedicalStore({
      storeName: storeName.trim(),
      shopid: shopid?.trim() || '',          // ✅ Save shopid if provided
      latitude: lat,
      longitude: lng,
      searchLocation: searchLocation?.trim() || '',
      address: address?.trim() || '',
      status: status || 'pending',
      vendorCategory: vendorCategory || undefined,
      pincode: pincode?.trim() || undefined,
      emailAddress: emailAddress?.trim() || undefined,
      password: hashedPassword,
      drugLicenseNumber: drugLicenseNumber?.trim() || undefined,
      gstNumber: gstNumber?.trim() || undefined,
      contactNumber: contactNumber?.trim() || undefined,
      pharmacistName: pharmacistName?.trim() || undefined,
      thumbnailImages: thumbnailUrls,
    });

    const savedStore = await newStore.save();
    // Remove password from response
    const { password: _, ...storeWithoutPassword } = savedStore.toObject();
    res.status(201).json({ success: true, data: storeWithoutPassword });
  } catch (error) {
    console.error('Error adding medical store:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------
// 2. EDIT (update) an existing store (with shopid)
// ---------------------------
// controllers/medicalStoreController.js

// ... (other functions remain the same)

// ---------------------------
// 2. EDIT (update) an existing store (with shopid)
// ---------------------------
export const updateMedicalStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // ✅ Allow 'shopid' to be updated
    const allowedUpdates = [
      'storeName',
      'shopid',                // ✅ ADD THIS
      'searchLocation',
      'latitude',
      'longitude',
      'address',
      'status',
      'vendorCategory',
      'pincode',
      'emailAddress',
      'thumbnailImages',
      'drugLicenseNumber',
      'gstNumber',
      'contactNumber',
      'pharmacistName',
      'password',
    ];

    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key];
      }
    }

    // If password is being updated, hash it
    if (filteredUpdates.password) {
      filteredUpdates.password = await bcrypt.hash(filteredUpdates.password, 10);
    }

    const updatedStore = await MedicalStore.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Medical store not found' });
    }

    // Remove password from response
    const { password: _, ...storeWithoutPassword } = updatedStore.toObject();
    res.status(200).json({ success: true, data: storeWithoutPassword });
  } catch (error) {
    console.error('Error updating medical store:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------
// 3. DELETE a medical store (unchanged)
// ---------------------------
export const deleteMedicalStore = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStore = await MedicalStore.findByIdAndDelete(id);

    if (!deletedStore) {
      return res.status(404).json({ success: false, message: 'Medical store not found' });
    }

    res.status(200).json({ success: true, message: 'Medical store deleted successfully', data: deletedStore });
  } catch (error) {
    console.error('Error deleting medical store:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------
// 4. GET all stores (unchanged)
// ---------------------------
export const getAllMedicalStores = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const stores = await MedicalStore.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await MedicalStore.countDocuments(filter);

    // Remove passwords from each store
    const storesWithoutPassword = stores.map(store => {
      const { password, ...rest } = store.toObject();
      return rest;
    });

    res.status(200).json({
      success: true,
      data: storesWithoutPassword,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching medical stores:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------
// 5. GET a single store by ID (unchanged)
// ---------------------------
export const getMedicalStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await MedicalStore.findById(id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Medical store not found' });
    }

    const { password, ...storeWithoutPassword } = store.toObject();
    res.status(200).json({ success: true, data: storeWithoutPassword });
  } catch (error) {
    console.error('Error fetching medical store:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};