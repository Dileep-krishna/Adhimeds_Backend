import Admin from '../model/Admin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const generateToken = (id, email, role) => {
  const secret = process.env.JWT_SECRET || 'super-admin';
  console.log("🔑 JWT_SECRET used:", secret.substring(0, 3) + "...");
  return jwt.sign({ id, email, role }, secret, { expiresIn: '7d' });
};

export const adminLogin = async (req, res) => {
  console.log("📨 Login request received");
  console.log("   Body:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Missing email or password");
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  try {
    // 1. Find admin (explicitly select password field)
    console.log("🔍 Looking for admin with email:", email);
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    console.log("✅ Admin found. Name:", admin.name);
    console.log("   Stored password type:", typeof admin.password);
    console.log("   Stored password length:", admin.password?.length);
    console.log("   First 10 chars:", admin.password?.substring(0, 10));

    // 2. Check account status
    if (!admin.isActive) {
      console.log("❌ Account is inactive");
      return res.status(403).json({ success: false, message: 'Account disabled' });
    }

    // 3. Verify password
    let isMatch = false;
    // If password starts with $2 (bcrypt hash)
    if (admin.password && admin.password.startsWith('$2')) {
      console.log("🔐 Password is bcrypt hashed. Comparing...");
      isMatch = await bcrypt.compare(password, admin.password);
      console.log("   bcrypt compare result:", isMatch);
    } 
    // Plain text fallback (migration)
    else if (admin.password === password) {
      console.log("⚠️ Password is plain text. Accepting and will hash.");
      isMatch = true;
      // Hash it for next time
      const hashed = await bcrypt.hash(password, 10);
      admin.password = hashed;
      await admin.save();
      console.log("✅ Password hashed and saved.");
    } else {
      console.log("❌ Password does not match (plain compare).");
    }

    if (!isMatch) {
      console.log("❌ Authentication failed – wrong password");
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Update last login
    admin.lastLogin = new Date();
    await admin.save();
    console.log("✅ Last login updated");

    // 5. Generate token
    const token = generateToken(admin._id, admin.email, admin.role);
    const adminData = admin.toObject();
    delete adminData.password;

    console.log("🎉 Login successful for:", admin.email);
    res.json({ success: true, data: { admin: adminData, token } });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};