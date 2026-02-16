import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authAPI.forgotPassword(email);
      setMessage(t('forgotPassword.successMessage'));
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err) {
      setError(t('forgotPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReset = () => {
    navigate(`/reset-password?token=${resetToken}`);
  };

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{t('forgotPassword.title')}</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>
            {t('forgotPassword.description')}
          </p>

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

          {!resetToken ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('login.email')}</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? t('forgotPassword.sending') : t('forgotPassword.sendLink')}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '1rem',
                background: '#f0f9ff',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: 0, color: '#1e40af', fontWeight: 'bold' }}>
                  {t('forgotPassword.tokenGenerated')}
                </p>
                <code style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#e0e7ff',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all'
                }}>
                  {resetToken}
                </code>
              </div>
              <button
                onClick={handleGoToReset}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {t('forgotPassword.goToReset')}
              </button>
            </div>
          )}

          <div className="auth-link" style={{ marginTop: '1.5rem' }}>
            <Link to="/login">{t('forgotPassword.backToLogin')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
