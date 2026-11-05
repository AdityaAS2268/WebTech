import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

/**
 * ShopSphere User Profile & Address Management Component
 * Module: Profile, Security (Password), and 1:N Address Book CRUD
 */

// Custom vector icons (0 emojis, sleek stroke SVGs)
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldLockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MapPinIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function Profile({ onBackToShop }) {
  const navigate = useNavigate();

  // Active Tab: 'personal' | 'security' | 'addresses'
  const [activeTab, setActiveTab] = useState("personal");

  // Core Data
  const [user, setUser] = useState({
    user_id: 1,
    name: "",
    email: "",
    mobile: "",
    role: "Customer",
    status: "Active"
  });
  const [addresses, setAddresses] = useState([]);
  const [dataSource, setDataSource] = useState("connected");
  const [loading, setLoading] = useState(true);

  // Alert State: { type: 'success' | 'error', text: string } | null
  const [alert, setAlert] = useState(null);

  // Form States - Personal Info
  const [personalForm, setPersonalForm] = useState({ name: "", email: "", mobile: "" });
  const [personalErrors, setPersonalErrors] = useState({});
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Form States - Security
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [securityErrors, setSecurityErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  // Address Modal States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null = add, object = edit
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [savingAddress, setSavingAddress] = useState(false);

  // Helper: Flash alert with 5s auto-dismiss
  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  // 1. Fetch Profile Data on Mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/profile");
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setPersonalForm({
          name: data.user.name || "",
          email: data.user.email || "",
          mobile: data.user.mobile || ""
        });
        setAddresses(data.user.addresses || []);
        if (data.source) setDataSource(data.source);
      }
    } catch (err) {
      console.warn("Could not connect to profile endpoint:", err);
      showAlert("error", "Could not reach backend server at http://localhost:3000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Personal Info Submit Handler
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setPersonalErrors({});

    const errors = {};
    if (!personalForm.name.trim() || personalForm.name.trim().length < 2) {
      errors.name = "Full Name must be at least 2 characters.";
    }
    if (!personalForm.email.trim() || !personalForm.email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (!personalForm.mobile.trim() || !/^\+?[0-9]{10,15}$/.test(personalForm.mobile.trim())) {
      errors.mobile = "Please enter a valid 10-15 digit mobile number.";
    }

    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      return;
    }

    try {
      setSavingPersonal(true);
      const res = await fetch("http://localhost:3000/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personalForm.name,
          email: personalForm.email,
          mobile: personalForm.mobile
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser((prev) => ({
          ...prev,
          name: personalForm.name.trim(),
          email: personalForm.email.trim(),
          mobile: personalForm.mobile.trim()
        }));
        showAlert("success", data.message || "Personal details updated successfully!");
      } else {
        showAlert("error", data.message || "Failed to update profile.");
      }
    } catch (err) {
      showAlert("error", "Network error updating profile.");
    } finally {
      setSavingPersonal(false);
    }
  };

  // 3. Security (Password Change) Handler
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSecurityErrors({});

    const errors = {};
    if (!securityForm.currentPassword) {
      errors.currentPassword = "Enter your current password.";
    }
    if (!securityForm.newPassword) {
      errors.newPassword = "Enter a new password.";
    } else if (securityForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    } else {
      const hasUpper = /[A-Z]/.test(securityForm.newPassword);
      const hasLower = /[a-z]/.test(securityForm.newPassword);
      const hasNum = /[0-9]/.test(securityForm.newPassword);
      const hasSpec = /[^A-Za-z0-9]/.test(securityForm.newPassword);
      if (!(hasUpper && hasLower && hasNum && hasSpec)) {
        errors.newPassword =
          "Password must include uppercase, lowercase, number, and special character.";
      }
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setSecurityErrors(errors);
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch("http://localhost:3000/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
          confirmPassword: securityForm.confirmPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert("success", data.message || "Password updated successfully!");
        setSecurityForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        showAlert("error", data.message || "Failed to update password.");
      }
    } catch (err) {
      showAlert("error", "Network error updating password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // 4. Address Modal Handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Home",
      name: user.name || "ABCDEFGH",
      phone: user.mobile || "+91 98765 43210",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: addresses.length === 0
    });
    setAddressErrors({});
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label || "Home",
      name: addr.name || user.name || "",
      phone: addr.phone || user.mobile || "",
      line1: addr.line1 || addr.address_line || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      isDefault: Boolean(addr.isDefault)
    });
    setAddressErrors({});
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressErrors({});

    const errors = {};
    if (!addressForm.name.trim()) errors.name = "Recipient name is required.";
    if (!addressForm.phone.trim()) errors.phone = "Phone number is required.";
    if (!addressForm.line1.trim()) errors.line1 = "Address line 1 is required.";
    if (!addressForm.city.trim()) errors.city = "City is required.";
    if (!addressForm.state.trim()) errors.state = "State is required.";
    if (!addressForm.pincode.trim() || !/^[0-9]{5,10}$/.test(addressForm.pincode.trim())) {
      errors.pincode = "Pincode must be 5 to 10 digits.";
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      setSavingAddress(true);
      const targetId = editingAddress?.id || editingAddress?.address_id;

      if (editingAddress) {
        // Edit PUT
        const res = await fetch(`http://localhost:3000/api/profile/addresses/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressForm)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAddresses((prev) =>
            prev.map((a) => {
              const currentId = a.id || a.address_id;
              if (currentId === targetId) return data.address;
              if (addressForm.isDefault) return { ...a, isDefault: false };
              return a;
            })
          );
          showAlert("success", "Address updated successfully.");
          setIsAddressModalOpen(false);
        } else {
          showAlert("error", data.message || "Failed to update address.");
        }
      } else {
        // Add POST
        const res = await fetch("http://localhost:3000/api/profile/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressForm)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAddresses((prev) => {
            const list = addressForm.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
            return [data.address, ...list];
          });
          showAlert("success", "Address added successfully.");
          setIsAddressModalOpen(false);
        } else {
          showAlert("error", data.message || "Failed to add address.");
        }
      }
    } catch (err) {
      showAlert("error", "Error saving address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/profile/addresses/${addressId}/default`, {
        method: "PUT"
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: (a.id || a.address_id) === addressId
          }))
        );
        showAlert("success", "Default delivery address updated.");
      }
    } catch (err) {
      showAlert("error", "Error setting default address.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this delivery address?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/profile/addresses/${addressId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) => prev.filter((a) => (a.id || a.address_id) !== addressId));
        showAlert("success", "Address deleted successfully.");
      } else {
        showAlert("error", data.message || "Failed to delete address.");
      }
    } catch (err) {
      showAlert("error", "Error deleting address.");
    }
  };

  const renderRoleBadge = (role) => {
    const r = (role || "Customer").toLowerCase().replace(/\s+/g, "-");
    return <span className={`role-badge-pill role-badge--${r}`}>{role || "Customer"}</span>;
  };

  const handleBack = () => {
    if (onBackToShop) {
      onBackToShop();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-main-inner">
        {/* Top Header Bar */}
        <header className="profile-top-bar">
          <div className="profile-top-bar__left">
            <p className="profile-eyebrow">YOUR ACCOUNT &amp; SETTINGS</p>
            <h1 className="profile-title">Account Profile</h1>
          </div>
          <div className="profile-top-bar__actions">
            {renderRoleBadge(user.role)}
            {dataSource === "database" && (
              <span className="db-live-indicator" title="Connected to MySQL database">
                <span className="db-live-dot"></span> MySQL Connected
              </span>
            )}
            <button className="profile-back-btn" onClick={handleBack} aria-label="Back to Shop">
              &larr; Back to Shop
            </button>
          </div>
        </header>

        {/* Flash Alert Banner */}
        {alert && (
          <div className={`profile-alert profile-alert--${alert.type}`}>
            <span>{alert.text}</span>
            <button className="profile-alert__close" onClick={() => setAlert(null)} aria-label="Close alert">
              &times;
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="profile-nav-tabs" aria-label="Profile Sections">
          <button
            className={`profile-tab-button ${activeTab === "personal" ? "is-active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <UserIcon /> Personal Info
          </button>
          <button
            className={`profile-tab-button ${activeTab === "security" ? "is-active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <ShieldLockIcon /> Security
          </button>
          <button
            className={`profile-tab-button ${activeTab === "addresses" ? "is-active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <MapPinIcon /> Address Book
            <span className="tab-badge">{addresses.length}</span>
          </button>
        </nav>

        {/* Skeleton loading preview if initial fetch takes time */}
        {loading ? (
          <div className="profile-card">
            <div className="profile-skeleton-line" style={{ width: "45%" }}></div>
            <div className="profile-skeleton-line" style={{ width: "80%" }}></div>
            <div className="profile-skeleton-box" style={{ marginTop: "16px" }}></div>
          </div>
        ) : (
          <>
            {/* TAB 1: Personal Details */}
            {activeTab === "personal" && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <h2>Personal Information</h2>
                    <p>Update your contact details and account identity</p>
                  </div>
                </div>

                <form onSubmit={handlePersonalSubmit}>
                  <div className="form-grid-2col">
                    <div className="form-group-item">
                      <label htmlFor="user-name">Full Name</label>
                      <input
                        id="user-name"
                        type="text"
                        className={`profile-input ${personalErrors.name ? "is-error" : ""}`}
                        placeholder="e.g. Jane Doe"
                        value={personalForm.name}
                        onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                      />
                      {personalErrors.name && (
                        <span className="input-hint-error">{personalErrors.name}</span>
                      )}
                    </div>

                    <div className="form-group-item">
                      <label htmlFor="user-email">Email Address</label>
                      <input
                        id="user-email"
                        type="email"
                        className={`profile-input ${personalErrors.email ? "is-error" : ""}`}
                        placeholder="e.g. jane.doe@university.edu"
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                      />
                      {personalErrors.email && (
                        <span className="input-hint-error">{personalErrors.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-group-item">
                      <label htmlFor="user-mobile">Phone Number</label>
                      <input
                        id="user-mobile"
                        type="tel"
                        className={`profile-input ${personalErrors.mobile ? "is-error" : ""}`}
                        placeholder="e.g. 9876543210"
                        value={personalForm.mobile}
                        onChange={(e) => setPersonalForm({ ...personalForm, mobile: e.target.value })}
                      />
                      {personalErrors.mobile && (
                        <span className="input-hint-error">{personalErrors.mobile}</span>
                      )}
                    </div>

                    <div className="form-group-item">
                      <label>User Role</label>
                      <input
                        type="text"
                        className="profile-input profile-input-readonly"
                        value={user.role || "Customer"}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <button type="submit" className="profile-btn-primary" disabled={savingPersonal}>
                      {savingPersonal ? "Saving Details..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Security & Password */}
            {activeTab === "security" && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <h2>Change Password</h2>
                    <p>Keep your account secure with a strong and unique password</p>
                  </div>
                </div>

                <div className="password-requirements-card">
                  <p>Password Security Requirements:</p>
                  <ul>
                    <li>At least 8 characters</li>
                    <li>At least 1 uppercase letter (A-Z)</li>
                    <li>At least 1 lowercase letter (a-z)</li>
                    <li>At least 1 number (0-9) &amp; 1 symbol</li>
                  </ul>
                </div>

                <form onSubmit={handleSecuritySubmit}>
                  <div className="form-group-item" style={{ maxWidth: "420px", marginBottom: "16px" }}>
                    <label htmlFor="current-pw">Current Password</label>
                    <input
                      id="current-pw"
                      type="password"
                      placeholder="••••••••"
                      className={`profile-input ${securityErrors.currentPassword ? "is-error" : ""}`}
                      value={securityForm.currentPassword}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                      }
                    />
                    {securityErrors.currentPassword && (
                      <span className="input-hint-error">{securityErrors.currentPassword}</span>
                    )}
                  </div>

                  <div className="form-grid-2col" style={{ maxWidth: "860px" }}>
                    <div className="form-group-item">
                      <label htmlFor="new-pw">New Password</label>
                      <input
                        id="new-pw"
                        type="password"
                        placeholder="••••••••"
                        className={`profile-input ${securityErrors.newPassword ? "is-error" : ""}`}
                        value={securityForm.newPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, newPassword: e.target.value })
                        }
                      />
                      {securityErrors.newPassword && (
                        <span className="input-hint-error">{securityErrors.newPassword}</span>
                      )}
                    </div>

                    <div className="form-group-item">
                      <label htmlFor="confirm-pw">Confirm New Password</label>
                      <input
                        id="confirm-pw"
                        type="password"
                        placeholder="••••••••"
                        className={`profile-input ${securityErrors.confirmPassword ? "is-error" : ""}`}
                        value={securityForm.confirmPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, confirmPassword: e.target.value })
                        }
                      />
                      {securityErrors.confirmPassword && (
                        <span className="input-hint-error">{securityErrors.confirmPassword}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <button type="submit" className="profile-btn-primary" disabled={savingPassword}>
                      {savingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: Address Book */}
            {activeTab === "addresses" && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <h2>Saved Delivery Addresses</h2>
                    <p>Manage shipping locations for faster marketplace checkout</p>
                  </div>
                  <button className="profile-btn-primary" onClick={handleOpenAddAddress}>
                    + Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="address-empty-state">
                    <div className="address-empty-icon">
                      <MapPinIcon size={32} />
                    </div>
                    <h3>No saved addresses found</h3>
                    <p>Add a delivery address to complete orders with a single tap.</p>
                    <button className="profile-btn-primary" onClick={handleOpenAddAddress}>
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="address-cards-grid">
                    {addresses.map((addr) => {
                      const addrId = addr.id || addr.address_id;
                      return (
                        <div key={addrId} className="address-item-card">
                          <div>
                            <div className="address-card-header">
                              <span className="address-tag">{addr.label || "Delivery Destination"}</span>
                              {addr.isDefault && (
                                <span className="default-pill-badge">DEFAULT</span>
                              )}
                            </div>
                            <div className="address-card-body">
                              <p className="addr-recipient">{addr.name || user.name}</p>
                              <p className="addr-street">{addr.line1 || addr.address_line}</p>
                              {addr.line2 && <p className="addr-street2">{addr.line2}</p>}
                              <p className="addr-city-state">
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              {addr.phone && <p className="addr-phone">{addr.phone}</p>}
                            </div>
                          </div>
                          <div className="address-card-actions">
                            <button
                              className="profile-btn-secondary"
                              onClick={() => handleOpenEditAddress(addr)}
                            >
                              Edit
                            </button>
                            {!addr.isDefault && (
                              <button
                                className="profile-btn-secondary"
                                onClick={() => handleSetDefaultAddress(addrId)}
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              className="profile-btn-danger-outline"
                              onClick={() => handleDeleteAddress(addrId)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal: Add or Edit Address */}
        {isAddressModalOpen && (
          <div className="profile-modal-backdrop" onClick={() => setIsAddressModalOpen(false)}>
            <div className="profile-modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h3>{editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}</h3>
                <button
                  className="profile-alert__close"
                  onClick={() => setIsAddressModalOpen(false)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddressSubmit}>
                <div className="form-grid-2col">
                  <div className="form-group-item">
                    <label htmlFor="modal-label">Address Label</label>
                    <select
                      id="modal-label"
                      className="profile-input"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="modal-name">Recipient Name</label>
                    <input
                      id="modal-name"
                      type="text"
                      placeholder="e.g. ABCDEFGH"
                      className={`profile-input ${addressErrors.name ? "is-error" : ""}`}
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    />
                    {addressErrors.name && (
                      <span className="input-hint-error">{addressErrors.name}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-item" style={{ marginTop: "12px" }}>
                  <label htmlFor="modal-phone">Contact Phone</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    className={`profile-input ${addressErrors.phone ? "is-error" : ""}`}
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  />
                  {addressErrors.phone && (
                    <span className="input-hint-error">{addressErrors.phone}</span>
                  )}
                </div>

                <div className="form-group-item" style={{ marginTop: "12px" }}>
                  <label htmlFor="modal-line1">Address Line 1 (House/Flat, Street)</label>
                  <input
                    id="modal-line1"
                    type="text"
                    placeholder="e.g. 24, Lake View Road"
                    className={`profile-input ${addressErrors.line1 ? "is-error" : ""}`}
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  />
                  {addressErrors.line1 && (
                    <span className="input-hint-error">{addressErrors.line1}</span>
                  )}
                </div>

                <div className="form-group-item" style={{ marginTop: "12px" }}>
                  <label htmlFor="modal-line2">Address Line 2 (Area, Landmark)</label>
                  <input
                    id="modal-line2"
                    type="text"
                    placeholder="e.g. Velachery"
                    className="profile-input"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                  />
                </div>

                <div className="form-grid-2col" style={{ marginTop: "12px" }}>
                  <div className="form-group-item">
                    <label htmlFor="modal-city">City</label>
                    <input
                      id="modal-city"
                      type="text"
                      placeholder="e.g. Chennai"
                      className={`profile-input ${addressErrors.city ? "is-error" : ""}`}
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                    {addressErrors.city && (
                      <span className="input-hint-error">{addressErrors.city}</span>
                    )}
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="modal-state">State</label>
                    <input
                      id="modal-state"
                      type="text"
                      placeholder="e.g. Tamil Nadu"
                      className={`profile-input ${addressErrors.state ? "is-error" : ""}`}
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                    {addressErrors.state && (
                      <span className="input-hint-error">{addressErrors.state}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-item" style={{ marginTop: "12px" }}>
                  <label htmlFor="modal-pincode">Pincode / ZIP</label>
                  <input
                    id="modal-pincode"
                    type="text"
                    placeholder="e.g. 600042"
                    className={`profile-input ${addressErrors.pincode ? "is-error" : ""}`}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  />
                  {addressErrors.pincode && (
                    <span className="input-hint-error">{addressErrors.pincode}</span>
                  )}
                </div>

                <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="modal-is-default"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  <label htmlFor="modal-is-default" style={{ margin: 0, cursor: "pointer", fontSize: "14px" }}>
                    Make this my default delivery address
                  </label>
                </div>

                <div className="profile-modal-actions">
                  <button
                    type="button"
                    className="profile-btn-secondary"
                    onClick={() => setIsAddressModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-primary"
                    disabled={savingAddress}
                  >
                    {savingAddress
                      ? "Saving..."
                      : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
