import React, { useState, useEffect } from 'react';
import './Profile.css';

/**
 * Profile Component (Phase 2 - 20% Milestone)
 * Module: User Profile & Address Management
 */
export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'security' | 'addresses'

  const [user, setUser] = useState({
    user_id: 1,
    name: '',
    email: '',
    mobile: '',
    role: 'Customer',
    status: 'Active'
  });

  const [dataSource, setDataSource] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // 1. Fetch current profile details on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setDataSource(data.source || 'connected');
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 2. Handle Save Changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setMessage(null);

    // Basic validation
    if (!user.name || !user.name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    if (!user.mobile || !user.mobile.trim()) {
      setMessage({ type: 'error', text: 'Mobile cannot be empty.' });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user.name,
          mobile: user.mobile,
          email: user.email
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Profile updated successfully!'
        });
        if (data.user) {
          setUser((prev) => ({ ...prev, ...data.user }));
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage({
        type: 'error',
        text: 'Could not connect to backend server. Make sure it is running on port 3000.'
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'seller':
        return 'role-seller';
      case 'admin':
        return 'role-admin';
      case 'super admin':
        return 'role-super-admin';
      case 'customer':
      default:
        return 'role-customer';
    }
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      {/* Header with Title and Visual Role Badge */}
      <div className="profile-header-card">
        <div>
          <h2>Account Settings</h2>
          <p>Manage your profile, delivery addresses, and security</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className={`role-badge ${getRoleClass(user.role)}`}>
            {user.role || 'Customer'}
          </span>
          {dataSource === 'database' && (
            <span className="badge-source" title="Connected to MySQL Database">
              MySQL
            </span>
          )}
        </div>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div className={`profile-alert profile-alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`profile-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Info
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          Address Book
        </button>
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSave} className="profile-card">
          <h3>Personal Details</h3>

          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter email"
              value={user.email || ''}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={user.name || ''}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              placeholder="Enter mobile number"
              value={user.mobile || ''}
              onChange={(e) => setUser({ ...user, mobile: e.target.value })}
              className="form-input"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Tab 2: Security (Password Change wireframe) */}
      {activeTab === 'security' && (
        <div className="profile-card">
          <h3>Password & Security</h3>
          <div className="tab-placeholder">
            <h4>Password Change (Next Milestone)</h4>
            <p>
              Current password verification and new password complexity validation (bcrypt) will be implemented here.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Address Book (Addresses list wireframe) */}
      {activeTab === 'addresses' && (
        <div className="profile-card">
          <h3>Saved Addresses</h3>
          <div className="tab-placeholder">
            <h4>Address Book (Next Milestone)</h4>
            <p>
              Delivery addresses (1:N relation with users) with Add, Edit, and Delete actions will be implemented here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
