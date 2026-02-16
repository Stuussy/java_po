import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { useLanguage } from '../contexts/LanguageContext';

const Result = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  const loadResult = async () => {
    try {
      const attemptData = await testsAPI.getAttempt(attemptId);
      setAttempt(attemptData);

      const testData = await testsAPI.getTestById(attemptData.testId);
      setTest(testData);
    } catch (error) {
      console.error('Error loading result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCertificate = async () => {
    setCertLoading(true);
    try {
      const cert = await testsAPI.generateCertificate(attemptId);
      setCertificate(cert);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setCertLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;
    try {
      const blob = await testsAPI.downloadCertificate(certificate.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificate.verificationCode}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!attempt || !test) {
    return <div className="container">{t('result.notFound')}</div>;
  }

  const passed = attempt.score >= test.passingScore;
  const correctAnswers = attempt.answers?.filter((a) => a.isCorrect).length || 0;
  const totalQuestions = test.questions?.length || 0;

  return (
    <div className="main-content">
      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="card-title" style={{ textAlign: 'center' }}>
            {t('result.title')}
          </h1>

          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#7f8c8d' }}>
            {test.title}
          </h2>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                color: passed ? '#27ae60' : '#e74c3c',
                marginBottom: '1rem',
              }}
            >
              {attempt.score?.toFixed(1)}%
            </div>
            <div className={`badge ${passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1.25rem', padding: '0.5rem 1.5rem' }}>
              {passed ? t('result.passed') : t('result.failed')}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{correctAnswers}/{totalQuestions}</div>
              <div className="stat-label">{t('result.correctAnswers')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{attempt.earnedPoints || 0}/{attempt.totalPoints || 0}</div>
              <div className="stat-label">{t('result.points')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{test.passingScore}%</div>
              <div className="stat-label">{t('result.passingScore')}</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{t('result.started')}:</strong> {new Date(attempt.startedAt).toLocaleString()}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{t('result.submitted')}:</strong> {new Date(attempt.submittedAt).toLocaleString()}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{t('result.duration')}:</strong>{' '}
              {Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000)} {t('tests.minutes')}
            </div>
          </div>

          {/* Certificate Section */}
          {passed && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#92400e' }}>{t('certificate.congratulations')}</h3>
              <p style={{ color: '#92400e', margin: '0 0 1rem' }}>{t('certificate.available')}</p>

              {!certificate ? (
                <button
                  onClick={handleGetCertificate}
                  className="btn btn-primary"
                  disabled={certLoading}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    fontSize: '1.1rem'
                  }}
                >
                  {certLoading ? t('certificate.generating') : t('certificate.generate')}
                </button>
              ) : (
                <div>
                  <div style={{
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ margin: '0 0 0.5rem' }}>
                      <strong>{t('certificate.verificationCode')}:</strong>{' '}
                      <code style={{ background: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
                        {certificate.verificationCode}
                      </code>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      {t('certificate.issued')}: {new Date(certificate.issuedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCertificate}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      padding: '0.75rem 2rem',
                      fontSize: '1.1rem'
                    }}
                  >
                    {t('certificate.download')}
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to={`/result/${attemptId}/review`} className="btn btn-primary" style={{ flex: 1 }}>
              {t('result.viewReview')}
            </Link>
            <Link to={`/test/${test.id}/start`} className="btn btn-secondary">
              {t('result.retake')}
            </Link>
            <Link to="/" className="btn btn-secondary">
              {t('header.home')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
