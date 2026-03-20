const User = require('../models/userModel');

exports.login = async (req, res) => {
  const { phone, email, latitude, longitude } = req.body;
  try {
    const userId = await User.createOrUpdate(phone, email, latitude, longitude);
    res.json({ success: true, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};
