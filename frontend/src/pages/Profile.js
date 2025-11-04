import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { authAPI } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AvatarSelector from '../components/auth/AvatarSelector';
import { getAvatarById } from '../utils/avatars';
import '../styles/AvatarSelector.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { t } = useLanguage();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const data = await testsAPI.getMyAttempts();
      setAttempts(data);
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = async (avatarId) => {
    try {
      const updatedUser = await authAPI.updateAvatar(avatarId);
      updateUser({ avatar: updatedUser.avatar });
      setShowAvatarSelector(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const currentAvatar = getAvatarById(user?.avatar || 'avatar1');

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <h1 className="card-title">{t('profile.title')}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  fontSize: '5rem',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: currentAvatar.color + '20',
                  border: `4px solid ${currentAvatar.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite'
                }}
              >
                {currentAvatar.emoji}
              </div>
              <button
                onClick={() => setShowAvatarSelector(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                {t('profile.changeAvatar')}
              </button>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('profile.name')}:</strong> {user?.name}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('profile.email')}:</strong> {user?.email}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('profile.role')}:</strong>{' '}
                <span className={`badge ${user?.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>
                  {user?.role}
                </span>
              </div>
              {user?.organization && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('profile.organization')}:</strong> {user.organization}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button onClick={logout} className="btn btn-danger">
              {t('header.logout')}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">{t('profile.testHistory')}</h2>

          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : attempts.length === 0 ? (
            <p>{t('profile.noAttempts')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('profile.date')}</th>
                    <th>{t('profile.testId')}</th>
                    <th>{t('profile.score')}</th>
                    <th>{t('profile.status')}</th>
                    <th>{t('profile.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>{new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}</td>
                      <td>{attempt.testId}</td>
                      <td>
                        {attempt.score !== null && attempt.score !== undefined ? (
                          <span style={{ fontWeight: 'bold' }}>{attempt.score.toFixed(1)}%</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          attempt.status === 'GRADED' ? 'badge-success' :
                          attempt.status === 'SUBMITTED' ? 'badge-info' :
                          'badge-danger'
                        }`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td>
                        {attempt.status === 'GRADED' && (
                          <Link to={`/result/${attempt.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                            {t('profile.viewResult')}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAvatarSelector && (
          <AvatarSelector
            currentAvatar={user?.avatar || 'avatar1'}
            onSelect={handleAvatarSelect}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
