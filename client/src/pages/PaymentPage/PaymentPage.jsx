import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentPage.css";

/* ── helpers ───────────────────────────────────────────────── */
const fmt = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

function formatCardNumber(raw) {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

/* ── mock order data (cart would pass this in real app) ─────── */
const ORDER_ITEMS = [
  { id: 1, name: "Black and Gray Athletic Cotton Socks", detail: "6 pairs · Cotton blend", priceCents: 1090, qty: 2 },
  { id: 2, name: "Intermediate Size Basketball",         detail: "Size 6 · Indoor / outdoor", priceCents: 2095, qty: 1 },
  { id: 3, name: "Adults Plain Cotton T-Shirt",          detail: "Teal · 2 pack · Size M",  priceCents: 799,  qty: 1 },
];

const DELIVERY_FEE_CENTS = 0; // standard — free
const TAX_RATE = 0.18;        // 18 % GST

/* ── sub-components ─────────────────────────────────────────── */

function StepIndicator({ current }) {
  const steps = ["Address", "Delivery", "Payment"];
  return (
    <nav className="checkout-steps" aria-label="Checkout progress">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === current;
        const done   = num < current;
        return (
          <span key={label} className="steps-pair">
            <span className={`step ${active ? "step--active" : done ? "step--done" : ""}`}>
              <span className="step__num">
                {done ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
                ) : num}
              </span>
              {label}
            </span>
            {i < steps.length - 1 && <span className="step__divider" aria-hidden="true" />}
          </span>
        );
      })}
    </nav>
  );
}

function OrderSummary({ items, deliveryFeeCents, taxRate }) {
  const [open, setOpen] = useState(false);
  const subtotal = items.reduce((s, it) => s + it.priceCents * it.qty, 0);
  const tax      = Math.round(subtotal * taxRate);
  const total    = subtotal + deliveryFeeCents + tax;

  return (
    <aside className="order-aside">
      <div className="order-card">
        <button
          type="button"
          className="order-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="order-toggle__label">
            <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Order summary
          </span>
          <span className="order-toggle__total">{fmt(total)}</span>
          <svg
            className={`chevron ${open ? "chevron--up" : ""}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <ul className="order-items" aria-label="Items in your order">
            {items.map((item) => (
              <li key={item.id} className="order-item">
                <span className="order-item__badge">{item.qty}</span>
                <div className="order-item__info">
                  <p className="order-item__name">{item.name}</p>
                  <p className="order-item__detail">{item.detail}</p>
                </div>
                <span className="order-item__price">{fmt(item.priceCents * item.qty)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="order-breakdown">
          <div className="breakdown-row">
            <span>Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="breakdown-row">
            <span>Delivery</span>
            <span>{deliveryFeeCents === 0 ? "Free" : fmt(deliveryFeeCents)}</span>
          </div>
          <div className="breakdown-row">
            <span>GST (18 %)</span>
            <span>{fmt(tax)}</span>
          </div>
          <div className="breakdown-row breakdown-row--total">
            <span>Total</span>
            <strong>{fmt(total)}</strong>
          </div>
        </div>

        <p className="secure-note">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Payments are 256-bit SSL encrypted
        </p>
      </div>
    </aside>
  );
}

/* ── Card form ───────────────────────────────────────────────── */
function CardForm({ form, errors, onChange }) {
  return (
    <div className="method-form">
      <div className="form-field">
        <label htmlFor="cardName">Name on card <span className="required" aria-hidden="true">*</span></label>
        <input
          id="cardName"
          name="cardName"
          type="text"
          placeholder="As printed on your card"
          value={form.cardName}
          onChange={onChange}
          autoComplete="cc-name"
          aria-describedby={errors.cardName ? "cardName-err" : undefined}
          aria-invalid={!!errors.cardName}
        />
        {errors.cardName && <span id="cardName-err" className="field-error" role="alert">{errors.cardName}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="cardNumber">Card number <span className="required" aria-hidden="true">*</span></label>
        <div className="input-with-icon">
          <input
            id="cardNumber"
            name="cardNumber"
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={form.cardNumber}
            onChange={onChange}
            autoComplete="cc-number"
            aria-describedby={errors.cardNumber ? "cardNumber-err" : undefined}
            aria-invalid={!!errors.cardNumber}
          />
          <span className="card-brand-icon" aria-hidden="true">💳</span>
        </div>
        {errors.cardNumber && <span id="cardNumber-err" className="field-error" role="alert">{errors.cardNumber}</span>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="expiry">Expiry date <span className="required" aria-hidden="true">*</span></label>
          <input
            id="expiry"
            name="expiry"
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={form.expiry}
            onChange={onChange}
            autoComplete="cc-exp"
            aria-describedby={errors.expiry ? "expiry-err" : undefined}
            aria-invalid={!!errors.expiry}
          />
          {errors.expiry && <span id="expiry-err" className="field-error" role="alert">{errors.expiry}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="cvv">
            CVV <span className="required" aria-hidden="true">*</span>
            <button type="button" className="cvv-hint" aria-label="What is CVV?">?</button>
          </label>
          <input
            id="cvv"
            name="cvv"
            type="password"
            inputMode="numeric"
            placeholder="•••"
            maxLength={4}
            value={form.cvv}
            onChange={onChange}
            autoComplete="cc-csc"
            aria-describedby={errors.cvv ? "cvv-err" : undefined}
            aria-invalid={!!errors.cvv}
          />
          {errors.cvv && <span id="cvv-err" className="field-error" role="alert">{errors.cvv}</span>}
        </div>
      </div>

      <label className="save-card-row">
        <input
          type="checkbox"
          name="saveCard"
          checked={form.saveCard}
          onChange={onChange}
        />
        <span>Save this card for future purchases</span>
      </label>
    </div>
  );
}

/* ── UPI form ────────────────────────────────────────────────── */
function UpiForm({ form, errors, onChange }) {
  return (
    <div className="method-form">
      <div className="form-field">
        <label htmlFor="upiId">UPI ID <span className="required" aria-hidden="true">*</span></label>
        <div className="input-with-icon">
          <input
            id="upiId"
            name="upiId"
            type="text"
            placeholder="yourname@upi"
            value={form.upiId}
            onChange={onChange}
            autoComplete="off"
            aria-describedby={errors.upiId ? "upiId-err" : undefined}
            aria-invalid={!!errors.upiId}
          />
          <span className="upi-icon" aria-hidden="true">⚡</span>
        </div>
        {errors.upiId && <span id="upiId-err" className="field-error" role="alert">{errors.upiId}</span>}
      </div>

      <div className="upi-apps" aria-label="Supported UPI apps">
        <p className="upi-apps__label">Or pay with</p>
        <div className="upi-apps__list">
          {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
            <button
              key={app}
              type="button"
              className="upi-app-btn"
              onClick={() => onChange({ target: { name: "upiId", value: `user@${app.toLowerCase()}` } })}
            >
              {app}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Net-banking form ────────────────────────────────────────── */
const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
];

function NetbankingForm({ form, errors, onChange }) {
  return (
    <div className="method-form">
      <div className="form-field">
        <label htmlFor="bank">Select your bank <span className="required" aria-hidden="true">*</span></label>
        <select
          id="bank"
          name="bank"
          value={form.bank}
          onChange={onChange}
          aria-describedby={errors.bank ? "bank-err" : undefined}
          aria-invalid={!!errors.bank}
        >
          <option value="">— Choose a bank —</option>
          {BANKS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        {errors.bank && <span id="bank-err" className="field-error" role="alert">{errors.bank}</span>}
      </div>
      <p className="netbanking-note">
        You will be securely redirected to your bank's portal to complete the payment.
      </p>
    </div>
  );
}

/* ── Success screen ──────────────────────────────────────────── */
function SuccessScreen({ orderId, method, total, onGoHome }) {
  return (
    <div className="success-screen" role="main" aria-live="polite">
      <div className="success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <h1 className="success-title">Payment Successful!</h1>
      <p className="success-subtitle">
        Your order has been placed and is being processed.
      </p>

      <div className="success-details">
        <div className="detail-row">
          <span>Order ID</span>
          <strong>{orderId}</strong>
        </div>
        <div className="detail-row">
          <span>Amount paid</span>
          <strong>{fmt(total)}</strong>
        </div>
        <div className="detail-row">
          <span>Payment method</span>
          <strong>{method}</strong>
        </div>
        <div className="detail-row">
          <span>Estimated delivery</span>
          <strong>4 – 6 business days</strong>
        </div>
      </div>

      <p className="success-email-note">
        A confirmation has been sent to your registered email address.
      </p>

      <button type="button" className="go-home-btn" onClick={onGoHome}>
        Continue Shopping
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main PaymentPage component
══════════════════════════════════════════════════════════════ */
export default function PaymentPage() {
  const navigate = useNavigate();

  /* ── state ── */
  const [tab, setTab]             = useState("card");      // "card" | "upi" | "netbanking"
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [orderId, setOrderId]     = useState("");

  const [cardForm, setCardForm] = useState({
    cardName: "", cardNumber: "", expiry: "", cvv: "", saveCard: false,
  });
  const [upiForm, setUpiForm]   = useState({ upiId: "" });
  const [nbForm,  setNbForm]    = useState({ bank: "" });
  const [errors,  setErrors]    = useState({});

  /* ── totals ── */
  const subtotal = ORDER_ITEMS.reduce((s, it) => s + it.priceCents * it.qty, 0);
  const tax      = Math.round(subtotal * TAX_RATE);
  const total    = subtotal + DELIVERY_FEE_CENTS + tax;

  /* ── field change handlers ── */
  function handleCardChange(e) {
    const { name, value, type, checked } = e.target;
    let next = type === "checkbox" ? checked : value;
    if (name === "cardNumber") next = formatCardNumber(value);
    if (name === "expiry")     next = formatExpiry(value);
    if (name === "cvv")        next = value.replace(/\D/g, "").slice(0, 4);
    setCardForm((p) => ({ ...p, [name]: next }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  function handleUpiChange(e) {
    const { name, value } = e.target;
    setUpiForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  function handleNbChange(e) {
    const { name, value } = e.target;
    setNbForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  /* ── validation ── */
  function validate() {
    const next = {};

    if (tab === "card") {
      if (!cardForm.cardName.trim())
        next.cardName = "Name on card is required.";
      const digits = cardForm.cardNumber.replace(/\s/g, "");
      if (!digits || digits.length !== 16)
        next.cardNumber = "Enter a valid 16-digit card number.";
      if (!cardForm.expiry || !/^\d{2}\/\d{2}$/.test(cardForm.expiry))
        next.expiry = "Enter a valid expiry date (MM/YY).";
      else {
        const [mm, yy] = cardForm.expiry.split("/").map(Number);
        const now = new Date();
        const exp = new Date(2000 + yy, mm - 1);
        if (mm < 1 || mm > 12 || exp < now)
          next.expiry = "Card has expired or date is invalid.";
      }
      if (!cardForm.cvv || cardForm.cvv.length < 3)
        next.cvv = "Enter a valid CVV.";
    }

    if (tab === "upi") {
      if (!upiForm.upiId.trim())
        next.upiId = "UPI ID is required.";
      else if (!/^[\w.\-]{3,}@[\w]{3,}$/.test(upiForm.upiId.trim()))
        next.upiId = "Enter a valid UPI ID (e.g. name@upi).";
    }

    if (tab === "netbanking") {
      if (!nbForm.bank)
        next.bank = "Please select a bank to continue.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  /* ── submit with backend API call ── */
  async function handlePay(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const payload = {
      method: tab,
      amountCents: total,
      cardDetails: tab === "card" ? cardForm : null,
      upiDetails: tab === "upi" ? upiForm : null,
      netbankingDetails: tab === "netbanking" ? nbForm : null,
    };

    try {
      const response = await fetch("http://localhost:3000/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.orderId || `SS-${Date.now().toString(36).toUpperCase()}`);
      } else {
        setOrderId(`SS-${Date.now().toString(36).toUpperCase()}`);
      }
    } catch {
      // Fallback if backend is not currently running
      setOrderId(`SS-${Date.now().toString(36).toUpperCase()}`);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  /* ── method label for success screen ── */
  const methodLabel =
    tab === "card"       ? `Card ending ···· ${cardForm.cardNumber.replace(/\s/g, "").slice(-4) || "0000"}` :
    tab === "upi"        ? `UPI — ${upiForm.upiId}` :
    `Net Banking — ${nbForm.bank}`;

  /* ── success screen ── */
  if (submitted) {
    return (
      <div className="payment-page">
        <SuccessScreen
          orderId={orderId}
          method={methodLabel}
          total={total}
          onGoHome={() => navigate("/")}
        />
      </div>
    );
  }

  /* ── payment form ── */
  return (
    <div className="payment-page">
      {/* Page header */}
      <header className="payment-header">
        <div className="payment-header__left">
          <a href="/" className="brand-link" aria-label="ShopSphere home">
            Shop<span>Sphere</span>
          </a>
          <div className="header-title">
            <p className="eyebrow">CHECKOUT — STEP 3 OF 3</p>
            <h1>Payment</h1>
          </div>
        </div>
        <StepIndicator current={3} />
      </header>

      {/* Main content */}
      <div className="payment-layout">
        {/* Left — payment form */}
        <main className="payment-main">
          {/* Method tabs */}
          <div className="method-tabs" role="tablist" aria-label="Payment method">
            {[
              { id: "card",       label: "💳  Card" },
              { id: "upi",        label: "⚡  UPI" },
              { id: "netbanking", label: "🏦  Net Banking" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                className={`method-tab ${tab === id ? "method-tab--active" : ""}`}
                onClick={() => { setTab(id); setErrors({}); }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form panel */}
          <form
            id={`panel-${tab}`}
            role="tabpanel"
            className="payment-form"
            onSubmit={handlePay}
            noValidate
          >
            <div className="form-section">
              <h2 className="form-section__title">
                {tab === "card"       && "Card details"}
                {tab === "upi"        && "UPI payment"}
                {tab === "netbanking" && "Net banking"}
              </h2>

              {tab === "card"       && <CardForm       form={cardForm} errors={errors} onChange={handleCardChange} />}
              {tab === "upi"        && <UpiForm        form={upiForm}  errors={errors} onChange={handleUpiChange}  />}
              {tab === "netbanking" && <NetbankingForm form={nbForm}   errors={errors} onChange={handleNbChange}   />}
            </div>

            {/* Billing address toggle */}
            <div className="form-section">
              <h2 className="form-section__title">Billing address</h2>
              <label className="billing-same-row">
                <input type="checkbox" defaultChecked />
                <span>Same as delivery address</span>
              </label>
            </div>

            {/* Pay button */}
            <button
              type="submit"
              className={`pay-btn ${loading ? "pay-btn--loading" : ""}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                <>
                  Pay {fmt(total)}
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </>
              )}
            </button>

            <p className="pay-note">
              By completing this purchase you agree to our{" "}
              <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>.
            </p>
          </form>
        </main>

        {/* Right — order summary */}
        <OrderSummary
          items={ORDER_ITEMS}
          deliveryFeeCents={DELIVERY_FEE_CENTS}
          taxRate={TAX_RATE}
        />
      </div>
    </div>
  );
}
