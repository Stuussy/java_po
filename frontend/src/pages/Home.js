import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await testsAPI.getAllTests();
      setTests(data);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <div className="hero-banner">
          <h1>Welcome to Online Quiz System</h1>
          <p>
            Test your knowledge with our interactive quizzes and get instant results!
          </p>
        </div>

        <h2 style={{ marginBottom: '1.5rem', color: 'white', textAlign: 'center', fontSize: '2rem' }}>
          🎯 Available Tests
        </h2>

        {tests.length === 0 ? (
          <div className="card">
            <p>No tests available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {tests.map((test) => (
              <div key={test.id} className="card">
                <h3 className="card-title">{test.title}</h3>
                <p className="card-description">{test.description}</p>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ marginRight: '1rem' }}>
                    <strong>Duration:</strong> {test.durationMinutes} min
                  </span>
                  <span>
                    <strong>Passing Score:</strong> {test.passingScore}%
                  </span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Questions:</strong> {test.questions?.length || 0}
                </div>
                {user ? (
                  <Link to={`/test/${test.id}/start`} className="btn btn-primary">
                    Start Test
                  </Link>
                ) : (
                  <div>
                    <Link to="/login" className="btn btn-primary">
                      Login to Start Test
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
