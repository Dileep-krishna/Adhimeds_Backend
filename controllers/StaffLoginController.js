import StaffMember from '../model/staffmanagementModel.js';   // ← correct model
import jwt from 'jsonwebtoken';

export const staffLogin = async (req, res) => {
  console.log('\n========== STAFF LOGIN ATTEMPT ==========');
  console.log('Request body:', { ...req.body, password: '***' });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('❌ Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log(`🔍 Looking for staff with email: "${email}" (lowercase query)`);
    
    // Use StaffMember (the model for admin-created staff)
    const staff = await StaffMember.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!staff) {
      console.warn(`❌ No staff found with email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log(`✅ Staff found: ${staff.fullName} (ID: ${staff._id})`);
    console.log(`   - Role: ${staff.role} (type: ${typeof staff.role})`);
    console.log(`   - Status: ${staff.status}`);
    console.log(`   - District: ${staff.district}`);
    console.log(`   - Has password hash: ${!!staff.password}`);

    if (staff.status !== 'active') {
      console.warn(`⚠️ Staff account is not active. Status: ${staff.status}`);
      return res.status(401).json({ success: false, message: 'Account is not active. Please contact admin.' });
    }

    console.log('🔐 Verifying password...');
    const isMatch = await staff.comparePassword(password);
    console.log(`   Password match result: ${isMatch}`);

    if (!isMatch) {
      console.warn(`❌ Password mismatch for staff: ${staff.email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Resolve role name if role is an ObjectId reference
    let roleName = staff.role;
    if (staff.role && typeof staff.role === 'object' && staff.role.name) {
      roleName = staff.role.name;
      console.log(`   Role resolved from populated object: ${roleName}`);
    } else if (typeof staff.role === 'string') {
      roleName = staff.role;
      console.log(`   Role is string: ${roleName}`);
    }

    const tokenPayload = {
      id: staff._id,
      role: roleName,
      fullName: staff.fullName,
      district: staff.district,
    };
    console.log('📝 JWT payload:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    console.log('✅ JWT generated successfully');

    console.log(`🎉 Staff login successful: ${staff.fullName} (${staff.email})`);
    console.log('==========================================\n');

    res.status(200).json({
      success: true,
      data: {
        token,
        role: roleName,
        fullName: staff.fullName,
        _id: staff._id,
        district: staff.district,
      },
    });
  } catch (error) {
    console.error('\n========== STAFF LOGIN ERROR ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('==========================================\n');
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};