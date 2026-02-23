import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { useLanguage } from '../contexts/LanguageContext';

const VerifyCertificate = () => {
  const { code } = useParams();
  const { t } = useLanguage();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, [code]);

  const verifyCertificate = async () => {
    try {
      const response = await axios.get(`/certificates/verify/${code}`);
      setCertificate(response.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {error ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>&#10060;</div>
            <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
              {t('verifyCert.invalid')}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('verifyCert.invalidDesc')}
            </p>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>&#9989;</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>
              {t('verifyCert.valid')}
            </h2>

            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'left',
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {t('verifyCert.student')}
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {certificate.studentName}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {t('verifyCert.test')}
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  {certificate.testTitle}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {t('verifyCert.score')}
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                    {certificate.score?.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {t('verifyCert.issued')}
                  </span>
                  <div style={{ fontSize: '1rem' }}>
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t('verifyCert.code')}: {certificate.verificationCode}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
