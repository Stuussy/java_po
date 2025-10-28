import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalTests || 0}</div>
            <div className="stat-label">Total Tests</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.publishedTests || 0}</div>
            <div className="stat-label">Published Tests</div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: '2rem' }}>
          <Link to="/admin/tests" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 className="card-title">Manage Tests</h2>
            <p className="card-description">Create, edit, and delete tests</p>
          </Link>

          <Link to="/admin/users" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 className="card-title">Manage Users</h2>
            <p className="card-description">View and manage user accounts</p>
          </Link>

          <Link to="/admin/reports" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 className="card-title">Reports & Analytics</h2>
            <p className="card-description">View test statistics and user performance</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
