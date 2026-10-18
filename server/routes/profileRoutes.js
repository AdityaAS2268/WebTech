const express = require('express');
const router = express.Router();

// GET /api/profile - Initial route for profile retrieval
router.get('/', (req, res) => {
    // Initial profile endpoint setup
    res.json({
        message: 'Profile route initialized',
        user: {
            name: '',
            email: '',
            mobile: '',
            role: 'Customer'
        }
    });
});

module.exports = router;
