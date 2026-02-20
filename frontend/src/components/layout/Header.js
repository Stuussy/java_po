import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAvatarById } from '../../utils/avatars';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher';

const Header = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const currentAvatar = user ? getAvatarById(user.avatar || 'avatar1') : null;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>{t('header.title')}</h1>
          </Link>

          <button
            className={`hamburger ${menuOpen ? 'hamburger--active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
          </button>

          {menuOpen && (
            <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
          )}

          <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
            <Link to="/">{t('header.home')}</Link>
            <Link to="/courses">{t('header.courses')}</Link>
            <Link to="/tests">{t('header.tests')}</Link>
            {user ? (
              <>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {currentAvatar && (
                    <span
                      style={{
                        fontSize: '1.5rem',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: currentAvatar.color + '30',
                        border: `2px solid ${currentAvatar.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {currentAvatar.emoji}
                    </span>
                  )}
                  {t('header.profile')}
                </Link>
                {user.role === 'ADMIN' && <Link to="/admin">{t('header.admin')}</Link>}
                <button onClick={logout} className="btn btn-secondary">
                  {t('header.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login">{t('header.login')}</Link>
                <Link to="/register">{t('header.register')}</Link>
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
