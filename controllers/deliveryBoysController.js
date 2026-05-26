// make sure path is correct
const Deliveryboys = require("../model/deliveryboysModel");

const bcrypt = require("bcryptjs");

// ➕ Add Delivery Boy (Admin)
exports.addDeliveryBoy = async (req, res) => {
  try {
    console.log("BODY DATA:", req.body);
    console.log("FILES:", req.files);

    const {
      name,
      email,
      phone,
      password,
      aadharNumber,
      licenseNumber,
      bikeNumber,
      district // ✅ NEW FIELD
    } = req.body;

    console.log("Checking existing user...");

    const existing = await Deliveryboys.findOne({
      $or: [{ email }, { phone }]
    });

    console.log("Existing user:", existing);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Delivery boy already exists"
      });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new delivery boy...");

    const newDeliveryBoy = new Deliveryboys({
      name,
      email,
      phone,
      password: hashedPassword,
      aadharNumber,
      licenseNumber,
      bikeNumber,
      district, // ✅ SAVING DISTRICT

      // Images from multer
      aadharImage: req.files?.aadharImage?.[0]?.path || "",
      licenseImage: req.files?.licenseImage?.[0]?.path || "",

      isVerified: true,
      isPhoneVerified: true
    });

    console.log("Saving to DB...");
    await newDeliveryBoy.save();

    console.log("Saved successfully!");

    res.status(201).json({
      success: true, // ✅ added for frontend check
      message: "Delivery boy added successfully",
      data: newDeliveryBoy
    });

  } catch (error) {
    console.error("ERROR OCCURRED:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await Deliveryboys.find();

    res.status(200).json(deliveryBoys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;

    await Deliveryboys.findByIdAndDelete(id);

    res.status(200).json({
      message: "Delivery boy deleted"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.updateDeliveryBoy = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const updatedData = {
//       name: req.body.name,
//       email: req.body.email,
//       phone: req.body.phone,
//       password: req.body.password,
//       aadharNumber: req.body.aadharNumber,
//       licenseNumber: req.body.licenseNumber,
//       bikeNumber: req.body.bikeNumber,
//       zone: req.body.zone,
//       status: req.body.status
//     };

//     // file handling (optional)
//     if (req.files?.aadharImage) {
//       updatedData.aadharImage = req.files.aadharImage[0].filename;
//     }

//     if (req.files?.licenseImage) {
//       updatedData.licenseImage = req.files.licenseImage[0].filename;
//     }

//     const updatedBoy = await DeliveryBoy.findByIdAndUpdate(
//       id,
//       updatedData,
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Delivery boy updated successfully",
//       data: updatedBoy
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };