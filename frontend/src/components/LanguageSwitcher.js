import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'ru', name: 'RU', flag: '🇷🇺' },
    { code: 'kz', name: 'KZ', flag: '🇰🇿' },
  ];

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={language === lang.code ? 'btn-lang active' : 'btn-lang'}
          style={{
            padding: '0.5rem 0.75rem',
            border: language === lang.code ? '2px solid var(--primary)' : '2px solid transparent',
            borderRadius: '8px',
            background: language === lang.code ? 'var(--primary)' : 'transparent',
            color: language === lang.code ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
