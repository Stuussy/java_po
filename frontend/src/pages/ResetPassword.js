import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const result = await authAPI.validateResetToken(token);
      setTokenValid(result.valid);
      if (!result.valid) {
        setError(t('resetPassword.invalidToken'));
      }
    } catch (err) {
      setTokenValid(false);
      setError(t('resetPassword.invalidToken'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, newPassword);
      setMessage(t('resetPassword.success'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || t('resetPassword.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{t('resetPassword.title')}</h2>

          {message && (
            <div style={{
              padding: '1rem',
              background: '#dcfce7',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              color: '#16a34a',
              marginBottom: '1rem'
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {!token && (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <p>{t('resetPassword.noToken')}</p>
              <Link to="/forgot-password" className="btn btn-primary">
                {t('resetPassword.requestNew')}
              </Link>
            </div>
          )}

          {token && tokenValid === false && (
            <div style={{ textAlign: 'center' }}>
              <Link to="/forgot-password" className="btn btn-primary">
                {t('resetPassword.requestNew')}
              </Link>
            </div>
          )}

          {token && tokenValid && !message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('resetPassword.newPassword')}</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('resetPassword.confirmPassword')}</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? t('resetPassword.resetting') : t('resetPassword.resetButton')}
              </button>
            </form>
          )}

          <div className="auth-link" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">{t('forgotPassword.backToLogin')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
