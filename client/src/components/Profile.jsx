import React, { useState } from 'react';

/**
 * Profile Component (Initial Draft)
 * Module: User Profile & Address Management
 */
export default function Profile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'Customer'
  });

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>My Profile</h2>
      <p style={{ color: '#666' }}>Manage your account settings and personal details.</p>

      {/* Basic Profile Information Section */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.25rem', marginTop: '1rem' }}>
        <h3>Personal Details</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Mobile</label>
          <input
            type="text"
            placeholder="Enter mobile number"
            value={user.mobile}
            onChange={(e) => setUser({ ...user, mobile: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <button style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Save Changes
        </button>
      </div>

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
