import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useLanguage } from '../contexts/LanguageContext';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator';

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

  const passwordErrors = useMemo(() => validatePassword(newPassword), [newPassword]);
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const strengthLabel = strength === 3 ? t('password.strong') : strength === 2 ? t('password.medium') : t('password.weak');
  const strengthColor = strength === 3 ? '#22c55e' : strength === 2 ? '#f59e0b' : '#ef4444';

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

    if (passwordErrors.length > 0) {
      setError(passwordErrors.map(key => t(`password.${key}`)).join('. '));
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
      setError(err.response?.data?.error || err.response?.data?.message || t('resetPassword.failed'));
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
                  minLength={8}
                  disabled={loading}
                />
                {newPassword && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{
                          height: '4px',
                          flex: 1,
                          borderRadius: '2px',
                          background: i <= strength ? strengthColor : '#e2e8f0',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: strengthColor, fontWeight: 600 }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
                <ul style={{ margin: '0.5rem 0 0', padding: '0 0 0 1.2rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <li style={{ color: newPassword.length >= 8 ? '#22c55e' : '#94a3b8' }}>{t('password.passwordMinLength')}</li>
                  <li style={{ color: /[A-Z]/.test(newPassword) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordUppercase')}</li>
                  <li style={{ color: /[a-z]/.test(newPassword) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordLowercase')}</li>
                  <li style={{ color: /\d/.test(newPassword) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordDigit')}</li>
                  <li style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~`]/.test(newPassword) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordSpecial')}</li>
                </ul>
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
                  minLength={8}
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
