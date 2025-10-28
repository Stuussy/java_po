import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

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
                <Link to="/profile">Profile</Link>
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
