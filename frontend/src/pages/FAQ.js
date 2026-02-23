import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const FAQ = () => {
  const { t } = useLanguage();

  const faqs = [
    { q: t('faqPage.q1'), a: t('faqPage.a1') },
    { q: t('faqPage.q2'), a: t('faqPage.a2') },
    { q: t('faqPage.q3'), a: t('faqPage.a3') },
    { q: t('faqPage.q4'), a: t('faqPage.a4') },
    { q: t('faqPage.q5'), a: t('faqPage.a5') },
    { q: t('faqPage.q6'), a: t('faqPage.a6') },
  ];

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="card-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {t('faqPage.title')}
        </h1>

        {faqs.map((faq, index) => (
          <div key={index} className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
              {faq.q}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
