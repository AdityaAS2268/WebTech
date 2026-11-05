import { useEffect } from "react";
import EditAddressModalSideTips from "./EditAddressModalSideTips.jsx";

export default function EditAddressModal({
                                         showForm,
                                         editingId,
                                         form,
                                         errors,
                                         updateField,
                                         saveAddress,
                                         useTemporarilyAddress,
                                         setShowForm,
                                     }) {
    if (!showForm) return null;

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") setShowForm(false);
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setShowForm]);

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="address-modal">
                <div className="modal-inner-container">
                    <div className="modal-header">
                        <div>
                            <p className="PageIndication eyebrow">ADDRESS DETAILS</p>
                            <h2 id="modal-title">
                                {editingId ? "Edit delivery address" : "Add a new address"}
                            </h2>
                            <p>Enter your recipient details and exact delivery location.</p>
                        </div>
                        <button
                            type="button"
                            className="close-button"
                            onClick={() => setShowForm(false)}
                            aria-label="Close modal"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="modal-split-layout">

                        <div className="modal-form-column">
                            <form onSubmit={saveAddress} noValidate>
                                <div className="address-type-picker">
                                    {["Home", "Work", "Other"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`type-option ${form.label === type ? "type-option--active" : ""}`}
                                            onClick={() =>
                                                updateField({ target: { name: "label", value: type } })
                                            }
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="form-grid">
                                    <label className="form-field form-field--wide">
                                        <span>Recipient Name <i>*</i></span>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Full Name"
                                            value={form.name}
                                            onChange={updateField}
                                        />
                                        {errors.name && <span className="field-error">{errors.name}</span>}
                                    </label>

                                    <label className="form-field">
                                        <span>Phone Number <i>*</i></span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="+91 98765 43210"
                                            value={form.phone}
                                            onChange={updateField}
                                        />
                                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                                    </label>

                                    <label className="form-field">
                                        <span>PIN Code <i>*</i></span>
                                        <input
                                            type="text"
                                            name="pincode"
                                            placeholder="6-digit PIN"
                                            value={form.pincode}
                                            onChange={updateField}
                                            maxLength={6}
                                        />
                                        {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                                    </label>

                                    <label className="form-field form-field--wide">
                                        <span>Address Line 1 <i>*</i></span>
                                        <input
                                            type="text"
                                            name="line1"
                                            placeholder="House no., Building name, Street"
                                            value={form.line1}
                                            onChange={updateField}
                                        />
                                        {errors.line1 && <span className="field-error">{errors.line1}</span>}
                                    </label>

                                    <label className="form-field form-field--wide">
                                        <span>Address Line 2 (Optional)</span>
                                        <input
                                            type="text"
                                            name="line2"
                                            placeholder="Locality, Landmark, Area"
                                            value={form.line2}
                                            onChange={updateField}
                                        />
                                    </label>

                                    <label className="form-field">
                                        <span>City <i>*</i></span>
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City"
                                            value={form.city}
                                            onChange={updateField}
                                        />
                                        {errors.city && <span className="field-error">{errors.city}</span>}
                                    </label>

                                    <label className="form-field">
                                        <span>State <i>*</i></span>
                                        <input
                                            type="text"
                                            name="state"
                                            placeholder="State"
                                            value={form.state}
                                            onChange={updateField}
                                        />
                                        {errors.state && <span className="field-error">{errors.state}</span>}
                                    </label>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </button>

                                    {!editingId && (
                                        <button
                                            type="button"
                                            className="secondary-action-button"
                                            onClick={useTemporarilyAddress}
                                        >
                                            Use Temporarily (Don't Save)
                                        </button>
                                    )}

                                    <button type="submit" className="save-button">
                                        {editingId ? "Save Changes" : "Save Address"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <EditAddressModalSideTips />

                    </div>
                </div>
            </div>
        </div>
    );
}