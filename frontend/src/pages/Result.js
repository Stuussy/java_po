import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { testsAPI } from '../api/tests';

const Result = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!attempt || !test) {
    return <div className="container">Result not found</div>;
  }

  const passed = attempt.score >= test.passingScore;
  const correctAnswers = attempt.answers?.filter((a) => a.isCorrect).length || 0;
  const totalQuestions = test.questions?.length || 0;

  return (
    <div className="main-content">
      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="card-title" style={{ textAlign: 'center' }}>
            Test Results
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
              {passed ? 'PASSED' : 'FAILED'}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{correctAnswers}/{totalQuestions}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{attempt.earnedPoints || 0}/{attempt.totalPoints || 0}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{test.passingScore}%</div>
              <div className="stat-label">Passing Score</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Started:</strong> {new Date(attempt.startedAt).toLocaleString()}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Submitted:</strong> {new Date(attempt.submittedAt).toLocaleString()}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Duration:</strong>{' '}
              {Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000)} minutes
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link to={`/result/${attemptId}/review`} className="btn btn-primary" style={{ flex: 1 }}>
              View Detailed Review
            </Link>
            <Link to={`/test/${test.id}/start`} className="btn btn-secondary">
              Retake Test
            </Link>
            <Link to="/" className="btn btn-secondary">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
