import { useState } from "react";
import "./DeliveryPage.css";

const sampleAddresses = [
  {
    id: 1,
    label: "Home",
    name: "Aditya S",
    phone: "+91 98765 43210",
    line1: "42, Green Park Colony",
    line2: "Anna Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040",
    isDefault: true,
  },
  {
    id: 2,
    label: "Work",
    name: "Aditya S",
    phone: "+91 91234 56789",
    line1: "14th Floor, Tidel Park",
    line2: "Taramani",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600113",
    isDefault: false,
  },
];

export default function DeliveryPage() {
  const [selectedId, setSelectedId] = useState(1);

  const selectedAddress = sampleAddresses.find((a) => a.id === selectedId);

  return (
    <main className="delivery-page">
      {/* Page Header */}
      <header className="delivery-header">
        <div className="delivery-header__left">
          <p className="eyebrow">CHECKOUT — STEP 1 OF 3</p>
          <h1>Delivery Address</h1>
          <p className="delivery-header__subtitle">
            Choose where you'd like your order delivered.
          </p>
        </div>

        <nav className="checkout-steps" aria-label="Checkout progress">
          <div className="step step--active">
            <span className="step__num">1</span>
            <span>Address</span>
          </div>
          <span className="step__divider" aria-hidden="true" />
          <div className="step">
            <span className="step__num">2</span>
            <span>Delivery</span>
          </div>
          <span className="step__divider" aria-hidden="true" />
          <div className="step">
            <span className="step__num">3</span>
            <span>Payment</span>
          </div>
        </nav>
      </header>

      {/* Content Layout */}
      <div className="delivery-layout">

        {/* Address List */}
        <section className="address-section" aria-labelledby="address-heading">
          <div className="section-title">
            <h2 id="address-heading">Saved Addresses</h2>
            <span className="address-count">{sampleAddresses.length} saved</span>
          </div>

          <div className="address-grid">
            {sampleAddresses.map((address) => {
              const isSelected = address.id === selectedId;
              return (
                <article
                  key={address.id}
                  className={`address-card ${isSelected ? "address-card--selected" : ""}`}
                >
                  <button
                    className="address-card__selector"
                    onClick={() => setSelectedId(address.id)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${address.label} address`}
                  >
                    <span className={`radio-dot ${isSelected ? "radio-dot--active" : ""}`}>
                      {isSelected && (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      )}
                    </span>
                    <span className="address-label-badge">{address.label}</span>
                    {address.isDefault && (
                      <span className="default-chip">DEFAULT</span>
                    )}
                  </button>

                  <div className="address-body">
                    <p className="address-name">{address.name}</p>
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} — {address.pincode}
                    </p>
                    <p className="address-phone">{address.phone}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Add Address — placeholder for later */}
          <button className="add-address-btn" disabled>
            <span className="add-address-btn__icon" aria-hidden="true">+</span>
            <span>Add new address</span>
            <span className="add-address-btn__hint">(coming soon)</span>
          </button>
        </section>

        {/* Order Summary Sidebar */}
        <aside className="delivery-aside">
          <div className="aside-card">
            <p className="eyebrow">DELIVERING TO</p>
            {selectedAddress ? (
              <address className="selected-preview">
                <strong>{selectedAddress.name}</strong>
                <span>{selectedAddress.line1}</span>
                {selectedAddress.line2 && <span>{selectedAddress.line2}</span>}
                <span>
                  {selectedAddress.city}, {selectedAddress.state}
                </span>
                <span>PIN: {selectedAddress.pincode}</span>
                <span className="preview-phone">{selectedAddress.phone}</span>
              </address>
            ) : (
              <p className="no-selection">No address selected.</p>
            )}

            <div className="aside-divider" />

            <button
              className="continue-btn"
              disabled={!selectedAddress}
              onClick={() => alert("Delivery options step coming next!")}
            >
              Continue to Delivery Options
              <span aria-hidden="true">→</span>
            </button>

            <p className="secure-note">
              <span aria-hidden="true">🔒</span> Secured checkout
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
