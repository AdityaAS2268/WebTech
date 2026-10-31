
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Check whether the backend is running
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is running!"
  });
});

// Check whether MySQL is connected
app.get("/api/dbTest", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      message: "MySQL connected!",
      result: rows[0].result
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Retrieve User Addresses in Delivery Address Page
app.post("/api/userAddressesForUserID", async (req, res) => {res
  try {
    const { userID } = req.body

    const [rows] = await db.query("SELECT * FROM UserAddresses where userId = ?", [userID]);

    res.json({
      result: rows
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error"
    })
  }
})



app.post("/api/AddAddress", async (req, res) => {
  try {
    const address = req.body;

    const [result] = await db.query(
        `INSERT INTO UserAddresses (
                userID,
                AddressLabel,
                Name,
                PhoneNo,
                PinCode,
                AddressLine1,
                AddressLine2,
                City,
                State
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          address.userID,
          address.label,
          address.name,
          address.phone,
          address.pincode,
          address.line1,
          address.line2 || null,
          address.city,
          address.state
        ]
    );

    res.status(201).json({
      message: "Address added successfully!",
      insertedId: result.insertId
    });

  } catch (error) {
    console.error("Add address error:", error);

    res.status(500).json({
      message: "Database error"
    });
  }
});


// Update address in MySQL
app.post("/api/UpdateAddress", async (req, res) => {
  try {
    const values = req.body;

    const [result] = await db.query(
        `UPDATE UserAddresses
             SET AddressLabel = ?,
                 Name = ?,
                 PhoneNo = ?,
                 PinCode = ?,
                 AddressLine1 = ?,
                 AddressLine2 = ?,
                 City = ?,
                 State = ?,
                 IsDefault = ?
             WHERE id = ? AND userID = ?`,
        [
          values.label,
          values.name,
          values.phone,
          values.pincode,
          values.line1,
          values.line2,
          values.city,
          values.state,
          values.isDefault ? "Y" : "N",
          values.id,
          values.userID
        ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Address not found"
      });
    }

    res.json({
      message: "Address updated successfully!"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database error"
    });
  }
});

app.post("/api/UpdateDefaultAddress", async (req, res) => {
  try {
      const { defaultAddressID, userID } = req.body;

      await db.query("update UserAddresses set IsDefault = ? where userID = ?", ["N", userID]);
      await db.query("update UserAddresses set IsDefault = ? where id = ? and userID = ?", ["Y", defaultAddressID, userID]);

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({result: "Database error"});
  }
})

app.post("/api/RemoveAddress", async (req, res) => {
  try {
    const { addressID, userID } = req.body;

    await db.query("delete from UserAddresses where id = ? and userID = ?", [addressID, userID]);

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({result: "Database error"});
  }
})

// id: 1,
//     label: "Home",
//     name: "ABCDEFGH",
//     phone: "+91 98765 43210",
//     line1: "24, Lake View Road",
//     line2: "Velachery",
//     city: "Chennai",
//     state: "Tamil Nadu",
//     pincode: "600042",
//     isDefault: true,