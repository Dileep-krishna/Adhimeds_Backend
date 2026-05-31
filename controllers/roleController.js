import Role from "../model/Role.js";


export const getAllRoles = async (req, res) => {
  const roles = await Role.find({}, 'name');
  res.json({ success: true, data: roles });
};

export const getRolePermissions = async (req, res) => {
  const { roleName } = req.params;
  const role = await Role.findOne({ name: roleName });
  if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
  res.json({ success: true, data: role.permissions || [] });
};

export const updateRolePermissions = async (req, res) => {
  const { roleName } = req.params;
  const { permissions } = req.body;
  const role = await Role.findOneAndUpdate(
    { name: roleName },
    { permissions },
    { new: true, runValidators: true }
  );
  if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
  res.json({ success: true, data: role.permissions });
};