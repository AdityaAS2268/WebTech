import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";

const router = express.Router();

// Fallback in-memory state for local testing/offline MySQL
let fallbackUser = {
  user_id: 1,
  name: "Jane Doe",
  email: "jane.doe@university.edu",
  mobile: "9876543210",
  password: "$2b$10$wY96lP1bQ.v7gD3k7v0N8uY4g6x3Xy5Q6lK1E5w7V0m4N9h8Y2k6K", // 'Password@123'
  role: "Customer",
  status: "Active",
  created_at: new Date().toISOString()
};

let fallbackAddresses = [
  {
    address_id: 1,
    user_id: 1,
    address_line: "Hostel Block 4, Room 210, Tech Campus",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001"
  },
  {
    address_id: 2,
    user_id: 1,
    address_line: "Flat 302, Green Valley Apts",
    city: "Mysuru",
    state: "Karnataka",
    pincode: "570001"
  }
];

// Helper: validate phone number
const isValidPhone = (phone) => {
  return typeof phone === "string" && /^\+?[0-9]{10,15}$/.test(phone.trim());
};

// Helper: validate password complexity (8+ chars, upper, lower, number, special)
const isValidPasswordComplexity = (password) => {
  if (!password || typeof password !== "string" || password.length < 8) {
    return false;
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

// =========================================================================
// 1. GET /api/profile
// Returns user details and all linked addresses
// =========================================================================
router.get("/", async (req, res) => {
  const userId = 1;

  if (db) {
    try {
      const [users] = await db.query(
        "SELECT user_id, name, email, mobile, role, status, created_at FROM users WHERE user_id = ?",
        [userId]
      );

      if (users.length > 0) {
        const [addresses] = await db.query(
          "SELECT address_id, user_id, address_line, city, state, pincode FROM addresses WHERE user_id = ? ORDER BY address_id DESC",
          [userId]
        );

        return res.json({
          success: true,
          source: "database",
          user: {
            ...users[0],
            addresses: addresses || []
          }
        });
      }
    } catch (err) {
      console.warn("MySQL query error, using local fallback:", err.message);
    }
  }

  // Fallback
  return res.json({
    success: true,
    source: "fallback",
    user: {
      ...fallbackUser,
      addresses: fallbackAddresses
    }
  });
});

// =========================================================================
// 2. PUT /api/profile
// Updates user name, mobile, and email
// =========================================================================
router.put("/", async (req, res) => {
  const userId = 1;
  const { name, mobile, email } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Full Name must be at least 2 characters."
    });
  }

  if (!mobile || !isValidPhone(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid 10-15 digit mobile number."
    });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address."
    });
  }

  const trimmedName = name.trim();
  const trimmedMobile = mobile.trim();
  const trimmedEmail = email.trim();

  if (db) {
    try {
      const [result] = await db.query(
        "UPDATE users SET name = ?, mobile = ?, email = ? WHERE user_id = ?",
        [trimmedName, trimmedMobile, trimmedEmail, userId]
      );

      if (result.affectedRows > 0) {
        return res.json({
          success: true,
          source: "database",
          message: "Profile updated successfully!",
          user: {
            user_id: userId,
            name: trimmedName,
            mobile: trimmedMobile,
            email: trimmedEmail,
            role: fallbackUser.role
          }
        });
      }
    } catch (err) {
      console.warn("MySQL update error, updating fallback:", err.message);
    }
  }

  // Update fallback
  fallbackUser.name = trimmedName;
  fallbackUser.mobile = trimmedMobile;
  fallbackUser.email = trimmedEmail;

  return res.json({
    success: true,
    source: "fallback",
    message: "Profile updated successfully!",
    user: {
      ...fallbackUser,
      addresses: fallbackAddresses
    }
  });
});

// =========================================================================
// 3. PUT /api/profile/password
// Verifies current password and updates with hashed new password
// =========================================================================
router.put("/password", async (req, res) => {
  const userId = 1;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password is required."
    });
  }

  if (!newPassword || !isValidPasswordComplexity(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "New password and confirm password do not match."
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password cannot be identical to your current password."
    });
  }

  // Verify and update
  if (db) {
    try {
      const [rows] = await db.query(
        "SELECT password FROM users WHERE user_id = ?",
        [userId]
      );

      if (rows.length > 0) {
        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: "The current password you entered is incorrect."
          });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE user_id = ?", [
          hashed,
          userId
        ]);

        return res.json({
          success: true,
          message: "Password changed successfully!"
        });
      }
    } catch (err) {
      console.warn("MySQL password error, checking fallback:", err.message);
    }
  }

  // Fallback verification
  const isMatch = await bcrypt.compare(currentPassword, fallbackUser.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "The current password you entered is incorrect."
    });
  }

  fallbackUser.password = await bcrypt.hash(newPassword, 10);
  return res.json({
    success: true,
    message: "Password changed successfully!"
  });
});

// =========================================================================
// 4. Address Management Routes (CRUD)
// =========================================================================

// GET /api/profile/addresses
router.get("/addresses", async (req, res) => {
  const userId = 1;

  if (db) {
    try {
      const [rows] = await db.query(
        "SELECT address_id, user_id, address_line, city, state, pincode FROM addresses WHERE user_id = ? ORDER BY address_id DESC",
        [userId]
      );
      return res.json({ success: true, addresses: rows || [] });
    } catch (err) {
      console.warn("MySQL get addresses error:", err.message);
    }
  }

  return res.json({ success: true, addresses: fallbackAddresses });
});

// POST /api/profile/addresses
router.post("/addresses", async (req, res) => {
  const userId = 1;
  const { address_line, city, state, pincode } = req.body;

  if (!address_line || !address_line.trim()) {
    return res.status(400).json({ success: false, message: "Street address is required." });
  }
  if (!city || !city.trim()) {
    return res.status(400).json({ success: false, message: "City is required." });
  }
  if (!state || !state.trim()) {
    return res.status(400).json({ success: false, message: "State is required." });
  }
  if (!pincode || !/^[0-9]{5,10}$/.test(pincode.trim())) {
    return res.status(400).json({ success: false, message: "Pincode must be 5 to 10 digits." });
  }

  const cleanAddr = {
    address_line: address_line.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim()
  };

  if (db) {
    try {
      const [result] = await db.query(
        "INSERT INTO addresses (user_id, address_line, city, state, pincode) VALUES (?, ?, ?, ?, ?)",
        [userId, cleanAddr.address_line, cleanAddr.city, cleanAddr.state, cleanAddr.pincode]
      );

      const newAddress = {
        address_id: result.insertId,
        user_id: userId,
        ...cleanAddr
      };

      return res.status(201).json({
        success: true,
        message: "Address added successfully!",
        address: newAddress
      });
    } catch (err) {
      console.warn("MySQL insert address error:", err.message);
    }
  }

  const newAddress = {
    address_id: Date.now(),
    user_id: userId,
    ...cleanAddr
  };
  fallbackAddresses.unshift(newAddress);

  return res.status(201).json({
    success: true,
    message: "Address added successfully!",
    address: newAddress
  });
});

// PUT /api/profile/addresses/:id
router.put("/addresses/:id", async (req, res) => {
  const userId = 1;
  const addressId = parseInt(req.params.id, 10);
  const { address_line, city, state, pincode } = req.body;

  if (!address_line || !address_line.trim()) {
    return res.status(400).json({ success: false, message: "Street address is required." });
  }
  if (!city || !city.trim()) {
    return res.status(400).json({ success: false, message: "City is required." });
  }
  if (!state || !state.trim()) {
    return res.status(400).json({ success: false, message: "State is required." });
  }
  if (!pincode || !/^[0-9]{5,10}$/.test(pincode.trim())) {
    return res.status(400).json({ success: false, message: "Pincode must be 5 to 10 digits." });
  }

  const cleanAddr = {
    address_line: address_line.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim()
  };

  if (db) {
    try {
      const [result] = await db.query(
        "UPDATE addresses SET address_line = ?, city = ?, state = ?, pincode = ? WHERE address_id = ? AND user_id = ?",
        [cleanAddr.address_line, cleanAddr.city, cleanAddr.state, cleanAddr.pincode, addressId, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Address not found or unauthorized." });
      }

      return res.json({
        success: true,
        message: "Address updated successfully!",
        address: { address_id: addressId, user_id: userId, ...cleanAddr }
      });
    } catch (err) {
      console.warn("MySQL update address error:", err.message);
    }
  }

  const idx = fallbackAddresses.findIndex((a) => a.address_id === addressId);
  if (idx !== -1) {
    fallbackAddresses[idx] = { address_id: addressId, user_id: userId, ...cleanAddr };
    return res.json({
      success: true,
      message: "Address updated successfully!",
      address: fallbackAddresses[idx]
    });
  }

  return res.status(404).json({ success: false, message: "Address not found." });
});

// DELETE /api/profile/addresses/:id
router.delete("/addresses/:id", async (req, res) => {
  const userId = 1;
  const addressId = parseInt(req.params.id, 10);

  if (db) {
    try {
      const [result] = await db.query(
        "DELETE FROM addresses WHERE address_id = ? AND user_id = ?",
        [addressId, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Address not found or unauthorized." });
      }

      return res.json({
        success: true,
        message: "Address deleted successfully!",
        address_id: addressId
      });
    } catch (err) {
      console.warn("MySQL delete address error:", err.message);
    }
  }

  fallbackAddresses = fallbackAddresses.filter((a) => a.address_id !== addressId);
  return res.json({
    success: true,
    message: "Address deleted successfully!",
    address_id: addressId
  });
});

export default router;
