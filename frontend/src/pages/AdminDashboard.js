import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import { useLanguage } from '../contexts/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
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
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>{t('admin.dashboard.title')}</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">{t('admin.dashboard.totalUsers')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalTests || 0}</div>
            <div className="stat-label">{t('admin.dashboard.totalTests')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.publishedTests || 0}</div>
            <div className="stat-label">{t('admin.dashboard.publishedTests')}</div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: '2rem' }}>
          <Link to="/admin/tests" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 className="card-title">{t('admin.dashboard.manageTests')}</h2>
            <p className="card-description">{t('admin.dashboard.manageTestsDesc')}</p>
          </Link>

          <Link to="/admin/users" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 className="card-title">{t('admin.dashboard.manageUsers')}</h2>
            <p className="card-description">{t('admin.dashboard.manageUsersDesc')}</p>
          </Link>

          <Link to="/admin/reports" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2 className="card-title">{t('admin.dashboard.reports')}</h2>
            <p className="card-description">{t('admin.dashboard.reportsDesc')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
