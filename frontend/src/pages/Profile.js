import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const data = await testsAPI.getMyAttempts();
      setAttempts(data);
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <h1 className="card-title">My Profile</h1>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Name:</strong> {user?.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Email:</strong> {user?.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Role:</strong> {user?.role}
            </div>
            {user?.organization && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Organization:</strong> {user.organization}
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Test History</h2>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : attempts.length === 0 ? (
            <p>No test attempts yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Test ID</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>{new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}</td>
                      <td>{attempt.testId}</td>
                      <td>
                        {attempt.score !== null && attempt.score !== undefined ? (
                          <span style={{ fontWeight: 'bold' }}>{attempt.score.toFixed(1)}%</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          attempt.status === 'GRADED' ? 'badge-success' :
                          attempt.status === 'SUBMITTED' ? 'badge-info' :
                          'badge-danger'
                        }`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td>
                        {attempt.status === 'GRADED' && (
                          <Link to={`/result/${attempt.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                            View Result
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
