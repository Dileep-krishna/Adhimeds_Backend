import Deliveryboys from "../model/deliveryboysModel.js";
import bcrypt from "bcryptjs";

// ──────────────────────────────────────────────
// ADD DELIVERY BOY
// ──────────────────────────────────────────────
export const addDeliveryBoy = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      aadharNumber,
      licenseNumber,
      bikeNumber,
      district,
      status,
    } = req.body;

    // Check if delivery boy already exists
    const existing = await Deliveryboys.findOne({
      $or: [{ email }, { phone }]
    }).lean().select('_id');

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Delivery boy already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Store ONLY the filename (not the full path)
    const aadharImage = req.files?.aadharImage?.[0]?.filename || "";
    const licenseImage = req.files?.licenseImage?.[0]?.filename || "";

    const newDeliveryBoy = new Deliveryboys({
      name,
      email,
      phone,
      password: hashedPassword,
      aadharNumber,
      licenseNumber,
      bikeNumber,
      district,
      status: status || 'active',
      aadharImage,
      licenseImage,
      isVerified: true,
      isPhoneVerified: true,
      isAvailable: true,
    });

    await newDeliveryBoy.save();

    res.status(201).json({
      success: true,
      message: "Delivery boy added successfully",
      data: newDeliveryBoy
    });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ──────────────────────────────────────────────
// GET ALL DELIVERY BOYS
// ──────────────────────────────────────────────
export const getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await Deliveryboys.find().lean();
    console.log('📦 Sending delivery boys with images:', deliveryBoys.map(b => ({
      name: b.name,
      aadharImage: b.aadharImage,
      licenseImage: b.licenseImage
    })));
    res.status(200).json(deliveryBoys);
  } catch (error) {
    console.error("Get all error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────────
// UPDATE DELIVERY BOY
// ──────────────────────────────────────────────
export const updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      password,
      aadharNumber,
      licenseNumber,
      bikeNumber,
      district,
      status,
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (aadharNumber !== undefined) updateData.aadharNumber = aadharNumber;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (bikeNumber !== undefined) updateData.bikeNumber = bikeNumber;
    if (district !== undefined) updateData.district = district;
    if (status !== undefined) updateData.status = status;

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // ✅ Store ONLY the filename (if a new file is uploaded)
    if (req.files?.aadharImage) {
      updateData.aadharImage = req.files.aadharImage[0].filename;
    }
    if (req.files?.licenseImage) {
      updateData.licenseImage = req.files.licenseImage[0].filename;
    }

    const updatedBoy = await Deliveryboys.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: 'after',   // modern option, replaces new: true
        runValidators: true,
      }
    );

    if (!updatedBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBoy
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ──────────────────────────────────────────────
// DELETE DELIVERY BOY
// ──────────────────────────────────────────────
export const deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Deliveryboys.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Delivery boy deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};