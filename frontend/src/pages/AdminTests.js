import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/admin';

const AdminTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await adminAPI.getAllTests();
      setTests(data);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    try {
      await adminAPI.deleteTest(id);
      setTests(tests.filter((test) => test.id !== id));
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Manage Tests</h1>
          <Link to="/admin/tests/new" className="btn btn-success">
            Create New Test
          </Link>
        </div>

        {tests.length === 0 ? (
          <div className="card">
            <p>No tests found. Create your first test!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Questions</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.title}</td>
                    <td>{test.questions?.length || 0}</td>
                    <td>{test.durationMinutes} min</td>
                    <td>
                      <span className={`badge ${test.published ? 'badge-success' : 'badge-info'}`}>
                        {test.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/admin/tests/${test.id}/edit`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(test.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTests;
