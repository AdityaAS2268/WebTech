import React, { useState, useEffect } from 'react';

/**
 * Profile Component (Starter Prototype)
 * Module: User Profile & Address Management
 */
export default function Profile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'Customer'
  });

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
    if (!user.name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    if (!user.mobile.trim()) {
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
          mobile: user.mobile
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
        if (data.user) {
          setUser(data.user);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: 'Could not connect to backend server. Make sure it is running on port 3000.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>My Profile</h2>
      <p style={{ color: '#666' }}>Manage your account settings and personal details.</p>

      {/* Alert Banner */}
      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}
        >
          {message.text}
        </div>
      )}

      {/* Basic Profile Information Section */}
      <form onSubmit={handleSave} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.25rem', marginTop: '1rem' }}>
        <h3>Personal Details</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Email (Read-only)</label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={user.name || ''}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Mobile</label>
          <input
            type="text"
            placeholder="Enter mobile number"
            value={user.mobile || ''}
            onChange={(e) => setUser({ ...user, mobile: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.5rem 1.25rem',
            background: saving ? '#93c5fd' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Upcoming Sections (Work in progress) */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
        <h4>Address Book & Security (In Progress)</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#777' }}>
          Address management and password change functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}
