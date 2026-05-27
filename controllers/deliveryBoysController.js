
import Deliveryboys from "../model/deliveryboysModel.js";

import bcrypt from "bcryptjs";

// ✅ Recommended: create index for faster duplicate checks (run once in MongoDB)
// db.deliveryboys.createIndex({ email: 1, phone: 1 });
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
      district
    } = req.body;

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

export const getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await Deliveryboys.find().lean();
    res.status(200).json(deliveryBoys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    await Deliveryboys.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.files?.aadharImage) {
      updateData.aadharImage = req.files.aadharImage[0].path;
    }

    const updatedBoy = await Deliveryboys.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      data: updatedBoy
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};