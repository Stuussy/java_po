import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import { useLanguage } from '../contexts/LanguageContext';

const AdminTests = () => {
  const { t } = useLanguage();
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
    try {
      await adminAPI.deleteTest(id);
      setTests(tests.filter((test) => test.id !== id));
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1>{t('admin.tests.title')}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/admin/ai-generate" className="btn btn-primary" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}>
              {t('admin.ai.generateWithAI')}
            </Link>
            <Link to="/admin/tests/new" className="btn btn-success">
              {t('admin.tests.createNew')}
            </Link>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="card">
            <p>{t('admin.tests.noTests')}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-mobile-cards">
              <thead>
                <tr>
                  <th>{t('admin.tests.tableTitle')}</th>
                  <th>{t('admin.tests.tableQuestions')}</th>
                  <th>{t('admin.tests.tableDuration')}</th>
                  <th>{t('admin.tests.tableStatus')}</th>
                  <th>{t('admin.tests.tableCreated')}</th>
                  <th>{t('admin.tests.tableActions')}</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td data-label={t('admin.tests.tableTitle')}>{test.title}</td>
                    <td data-label={t('admin.tests.tableQuestions')}>{test.questions?.length || 0}</td>
                    <td data-label={t('admin.tests.tableDuration')}>{test.durationMinutes} min</td>
                    <td data-label={t('admin.tests.tableStatus')}>
                      <span className={`badge ${test.published ? 'badge-success' : 'badge-info'}`}>
                        {test.published ? t('admin.tests.statusPublished') : t('admin.tests.statusDraft')}
                      </span>
                    </td>
                    <td data-label={t('admin.tests.tableCreated')}>{new Date(test.createdAt).toLocaleDateString()}</td>
                    <td data-label={t('admin.tests.tableActions')}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Link to={`/admin/tests/${test.id}/edit`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                          {t('admin.tests.edit')}
                        </Link>
                        <button onClick={() => handleDelete(test.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem' }}>
                          {t('admin.tests.delete')}
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
