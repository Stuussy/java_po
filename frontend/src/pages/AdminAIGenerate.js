import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import { useLanguage } from '../contexts/LanguageContext';

const AdminAIGenerate = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    topic: '',
    numberOfQuestions: 5,
    difficulty: 'INTERMEDIATE',
    language: 'ru',
    questionTypes: '',
  });

  const [generatedTest, setGeneratedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiConfigured, setAiConfigured] = useState(true);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const status = await adminAPI.getAIStatus();
      setAiConfigured(status.configured);
    } catch (err) {
      console.error('Error checking AI status:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError(t('admin.ai.topicRequired'));
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedTest(null);

    try {
      const result = await adminAPI.generateTestWithAI(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedTest(result);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('admin.ai.generateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await adminAPI.generateAndSaveTestWithAI(formData);
      if (result.error) {
        setError(result.error);
      } else {
        navigate(`/admin/tests/${result.id}/edit`);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('admin.ai.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGenerated = async () => {
    if (!generatedTest) return;

    setLoading(true);
    setError('');

    try {
      const saved = await adminAPI.createTest(generatedTest);
      navigate(`/admin/tests/${saved.id}/edit`);
    } catch (err) {
      setError(t('admin.ai.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <h1 className="card-title">{t('admin.ai.title')}</h1>

        {!aiConfigured && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            marginBottom: '1.5rem'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#92400e' }}>
              {t('admin.ai.notConfigured')}
            </p>
            <p style={{ margin: '0.5rem 0 0', color: '#92400e', fontSize: '0.9rem' }}>
              {t('admin.ai.notConfiguredDesc')}
            </p>
          </div>
        )}

        <div className="card">
          <h2>{t('admin.ai.settings')}</h2>

          <div className="form-group">
            <label className="form-label">{t('admin.ai.topic')} *</label>
            <input
              type="text"
              name="topic"
              className="form-control"
              value={formData.topic}
              onChange={handleChange}
              placeholder={t('admin.ai.topicPlaceholder')}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('admin.ai.numberOfQuestions')}</label>
              <select
                name="numberOfQuestions"
                className="form-control"
                value={formData.numberOfQuestions}
                onChange={handleChange}
                disabled={loading}
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.ai.difficulty')}</label>
              <select
                name="difficulty"
                className="form-control"
                value={formData.difficulty}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="BEGINNER">{t('difficulty.BEGINNER')}</option>
                <option value="INTERMEDIATE">{t('difficulty.INTERMEDIATE')}</option>
                <option value="ADVANCED">{t('difficulty.ADVANCED')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('admin.ai.language')}</label>
              <select
                name="language"
                className="form-control"
                value={formData.language}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="ru">{t('admin.ai.langRu')}</option>
                <option value="en">{t('admin.ai.langEn')}</option>
                <option value="kz">{t('admin.ai.langKz')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.ai.questionTypes')}</label>
              <select
                name="questionTypes"
                className="form-control"
                value={formData.questionTypes}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">{t('admin.ai.mixedTypes')}</option>
                <option value="SINGLE">{t('admin.testEdit.singleChoice')}</option>
                <option value="MULTIPLE">{t('admin.testEdit.multipleChoice')}</option>
                <option value="TRUEFALSE">{t('admin.testEdit.trueFalse')}</option>
                <option value="SINGLE,MULTIPLE">{t('admin.ai.singleAndMultiple')}</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={handleGenerate}
              className="btn btn-primary"
              disabled={loading || !formData.topic.trim()}
              style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
            >
              {loading ? t('admin.ai.generating') : t('admin.ai.generatePreview')}
            </button>
            <button
              onClick={handleSave}
              className="btn btn-success"
              disabled={loading || !formData.topic.trim()}
              style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
            >
              {loading ? t('admin.ai.generating') : t('admin.ai.generateAndSave')}
            </button>
            <button
              onClick={() => navigate('/admin/tests')}
              className="btn btn-secondary"
              disabled={loading}
            >
              {t('admin.testEdit.cancel')}
            </button>
          </div>
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>
              &#129302;
            </div>
            <h3>{t('admin.ai.generatingMessage')}</h3>
            <p style={{ color: '#64748b' }}>{t('admin.ai.pleaseWait')}</p>
            <style>
              {`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}
            </style>
          </div>
        )}

        {generatedTest && !loading && (
          <div className="card" style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #22c55e'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{t('admin.ai.preview')}</h2>
              <button
                onClick={handleSaveGenerated}
                className="btn btn-success"
                style={{ padding: '0.75rem 2rem' }}
              >
                {t('admin.ai.saveAndEdit')}
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <h3>{generatedTest.title}</h3>
              <p style={{ color: '#64748b' }}>{generatedTest.description}</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info">{generatedTest.category}</span>
                <span className="badge badge-info">{t(`difficulty.${generatedTest.difficulty}`)}</span>
                <span className="badge badge-info">
                  {generatedTest.questions?.length || 0} {t('tests.questions')}
                </span>
                <span className="badge badge-info">
                  {generatedTest.durationMinutes} {t('tests.minutes')}
                </span>
              </div>
            </div>

            {generatedTest.questions?.map((question, index) => (
              <div key={index} style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0 }}>
                    {t('admin.testEdit.question')} {index + 1}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-info">{question.type}</span>
                    <span className="badge badge-success">{question.points} {t('admin.testEdit.points')}</span>
                  </div>
                </div>
                <p style={{ marginBottom: '0.75rem', fontWeight: '500' }}>{question.text}</p>

                {question.choices?.map((choice, cIndex) => (
                  <div key={cIndex} style={{
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.25rem',
                    borderRadius: '4px',
                    background: choice.isCorrect ? '#dcfce7' : '#f8fafc',
                    border: choice.isCorrect ? '1px solid #22c55e' : '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{choice.isCorrect ? '\u2705' : '\u2B55'}</span>
                    <span>{choice.text}</span>
                  </div>
                ))}

                {question.correctAnswer && (
                  <p style={{ marginTop: '0.5rem', color: '#16a34a', fontStyle: 'italic' }}>
                    {t('admin.testEdit.correctAnswer')}: {question.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAIGenerate;
