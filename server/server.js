
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Check whether the backend is running
// In-memory payment transactions store (simulating local database table)
const paymentsStore = [];

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

// Process a payment transaction
app.post("/api/payments/process", (req, res) => {
  const { method, amountCents, cardDetails, upiDetails, netbankingDetails } = req.body;

  if (!method || !amountCents) {
    return res.status(400).json({ error: "Method and amount are required." });
  }

  const orderId = "SS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const paymentRef = "PAY-" + Date.now().toString(36).toUpperCase();

  const record = {
    paymentReference: paymentRef,
    orderId,
    method,
    amountCents,
    currency: "INR",
    status: "completed",
    timestamp: new Date().toISOString(),
    details: {
      cardLastFour: cardDetails?.cardNumber ? cardDetails.cardNumber.replace(/\s/g, "").slice(-4) : null,
      upiId: upiDetails?.upiId || null,
      bank: netbankingDetails?.bank || null,
    },
  };

  paymentsStore.push(record);

  return res.status(200).json({
    success: true,
    message: "Payment processed successfully",
    orderId,
    paymentReference: paymentRef,
    amount: amountCents,
    status: "completed",
  });
});

// Get payment receipt / details by reference or orderId
app.get("/api/payments/:orderId", (req, res) => {
  const payment = paymentsStore.find(
    (p) => p.orderId === req.params.orderId || p.paymentReference === req.params.orderId
  );
  if (!payment) {
    return res.status(404).json({ error: "Payment record not found." });
  }
  res.json(payment);
});

// User Profile routes
app.use("/api/profile", profileRoutes);
app.use("/api/users", profileRoutes);

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