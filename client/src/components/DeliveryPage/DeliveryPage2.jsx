import { useMemo, useState } from "react";
import "./DeliveryPage.css";
import PageHeader from "./Elements/PageHeader.jsx";

const initialAddresses = [
    {
        id: 1,
        label: "Home",
        name: "ABCD",
        phone: "+91 98765 43210",
        line1: "24, Lake View Road",
        line2: "Velachery",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600042",
        isDefault: true,
    },
    {
        id: 2,
        label: "Work",
        name: "ABCD",
        phone: "+91 98765 43210",
        line1: "3rd Floor, Orion Business Centre",
        line2: "Guindy Industrial Estate",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600032",
        isDefault: false,
    },
];

const emptyAddress = {
    label: "Home",
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
};

function PinIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

export default function DeliveryPage() {
    const [addresses, setAddresses] = useState(initialAddresses);
    const [selectedId, setSelectedId] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyAddress);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState("");

    const selectedAddress = useMemo(
        () => addresses.find((address) => address.id === selectedId),
        [addresses, selectedId]
    );

    function startAddAddress() {
        setEditingId(null);
        setForm(emptyAddress);
        setErrors({});
        setNotice("");
        setShowForm(true);
    }

    function startEditAddress(address) {
        setEditingId(address.id);
        setForm({
            label: address.label,
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
        });
        setErrors({});
        setNotice("");
        setShowForm(true);
    }

    function updateField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: "" }));
    }

    function validate() {
        const next = {};
        ["name", "phone", "line1", "city", "state", "pincode"].forEach((key) => {
            if (!form[key].trim()) next[key] = "This field is required.";
        });
        if (form.phone && !/^[+]?[\d\s()-]{10,16}$/.test(form.phone.trim())) {
            next.phone = "Enter a valid phone number.";
        }
        if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
            next.pincode = "Enter a 6-digit PIN code.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function saveAddress(event) {
        event.preventDefault();
        if (!validate()) return;

        const cleaned = {
            ...form,
            name: form.name.trim(),
            phone: form.phone.trim(),
            line1: form.line1.trim(),
            line2: form.line2.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            isDefault: !editingId && addresses.length === 0,
        };

        if (editingId) {
            setAddresses((current) =>
                current.map((address) =>
                    address.id === editingId ? { ...address, ...cleaned } : address
                )
            );
            setNotice("Address updated.");
        } else {
            const newAddress = { ...cleaned, id: Date.now() };
            setAddresses((current) => [...current, newAddress]);
            setSelectedId(newAddress.id);
            setNotice("Address added and selected.");
        }
        setShowForm(false);
    }

    function removeAddress(id) {
        const remaining = addresses.filter((address) => address.id !== id);
        setAddresses(remaining);
        if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
        setNotice("Address removed.");
    }

    function setDefaultAddress(id) {
        setAddresses((current) =>
            current.map((address) => ({ ...address, isDefault: address.id === id }))
        );
        setNotice("Default address updated.");
    }

    function continueToDelivery() {
        if (!selectedAddress) {
            setNotice("Add or select an address to continue.");
            return;
        }
        setNotice(`Delivery address selected: ${selectedAddress.label}. Backend and next checkout step will be connected later.`);
    }

    return (
        <main className="delivery-page">

            <PageHeader />

            <div className="delivery-layout">
                <section className="address-section" aria-labelledby="address-title">
                    <div className="section-heading">
                        <div>
                            <span className="section-index">01</span>
                            <h2 id="address-title">Your addresses</h2>
                        </div>
                        <span className="subtle-count">{addresses.length} saved</span>
                    </div>

                    {addresses.length > 0 ? (
                        <div className="address-grid">
                            {addresses.map((address) => {
                                const isSelected = selectedId === address.id;
                                return (
                                    <article
                                        key={address.id}
                                        className={`address-card ${isSelected ? "address-card--selected" : ""}`}
                                    >
                                        <button
                                            type="button"
                                            className="address-card__select"
                                            onClick={() => setSelectedId(address.id)}
                                            aria-pressed={isSelected}
                                            aria-label={`Select ${address.label} address`}
                                        >
                      <span className={`selection-mark ${isSelected ? "selection-mark--active" : ""}`}>
                        {isSelected && <CheckIcon />}
                      </span>
                                            <span className="address-label">{address.label}</span>
                                            {address.isDefault && <span className="default-tag">DEFAULT</span>}
                                        </button>

                                        <div className="address-card__body">
                                            <p className="recipient">{address.name}</p>
                                            <p>{address.line1}</p>
                                            {address.line2 && <p>{address.line2}</p>}
                                            <p>{address.city}, {address.state} {address.pincode}</p>
                                            <p className="address-phone">{address.phone}</p>
                                        </div>

                                        <div className="address-card__footer">
                                            <button type="button" className="text-button" onClick={() => startEditAddress(address)}>
                                                Edit
                                            </button>
                                            {!address.isDefault && (
                                                <button type="button" className="text-button" onClick={() => setDefaultAddress(address.id)}>
                                                    Make default
                                                </button>
                                            )}
                                            <button type="button" className="text-button text-button--muted" onClick={() => removeAddress(address.id)}>
                                                Remove
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-addresses">
                            <span className="empty-icon"><PinIcon /></span>
                            <h3>No saved addresses yet</h3>
                            <p>Add an address and we’ll use it for this delivery.</p>
                        </div>
                    )}

                    <button type="button" className="add-address-card" onClick={startAddAddress}>
                        <span className="add-icon"><PlusIcon /></span>
                        <span className="add-address-copy">
              <strong>Add a new address</strong>
              <small>Use another home, office or delivery location</small>
            </span>
                        <span className="add-arrow" aria-hidden="true">↗</span>
                    </button>

                    {notice && <p className="inline-notice" role="status">{notice}</p>}
                </section>

                <aside className="delivery-aside">
                    <div className="aside-card">
                        <div className="aside-title-row">
                            <span className="aside-icon"><PinIcon /></span>
                            <div>
                                <p className="aside-kicker">DELIVERING TO</p>
                                <h2>{selectedAddress ? selectedAddress.label : "No address selected"}</h2>
                            </div>
                        </div>
                        {selectedAddress ? (
                            <div className="selected-address">
                                <strong>{selectedAddress.name}</strong>
                                <p>{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}</p>
                                <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}</p>
                                <p>{selectedAddress.phone}</p>
                            </div>
                        ) : (
                            <p className="aside-empty-copy">Select a saved address or add a new one to continue.</p>
                        )}
                        <div className="aside-divider" />
                        <div className="delivery-note">
                            <span className="note-dot" />
                            <p>Delivery options and dates will be shown in the next step.</p>
                        </div>
                        <button type="button" className="continue-button" onClick={continueToDelivery}>
                            Continue <span aria-hidden="true">→</span>
                        </button>
                        <p className="secure-note"><span aria-hidden="true">⌑</span> Your address details stay private.</p>
                    </div>
                    <div className="help-note">
                        <strong>Need to send it somewhere else?</strong>
                        <p>You can add another address now and choose it for this order.</p>
                    </div>
                </aside>
            </div>

            {showForm && (
                <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setShowForm(false);
                }}>
                    <section className="address-modal" role="dialog" aria-modal="true" aria-labelledby="address-form-title">
                        <div className="modal-header">
                            <div>
                                <p className="eyebrow">DELIVERY DETAILS</p>
                                <h2 id="address-form-title">{editingId ? "Edit address" : "Add a new address"}</h2>
                                <p>Enter the details exactly as they should appear on the parcel.</p>
                            </div>
                            <button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="Close address form">×</button>
                        </div>
                        <form onSubmit={saveAddress} noValidate>
                            <div className="address-type-picker" aria-label="Address type">
                                {["Home", "Work", "Other"].map((label) => (
                                    <button
                                        key={label}
                                        type="button"
                                        className={`type-option ${form.label === label ? "type-option--active" : ""}`}
                                        onClick={() => setForm((current) => ({ ...current, label }))}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="form-grid">
                                <label className="form-field">
                                    <span>Full name <i>*</i></span>
                                    <input name="name" value={form.name} onChange={updateField} placeholder="Name of recipient" autoComplete="name" />
                                    {errors.name && <small className="field-error">{errors.name}</small>}
                                </label>
                                <label className="form-field">
                                    <span>Mobile number <i>*</i></span>
                                    <input name="phone" value={form.phone} onChange={updateField} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" />
                                    {errors.phone && <small className="field-error">{errors.phone}</small>}
                                </label>
                                <label className="form-field form-field--wide">
                                    <span>Flat, house no. and building <i>*</i></span>
                                    <input name="line1" value={form.line1} onChange={updateField} placeholder="House / flat number, building name" autoComplete="address-line1" />
                                    {errors.line1 && <small className="field-error">{errors.line1}</small>}
                                </label>
                                <label className="form-field form-field--wide">
                                    <span>Area, street, landmark</span>
                                    <input name="line2" value={form.line2} onChange={updateField} placeholder="Street, area or nearby landmark" autoComplete="address-line2" />
                                </label>
                                <label className="form-field">
                                    <span>City <i>*</i></span>
                                    <input name="city" value={form.city} onChange={updateField} placeholder="City" autoComplete="address-level2" />
                                    {errors.city && <small className="field-error">{errors.city}</small>}
                                </label>
                                <label className="form-field">
                                    <span>State <i>*</i></span>
                                    <input name="state" value={form.state} onChange={updateField} placeholder="State" autoComplete="address-level1" />
                                    {errors.state && <small className="field-error">{errors.state}</small>}
                                </label>
                                <label className="form-field">
                                    <span>PIN code <i>*</i></span>
                                    <input name="pincode" value={form.pincode} onChange={updateField} placeholder="6-digit PIN code" inputMode="numeric" maxLength={6} autoComplete="postal-code" />
                                    {errors.pincode && <small className="field-error">{errors.pincode}</small>}
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="save-button">{editingId ? "Save changes" : "Save address"}</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
