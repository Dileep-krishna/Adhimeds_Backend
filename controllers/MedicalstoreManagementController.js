// controllers/medicalStoreController.js
import MedicalStore from '../model/MedicalstoreManagementModel.js'; // adjust extension if needed (.js or .ts)

// ---------------------------
// 1. ADD a new medical store
// ---------------------------
export const addMedicalStore = async (req, res) => {
  try {
    const { storeName, searchLocation, latitude, longitude, address, status } = req.body;

    if (!storeName || !searchLocation || latitude === undefined || longitude === undefined || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newStore = new MedicalStore({
      storeName,
      searchLocation,
      latitude,
      longitude,
      address,
      status: status || 'pending',
    });

    const savedStore = await newStore.save();
    res.status(201).json({ success: true, data: savedStore });
  } catch (error) {
    console.error('Error adding medical store:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------
// 2. EDIT (update) an existing store
// ---------------------------
export const updateMedicalStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const allowedUpdates = ['storeName', 'searchLocation', 'latitude', 'longitude', 'address', 'status'];
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key];
      }
    }

    const updatedStore = await MedicalStore.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Medical store not found' });
    }

    res.status(200).json({ success: true, data: updatedStore });
  } catch (error) {
    console.error('Error updating medical store:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ---------------------------
// 3. DELETE a medical store
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
// 4. GET all stores (with optional filters & pagination)
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

    res.status(200).json({
      success: true,
      data: stores,
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
// 5. GET a single store by ID
// ---------------------------
export const getMedicalStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await MedicalStore.findById(id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Medical store not found' });
    }

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    console.error('Error fetching medical store:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};