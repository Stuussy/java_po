import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { useLanguage } from '../contexts/LanguageContext';

const TestStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [test, setTest] = useState(null);
  const [attemptsInfo, setAttemptsInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [testData, infoData] = await Promise.all([
        testsAPI.getTestById(id),
        testsAPI.getAttemptsInfo(id),
      ]);
      setTest(testData);
      setAttemptsInfo(infoData);
    } catch (error) {
      console.error('Error loading test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    setError('');
    try {
      const attempt = await testsAPI.startTest(id);
      navigate(`/test/${id}/attempt/${attempt.id}`);
    } catch (error) {
      if (error.response?.data?.error === 'MAX_ATTEMPTS_REACHED') {
        setError(t('testStart.maxAttemptsReached'));
      } else {
        setError(t('testStart.failedToStart'));
      }
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!test) {
    return <div className="container">{t('testStart.notFound')}</div>;
  }

  const canStart = attemptsInfo?.canStart !== false;

  return (
    <div className="main-content">
      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="card-title">{test.title}</h1>
          <p className="card-description">{test.description}</p>

          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>{t('testStart.numberOfQuestions')}:</strong> {test.questions?.length || 0}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>{t('testStart.duration')}:</strong> {test.durationMinutes} {t('testStart.minutes')}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>{t('testStart.passingScore')}:</strong> {test.passingScore}%
            </div>
            {attemptsInfo && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('testStart.attempts')}:</strong>{' '}
                {attemptsInfo.completedAttempts} / {attemptsInfo.maxAttempts}
              </div>
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {!canStart && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {t('testStart.maxAttemptsReached')}
            </div>
          )}

          <div className="alert alert-info">
            <strong>{t('testStart.instructions')}:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>{t('testStart.instruction1').replace('{duration}', test.durationMinutes)}</li>
              <li>{t('testStart.instruction2')}</li>
              <li>{t('testStart.instruction3')}</li>
              <li>{t('testStart.instruction4')}</li>
              <li>{t('testStart.instruction5').replace('{passingScore}', test.passingScore)}</li>
              <li>{t('testStart.instruction6').replace('{maxAttempts}', attemptsInfo?.maxAttempts || test.maxAttempts || 3)}</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={handleStartTest}
              className="btn btn-success"
              style={{ flex: 1 }}
              disabled={!canStart}
            >
              {t('testStart.startTest')}
            </button>
            <button onClick={() => navigate('/tests')} className="btn btn-secondary">
              {t('testStart.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStart;
