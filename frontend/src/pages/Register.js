import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const passwordErrors = useMemo(() => validatePassword(formData.password), [formData.password]);
  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const strengthLabel = strength === 3 ? t('password.strong') : strength === 2 ? t('password.medium') : t('password.weak');
  const strengthColor = strength === 3 ? '#22c55e' : strength === 2 ? '#f59e0b' : '#ef4444';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordErrors.length > 0) {
      setError(passwordErrors.map(key => t(`password.${key}`)).join('. '));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
      });

      if (result.requiresVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        navigate('/tests');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('register.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{t('register.title')}</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('register.name')}</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('register.email')}</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('register.password')}</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {formData.password && (
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
                <li style={{ color: formData.password.length >= 8 ? '#22c55e' : '#94a3b8' }}>{t('password.passwordMinLength')}</li>
                <li style={{ color: /[A-Z]/.test(formData.password) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordUppercase')}</li>
                <li style={{ color: /[a-z]/.test(formData.password) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordLowercase')}</li>
                <li style={{ color: /\d/.test(formData.password) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordDigit')}</li>
                <li style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~`]/.test(formData.password) ? '#22c55e' : '#94a3b8' }}>{t('password.passwordSpecial')}</li>
              </ul>
            </div>

            <div className="form-group">
              <label className="form-label">{t('register.confirmPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('register.organization')}</label>
              <input
                type="text"
                name="organization"
                className="form-control"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? t('register.creatingAccount') : t('register.submit')}
            </button>
          </form>

          <div className="auth-link">
            {t('register.hasAccount')} <Link to="/login">{t('register.loginLink')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
