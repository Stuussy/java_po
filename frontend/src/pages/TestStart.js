import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../api/tests';

const TestStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    try {
      const data = await testsAPI.getTestById(id);
      setTest(data);
    } catch (error) {
      console.error('Error loading test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      const attempt = await testsAPI.startTest(id);
      navigate(`/test/${id}/attempt/${attempt.id}`);
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Failed to start test');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!test) {
    return <div className="container">Test not found</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="card-title">{test.title}</h1>
          <p className="card-description">{test.description}</p>

          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Number of Questions:</strong> {test.questions?.length || 0}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Duration:</strong> {test.durationMinutes} minutes
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Passing Score:</strong> {test.passingScore}%
            </div>
          </div>

          <div className="alert alert-info">
            <strong>Instructions:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>You have {test.durationMinutes} minutes to complete this test</li>
              <li>Your answers will be auto-saved every 30 seconds</li>
              <li>You can navigate between questions using Next/Previous buttons</li>
              <li>Click "Submit Test" when you're done</li>
              <li>You need at least {test.passingScore}% to pass</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={handleStartTest} className="btn btn-success" style={{ flex: 1 }}>
              Start Test
            </button>
            <button onClick={() => navigate('/tests')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStart;
