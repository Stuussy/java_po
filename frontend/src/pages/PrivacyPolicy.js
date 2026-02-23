import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="card-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {t('privacyPage.title')}
        </h1>

        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {t('privacyPage.lastUpdated')}
          </p>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.3rem' }}>{t('privacyPage.section1Title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{t('privacyPage.section1Text')}</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.3rem' }}>{t('privacyPage.section2Title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{t('privacyPage.section2Text')}</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.3rem' }}>{t('privacyPage.section3Title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{t('privacyPage.section3Text')}</p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.3rem' }}>{t('privacyPage.section4Title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{t('privacyPage.section4Text')}</p>
          </section>

          <section>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.3rem' }}>{t('privacyPage.section5Title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{t('privacyPage.section5Text')}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
