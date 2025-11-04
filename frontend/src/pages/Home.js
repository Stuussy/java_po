import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

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
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <div className="hero-banner">
          <h1>{t('home.welcome')}</h1>
          <p>{t('home.description')}</p>
        </div>

        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem' }}>
          🎯 {t('tests.title')}
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
                    <strong>{t('tests.duration')}:</strong> {test.durationMinutes} {t('tests.minutes')}
                  </span>
                  <span>
                    <strong>{t('tests.passing')}:</strong> {test.passingScore}%
                  </span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('tests.questions')}:</strong> {test.questions?.length || 0}
                </div>
                {user ? (
                  <Link to={`/test/${test.id}/start`} className="btn btn-primary">
                    {t('tests.startTest')}
                  </Link>
                ) : (
                  <div>
                    <Link to="/login" className="btn btn-primary">
                      {t('header.login')}
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
