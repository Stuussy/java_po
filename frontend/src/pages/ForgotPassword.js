import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(t('forgotPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{t('forgotPassword.title')}</h2>

          {!sent ? (
            <>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>
                {t('forgotPassword.description')}
              </p>

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
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem',
              }}>
                {'\u2709\uFE0F'}
              </div>

              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                {t('forgotPassword.emailSentTitle')}
              </h3>

              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {t('forgotPassword.emailSentDesc').replace('{email}', email)}
              </p>

              <div style={{
                padding: '1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                marginBottom: '1.5rem',
              }}>
                <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {t('forgotPassword.checkSpam')}
                </p>
              </div>

              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                {t('forgotPassword.tryAnotherEmail')}
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
