const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory payment transactions store (simulating local database table)
const paymentsStore = [];

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is running!" });
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
