const express = require('express');
const router = express.Router();
const pool = require('../db');

// Fallback in-memory profile state if MySQL is offline during development
let fallbackProfileData = {
  user_id: 1,
  name: 'Jane Doe',
  email: 'jane.doe@university.edu',
  mobile: '9876543210',
  role: 'Customer',
  status: 'Active'
};

// GET /api/profile - Fetch current user profile (Phase 2: Database Query with fallback)
router.get('/', async (req, res) => {
  if (pool) {
    try {
      const [rows] = await pool.query(
        'SELECT user_id, name, email, mobile, role, status, created_at FROM users WHERE user_id = ?',
        [1] // Defaulting to user_id: 1 for Phase 2 prototype
      );

      if (rows.length > 0) {
        return res.json({
          success: true,
          source: 'database',
          user: rows[0]
        });
      }
    } catch (dbError) {
      console.warn('MySQL query error, using local fallback:', dbError.message);
    }
  }

  // Graceful fallback for offline testing
  return res.json({
    success: true,
    source: 'fallback',
    user: fallbackProfileData
  });
});

// PUT /api/profile - Update profile details (Phase 2: Database Update with fallback)
router.put('/', async (req, res) => {
  const { name, mobile, email } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name cannot be empty.'
    });
  }

  if (!mobile || typeof mobile !== 'string' || !mobile.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number cannot be empty.'
    });
  }

  const updatedName = name.trim();
  const updatedMobile = mobile.trim();
  const updatedEmail = typeof email === 'string' ? email.trim() : fallbackProfileData.email;

  if (pool) {
    try {
      const [result] = await pool.query(
        'UPDATE users SET name = ?, mobile = ?, email = ? WHERE user_id = ?',
        [updatedName, updatedMobile, updatedEmail, 1]
      );

      if (result.affectedRows > 0) {
        return res.json({
          success: true,
          source: 'database',
          message: 'Profile updated in MySQL database successfully!',
          user: {
            user_id: 1,
            name: updatedName,
            mobile: updatedMobile,
            email: updatedEmail,
            role: fallbackProfileData.role
          }
        });
      }
    } catch (dbError) {
      console.warn('MySQL update error, updating local fallback:', dbError.message);
    }
  }

  // Update fallback state if DB is unreachable
  fallbackProfileData.name = updatedName;
  fallbackProfileData.mobile = updatedMobile;
  fallbackProfileData.email = updatedEmail;

  return res.json({
    success: true,
    source: 'fallback',
    message: 'Profile updated successfully!',
    user: fallbackProfileData
  });
});

module.exports = router;
