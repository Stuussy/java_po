import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAvatarById } from '../../utils/avatars';

const Header = () => {
  const { user, logout } = useAuth();
  const currentAvatar = user ? getAvatarById(user.avatar || 'avatar1') : null;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h1>Online Quiz System</h1>
          </Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            {user ? (
              <>
                <Link to="/tests">Tests</Link>
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
                  Profile
                </Link>
                {user.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
