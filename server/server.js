
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import profileRoutes from "./routes/profileRoutes.js";
import {
  getAddressesForUser,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  addressToCheckoutRow
} from "./addressStore.js";

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

// Retrieve User Addresses in Delivery Address Page (Synced with Profile)
app.post("/api/userAddressesForUserID", async (req, res) => {
  try {
    const { userID } = req.body;
    const addrs = await getAddressesForUser(userID || "USR1001");
    const rows = addrs.map(addressToCheckoutRow);
    res.json({ result: rows });
  } catch (error) {
    console.error("Error retrieving user addresses:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Add Address in Checkout / Delivery Page (Synced with Profile)
app.post("/api/AddAddress", async (req, res) => {
  try {
    const address = req.body;
    const newAddr = await addAddress(address);
    res.status(201).json({
      message: "Address added successfully!",
      insertedId: newAddr.id,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Update Address in Checkout / Delivery Page (Synced with Profile)
app.post("/api/UpdateAddress", async (req, res) => {
  try {
    const values = req.body;
    await updateAddress(values);
    res.json({ message: "Address updated successfully!" });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Update Default Address in Checkout / Delivery Page (Synced with Profile)
app.post("/api/UpdateDefaultAddress", async (req, res) => {
  try {
    const { defaultAddressID, userID } = req.body;
    await setDefaultAddress(defaultAddressID, userID || "USR1001");
    res.json({ result: "Default address updated!", message: "Default address updated!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ result: "Database error" });
  }
});

// Remove Address in Checkout / Delivery Page (Synced with Profile)
app.post("/api/RemoveAddress", async (req, res) => {
  try {
    const { addressID, userID } = req.body;
    await deleteAddress(addressID, userID || "USR1001");
    res.json({ result: "Address removed!", message: "Address removed!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ result: "Database error" });
  }
});


// Fetch all products from MySQL
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.query(
        "SELECT * FROM Products"
    );

    const products = rows.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      priceCents: product.price_cents,
      stock: product.stock,
      category: product.type || "General",

      rating: {
        stars: Number(product.rating_stars || 0),
        count: product.rating_count || 0
      },

      keywords: product.keywords || [],
      sizeChartLink: product.size_chart_link
    }));

    res.json({
      success: true,
      products: products
    });

  } catch (error) {
    console.warn("Error fetching products from MySQL (using fallback if needed):", error.message);

    res.json({
      success: false,
      message: "MySQL Products table not ready or offline",
      products: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
