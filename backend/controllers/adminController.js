const Admin = require('../models/adminModel');
const Complaint = require('../models/complaintModel');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Support both bcrypt and plain text (for initial setup convenience)
    let isValid = false;
    if (admin.password.startsWith('$2')) {
      isValid = await bcrypt.compare(password, admin.password);
    } else {
      isValid = (admin.password === password);
    }

    if (isValid) {
      res.json({ 
        success: true, 
        adminId: admin.id, 
        departmentId: admin.department_id, 
        departmentName: admin.department_name || 'Main Admin'
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

exports.getComplaints = async (req, res) => {
  const { departmentId } = req.query;
  try {
    let complaints;
    if (departmentId === 'null' || !departmentId) {
      complaints = await Complaint.findAll();
    } else {
      complaints = await Complaint.findByDepartment(departmentId);
    }
    res.json({ success: true, complaints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    await Complaint.updateStatus(id, status);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

exports.reassign = async (req, res) => {
  const { id, departmentId } = req.body;
  try {
    await Complaint.reassign(id, departmentId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reassign' });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Admin.getAllDepartments();
    res.json({ success: true, departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
