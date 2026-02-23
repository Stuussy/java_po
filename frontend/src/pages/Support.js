import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Support = () => {
  const { t } = useLanguage();

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="card-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {t('supportPage.title')}
        </h1>

        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>{t('supportPage.contactTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            {t('supportPage.contactDesc')}
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: '600' }}>Email: </span>
              <span style={{ color: 'var(--primary)' }}>support@quizsystem.com</span>
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>{t('supportPage.responseTime')}: </span>
              <span style={{ color: 'var(--text-secondary)' }}>{t('supportPage.responseTimeValue')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>{t('supportPage.commonIssues')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{t('supportPage.issue1Title')}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('supportPage.issue1Desc')}</p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{t('supportPage.issue2Title')}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('supportPage.issue2Desc')}</p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{t('supportPage.issue3Title')}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('supportPage.issue3Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
