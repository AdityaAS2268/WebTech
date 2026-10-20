const express = require('express');
const router = express.Router();

// In-memory profile state for initial prototype/testing
let profileData = {
    name: 'Jane Doe',
    email: 'jane.doe@university.edu',
    mobile: '9876543210',
    role: 'Customer'
};

// GET /api/profile - Fetch current profile
router.get('/', (req, res) => {
    res.json({
        success: true,
        user: profileData
    });
});

// PUT /api/profile - Update profile details
router.put('/', (req, res) => {
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

    profileData.name = name.trim();
    profileData.mobile = mobile.trim();
    if (typeof email === 'string') {
        profileData.email = email.trim();
    }

    return res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: profileData
    });
});

module.exports = router;
