// controllers/staffmanagementController.js
import mongoose from 'mongoose';
import StaffMember from '../model/staffmanagementModel.js';
import Role from '../model/Role.js';          // ✅ import Role model

// Helper functions
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidPhone = (phone) => /^\+?[0-9\s\-\(\)]{10,15}$/.test(phone);
const isValidDate = (date) => !isNaN(new Date(date).getTime());
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const allowedStatuses = ['active', 'inactive', 'pending'];

// Helper: convert role name → ObjectId
const getRoleIdByName = async (roleName) => {
  if (!roleName) return null;
  const role = await Role.findOne({ name: roleName });
  return role?._id || null;
};

// -------------------------------
// 1. ADD a new staff member
// -------------------------------
export const addStaff = async (req, res) => {
  try {
    const { fullName, phone, district, joiningDate, email, role, storeId, status } = req.body;

    // Required fields
    const requiredFields = ['fullName', 'phone', 'district', 'email', 'role'];
    const missing = requiredFields.filter(field => !req.body[field]);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` });
    }

    // Validations
    if (fullName.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Full name min 2 chars' });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: 'Invalid email' });
    if (!isValidPhone(phone))
      return res.status(400).json({ success: false, message: 'Invalid phone' });
    if (district.trim().length < 2)
      return res.status(400).json({ success: false, message: 'District min 2 chars' });

    const allowedRoles = ['Pharmacist', 'Store Manager', 'Delivery Coordinator', 'Customer Support', 'Accountant', 'Admin'];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role' });

    // Convert role name → ObjectId
    const roleId = await getRoleIdByName(role);
    if (!roleId)
      return res.status(400).json({ success: false, message: `Role "${role}" not found in DB` });

    // Joining date
    let validJoiningDate = joiningDate ? new Date(joiningDate) : new Date();
    if (joiningDate && !isValidDate(joiningDate))
      return res.status(400).json({ success: false, message: 'Invalid joining date' });
    if (validJoiningDate > new Date())
      return res.status(400).json({ success: false, message: 'Joining date cannot be in future' });

    // Optional storeId
    if (storeId && !isValidObjectId(storeId))
      return res.status(400).json({ success: false, message: 'Invalid storeId' });

    // Status default
    let finalStatus = status || 'active';
    if (!allowedStatuses.includes(finalStatus))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    // Duplicate email check
    const existing = await StaffMember.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const newStaff = new StaffMember({
      fullName: fullName.trim(),
      phone: phone.trim(),
      district: district.trim(),
      joiningDate: validJoiningDate,
      email: email.toLowerCase().trim(),
      role: roleId,                 // ✅ ObjectId
      storeId: storeId || null,
      status: finalStatus,
    });

    const saved = await newStaff.save();
    // Populate role for response
    await saved.populate('role', 'name');
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('Error adding staff:', error);
    if (error.code === 11000)
      return res.status(409).json({ success: false, message: 'Duplicate email' });
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------------------
// 2. GET all staff (filters, pagination)
// -------------------------------
export const getAllStaff = async (req, res) => {
  try {
    let { role, storeId, status, search, page = 1, limit = 10 } = req.query;
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 100);
    const filter = {};

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc)
        return res.status(400).json({ success: false, message: 'Invalid role filter' });
      filter.role = roleDoc._id;
    }
    if (storeId && isValidObjectId(storeId)) filter.storeId = storeId;
    if (status && allowedStatuses.includes(status)) filter.status = status;

    if (search && typeof search === 'string') {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [staff, total] = await Promise.all([
      StaffMember.find(filter)
        .populate('role', 'name')               // ✅ returns role.name
        .populate('storeId', 'storeName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      StaffMember.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: staff,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------------------
// 3. GET a single staff member by ID
// -------------------------------
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: 'Invalid staff ID' });

    const staff = await StaffMember.findById(id)
      .populate('role', 'name')
      .populate('storeId', 'storeName')
      .lean();
    if (!staff)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------------
// 4. UPDATE a staff member
// -------------------------------
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: 'Invalid staff ID' });

    const updateData = req.body;
    const allowedUpdates = ['fullName', 'phone', 'district', 'joiningDate', 'email', 'role', 'storeId', 'status'];
    const filtered = {};

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        if (key === 'fullName' && updateData.fullName.trim().length < 2)
          return res.status(400).json({ success: false, message: 'Full name min 2 chars' });
        if (key === 'email') {
          if (!isValidEmail(updateData.email))
            return res.status(400).json({ success: false, message: 'Invalid email' });
          filtered.email = updateData.email.toLowerCase().trim();
        }
        if (key === 'phone') {
          if (!isValidPhone(updateData.phone))
            return res.status(400).json({ success: false, message: 'Invalid phone' });
          filtered.phone = updateData.phone.trim();
        }
        if (key === 'district' && updateData.district.trim().length < 2)
          return res.status(400).json({ success: false, message: 'District min 2 chars' });
        if (key === 'role') {
          const roleId = await getRoleIdByName(updateData.role);
          if (!roleId)
            return res.status(400).json({ success: false, message: 'Invalid role' });
          filtered.role = roleId;
        }
        if (key === 'joiningDate' && updateData.joiningDate) {
          if (!isValidDate(updateData.joiningDate))
            return res.status(400).json({ success: false, message: 'Invalid joining date' });
          const dateObj = new Date(updateData.joiningDate);
          if (dateObj > new Date())
            return res.status(400).json({ success: false, message: 'Joining date cannot be future' });
          filtered.joiningDate = dateObj;
        }
        if (key === 'storeId') {
          if (updateData.storeId && !isValidObjectId(updateData.storeId))
            return res.status(400).json({ success: false, message: 'Invalid storeId' });
          filtered.storeId = updateData.storeId || null;
        }
        if (key === 'status') {
          if (!allowedStatuses.includes(updateData.status))
            return res.status(400).json({ success: false, message: 'Invalid status' });
          filtered.status = updateData.status;
        }
        if (!['email', 'role', 'joiningDate', 'storeId', 'status'].includes(key) && updateData[key] !== undefined) {
          filtered[key] = typeof updateData[key] === 'string' ? updateData[key].trim() : updateData[key];
        }
      }
    }

    if (Object.keys(filtered).length === 0)
      return res.status(400).json({ success: false, message: 'No valid fields to update' });

    // Email uniqueness check
    if (filtered.email) {
      const existing = await StaffMember.findOne({ email: filtered.email, _id: { $ne: id } });
      if (existing)
        return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const updated = await StaffMember.findByIdAndUpdate(id, filtered, { new: true, runValidators: true })
      .populate('role', 'name')
      .populate('storeId', 'storeName');
    if (!updated)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error.code === 11000)
      return res.status(409).json({ success: false, message: 'Duplicate email' });
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------------------
// 5. DELETE a staff member
// -------------------------------
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: 'Invalid staff ID' });

    const deleted = await StaffMember.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Staff not found' });

    res.status(200).json({ success: true, message: 'Staff deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};