import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.trim() === '') {
      loadTests();
      return;
    }

    try {
      const data = await testsAPI.searchTests(query);
      setTests(data);
    } catch (error) {
      console.error('Error searching tests:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>Available Tests</h1>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search tests..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {tests.length === 0 ? (
          <div className="card">
            <p>No tests found.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {tests.map((test) => (
              <div key={test.id} className="card">
                <h3 className="card-title">{test.title}</h3>
                <p className="card-description">{test.description}</p>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Duration:</strong> {test.durationMinutes} minutes
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Questions:</strong> {test.questions?.length || 0}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Passing Score:</strong> {test.passingScore}%
                  </div>
                </div>
                {test.tags && test.tags.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {test.tags.map((tag, index) => (
                      <span key={index} className="badge badge-info" style={{ marginRight: '0.5rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link to={`/test/${test.id}/start`} className="btn btn-primary">
                  Start Test
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;
