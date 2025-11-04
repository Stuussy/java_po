import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import { testsAPI } from '../api/tests';
import { useLanguage } from '../contexts/LanguageContext';

const AdminReports = () => {
  const { t } = useLanguage();
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await testsAPI.getAllTests();
      setTests(data);
      if (data.length > 0) {
        setSelectedTestId(data[0].id);
        loadReport(data[0].id);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (testId) => {
    try {
      const data = await adminAPI.getTestReport(testId);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };

  const handleTestChange = (e) => {
    const testId = e.target.value;
    setSelectedTestId(testId);
    loadReport(testId);
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>{t('admin.reports.title')}</h1>

        {tests.length === 0 ? (
          <div className="card">
            <p>{t('admin.reports.noTests')}</p>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="form-group">
                <label className="form-label">{t('admin.reports.selectTest')}</label>
                <select className="form-control" value={selectedTestId} onChange={handleTestChange}>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {report && (
              <>
                <div className="card">
                  <h2 className="card-title">{report.test.title}</h2>
                  <p className="card-description">{report.test.description}</p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{report.totalAttempts}</div>
                    <div className="stat-label">{t('admin.reports.totalAttempts')}</div>
                  </div>
                  {report.averageScore !== undefined && (
                    <>
                      <div className="stat-card">
                        <div className="stat-value">{report.averageScore.toFixed(1)}%</div>
                        <div className="stat-label">{t('admin.reports.averageScore')}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{report.passedCount}</div>
                        <div className="stat-label">{t('admin.reports.passed')}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{report.passRate.toFixed(1)}%</div>
                        <div className="stat-label">{t('admin.reports.passRate')}</div>
                      </div>
                    </>
                  )}
                </div>

                {report.attempts && report.attempts.length > 0 && (
                  <div className="card">
                    <h3 className="card-title">{t('admin.reports.recentAttempts')}</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>{t('admin.reports.tableUserId')}</th>
                            <th>{t('admin.reports.tableStarted')}</th>
                            <th>{t('admin.reports.tableSubmitted')}</th>
                            <th>{t('admin.reports.tableScore')}</th>
                            <th>{t('admin.reports.tableStatus')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.attempts.slice(0, 10).map((attempt) => (
                            <tr key={attempt.id}>
                              <td>{attempt.userId}</td>
                              <td>{new Date(attempt.startedAt).toLocaleString()}</td>
                              <td>
                                {attempt.submittedAt
                                  ? new Date(attempt.submittedAt).toLocaleString()
                                  : '-'}
                              </td>
                              <td>
                                {attempt.score !== null && attempt.score !== undefined ? (
                                  <strong>{attempt.score.toFixed(1)}%</strong>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    attempt.status === 'GRADED'
                                      ? 'badge-success'
                                      : attempt.status === 'SUBMITTED'
                                      ? 'badge-info'
                                      : 'badge-danger'
                                  }`}
                                >
                                  {attempt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
