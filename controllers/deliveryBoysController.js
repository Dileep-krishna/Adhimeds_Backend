// make sure path is correct
const Deliveryboys = require("../model/deliveryboysModel");
const bcrypt = require("bcryptjs");

// ✅ Recommended: create index for faster duplicate checks (run once in MongoDB)
// db.deliveryboys.createIndex({ email: 1, phone: 1 });

// ➕ Add Delivery Boy (Admin)
exports.addDeliveryBoy = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      aadharNumber,
      licenseNumber,
      bikeNumber,
      district
    } = req.body;

    // Fast duplicate check (uses index if created)
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

    const newDeliveryBoy = new Deliveryboys({
      name,
      email,
      phone,
      password: hashedPassword,
      aadharNumber,
      licenseNumber,
      bikeNumber,
      district,
      aadharImage: req.files?.aadharImage?.[0]?.path || "",
      licenseImage: req.files?.licenseImage?.[0]?.path || "",
      isVerified: true,
      isPhoneVerified: true
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

// 📥 Get all delivery boys (lean for speed)
exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await Deliveryboys.find().lean();
    res.status(200).json(deliveryBoys);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Delivery Boy
exports.deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    await Deliveryboys.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Delivery boy deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update Delivery Boy (supports partial updates, optional password)
exports.updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Only include fields that are sent
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.aadharNumber !== undefined) updateData.aadharNumber = req.body.aadharNumber;
    if (req.body.licenseNumber !== undefined) updateData.licenseNumber = req.body.licenseNumber;
    if (req.body.bikeNumber !== undefined) updateData.bikeNumber = req.body.bikeNumber;
    if (req.body.district !== undefined) updateData.district = req.body.district;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    // Password update (only if provided)
    if (req.body.password && req.body.password.trim() !== "") {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    // File updates
    if (req.files?.aadharImage) {
      updateData.aadharImage = req.files.aadharImage[0].path;
    }
    if (req.files?.licenseImage) {
      updateData.licenseImage = req.files.licenseImage[0].path;
    }

    const updatedBoy = await Deliveryboys.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery boy updated successfully",
      data: updatedBoy
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating",
      error: error.message
    });
  }
};