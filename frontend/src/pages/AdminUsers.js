import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import { useLanguage } from '../contexts/LanguageContext';

const AdminUsers = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';

    try {
      await adminAPI.updateUserRole(id, newRole);
      const updatedUsers = users.map((user) =>
        user.id === id ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>{t('admin.users.title')}</h1>

        {users.length === 0 ? (
          <div className="card">
            <p>{t('admin.users.noUsers')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-mobile-cards">
              <thead>
                <tr>
                  <th>{t('admin.users.tableName')}</th>
                  <th>{t('admin.users.tableEmail')}</th>
                  <th>{t('admin.users.tableRole')}</th>
                  <th>{t('admin.users.tableOrganization')}</th>
                  <th>{t('admin.users.tableRegistered')}</th>
                  <th>{t('admin.users.tableActions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td data-label={t('admin.users.tableName')}>{user.name}</td>
                    <td data-label={t('admin.users.tableEmail')}>{user.email}</td>
                    <td data-label={t('admin.users.tableRole')}>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td data-label={t('admin.users.tableOrganization')}>{user.organization || '-'}</td>
                    <td data-label={t('admin.users.tableRegistered')}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td data-label={t('admin.users.tableActions')}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.75rem' }}
                        >
                          {t('admin.users.changeRole')}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.75rem' }}
                        >
                          {t('admin.users.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
