import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const VerifyEmail = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');
  const { verifyEmail, resendVerification } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError(t('verify.codeIncomplete'));
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, fullCode);
      navigate('/tests');
    } catch (err) {
      setError(err.response?.data?.message || t('verify.invalidCode'));
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendVerification(email);
      setResendMessage(t('verify.codeSent'));
      setResendCooldown(60);
      setTimeout(() => setResendMessage(''), 5000);
    } catch {
      setError(t('verify.resendFailed'));
    }
  };

  if (!email) return null;

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.75rem',
            }}>
              ✉
            </div>
            <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>{t('verify.title')}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {t('verify.description').replace('{email}', email)}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {resendMessage && <div className="alert alert-info">{resendMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              margin: '1.5rem 0',
            }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    border: '2px solid var(--border-color, #ddd)',
                    borderRadius: '12px',
                    outline: 'none',
                    background: 'var(--bg-secondary, #f8f9fa)',
                    color: 'var(--text-primary, #333)',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? t('verify.verifying') : t('verify.submit')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {t('verify.noCode')}
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary, #667eea)',
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}
            >
              {resendCooldown > 0
                ? t('verify.resendIn').replace('{seconds}', resendCooldown)
                : t('verify.resend')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
