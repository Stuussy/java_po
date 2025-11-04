import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import { testsAPI } from '../api/tests';
import { useLanguage } from '../contexts/LanguageContext';

const AdminTestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEdit = !!id;

  const [test, setTest] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    passingScore: 70,
    category: '',
    difficulty: 'BEGINNER',
    tags: [],
    published: false,
    questions: [],
  });
  const [loading, setLoading] = useState(isEdit);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadTest();
    }
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTest({
      ...test,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    setTest({ ...test, tags });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type: 'SINGLE',
      text: '',
      choices: [
        { id: `c_${Date.now()}_1`, text: '', isCorrect: false },
        { id: `c_${Date.now()}_2`, text: '', isCorrect: false },
      ],
      points: 1,
      correctAnswer: '',
    };
    setTest({ ...test, questions: [...test.questions, newQuestion] });
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...test.questions];
    questions[index][field] = value;
    setTest({ ...test, questions });
  };

  const deleteQuestion = (index) => {
    const questions = test.questions.filter((_, i) => i !== index);
    setTest({ ...test, questions });
  };

  const duplicateQuestion = (index) => {
    const questions = [...test.questions];
    const questionToDuplicate = { ...questions[index] };
    questionToDuplicate.id = `q_${Date.now()}`;
    questionToDuplicate.choices = questionToDuplicate.choices.map(choice => ({
      ...choice,
      id: `c_${Date.now()}_${Math.random()}`,
    }));
    questions.splice(index + 1, 0, questionToDuplicate);
    setTest({ ...test, questions });
  };

  const moveQuestionUp = (index) => {
    if (index === 0) return;
    const questions = [...test.questions];
    [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]];
    setTest({ ...test, questions });
  };

  const moveQuestionDown = (index) => {
    if (index === test.questions.length - 1) return;
    const questions = [...test.questions];
    [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
    setTest({ ...test, questions });
  };

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [index]: !expandedQuestions[index],
    });
  };

  const addChoice = (questionIndex) => {
    const questions = [...test.questions];
    questions[questionIndex].choices.push({
      id: `c_${Date.now()}`,
      text: '',
      isCorrect: false,
    });
    setTest({ ...test, questions });
  };

  const updateChoice = (questionIndex, choiceIndex, field, value) => {
    const questions = [...test.questions];
    questions[questionIndex].choices[choiceIndex][field] = value;
    setTest({ ...test, questions });
  };

  const deleteChoice = (questionIndex, choiceIndex) => {
    const questions = [...test.questions];
    questions[questionIndex].choices = questions[questionIndex].choices.filter((_, i) => i !== choiceIndex);
    setTest({ ...test, questions });
  };

  const handleSave = async (shouldPublish) => {
    
    const testData = {
      ...test,
      published: shouldPublish === true  
    };

    try {
      if (isEdit) {
        await adminAPI.updateTest(id, testData);
      } else {
        await adminAPI.createTest(testData);
      }
      navigate('/admin/tests');
    } catch (error) {
      console.error('Error saving test:', error);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 className="card-title">{isEdit ? t('admin.testEdit.titleEdit') : t('admin.testEdit.titleCreate')}</h1>

        <div className="card">
          <h2>{t('admin.testEdit.testInfo')}</h2>

          <div className="form-group">
            <label className="form-label">{t('admin.testEdit.title')}</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={test.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('admin.testEdit.description')}</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={test.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('admin.testEdit.category')}</label>
              <input
                type="text"
                name="category"
                className="form-control"
                value={test.category}
                onChange={handleChange}
                placeholder={t('admin.testEdit.categoryPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.testEdit.difficulty')}</label>
              <select
                name="difficulty"
                className="form-control"
                value={test.difficulty}
                onChange={handleChange}
              >
                <option value="BEGINNER">{t('difficulty.BEGINNER')}</option>
                <option value="INTERMEDIATE">{t('difficulty.INTERMEDIATE')}</option>
                <option value="ADVANCED">{t('difficulty.ADVANCED')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('admin.testEdit.duration')}</label>
              <input
                type="number"
                name="durationMinutes"
                className="form-control"
                value={test.durationMinutes}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('admin.testEdit.passingScore')}</label>
              <input
                type="number"
                name="passingScore"
                className="form-control"
                value={test.passingScore}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('admin.testEdit.tags')}</label>
            <input
              type="text"
              className="form-control"
              value={test.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder={t('admin.testEdit.tagsPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="published"
                checked={test.published}
                onChange={handleChange}
              />
              {' '}{t('admin.testEdit.published')}
            </label>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>{t('admin.testEdit.questions')}</h2>
            <button onClick={addQuestion} className="btn btn-success">
              {t('admin.testEdit.addQuestion')}
            </button>
          </div>

          {test.questions.map((question, qIndex) => {
            const isExpanded = expandedQuestions[qIndex] !== false; 
            return (
              <div key={question.id} className="card" style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
                border: '2px solid #e0f2fe',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isExpanded ? '1rem' : '0',
                  padding: '0.5rem',
                  background: '#e0f2fe',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }} onClick={() => toggleQuestionExpand(qIndex)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{isExpanded ? '▼' : '▶'}</span>
                    <h3 style={{ margin: 0 }}>{t('admin.testEdit.question')} {qIndex + 1}</h3>
                    {!isExpanded && question.text && (
                      <span style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        maxWidth: '400px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        - {question.text}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveQuestionUp(qIndex)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                      disabled={qIndex === 0}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveQuestionDown(qIndex)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                      disabled={qIndex === test.questions.length - 1}
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => duplicateQuestion(qIndex)}
                      className="btn btn-info"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                      title={t('admin.testEdit.duplicate')}
                    >
                      📋 {t('admin.testEdit.duplicate')}
                    </button>
                    <button
                      onClick={() => deleteQuestion(qIndex)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                    >
                      🗑 {t('admin.testEdit.delete')}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 0.5rem' }}>

              <div className="form-group">
                <label className="form-label">{t('admin.testEdit.questionType')}</label>
                <select
                  className="form-control"
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                >
                  <option value="SINGLE">{t('admin.testEdit.singleChoice')}</option>
                  <option value="MULTIPLE">{t('admin.testEdit.multipleChoice')}</option>
                  <option value="TRUEFALSE">{t('admin.testEdit.trueFalse')}</option>
                  <option value="OPEN">{t('admin.testEdit.openEnded')}</option>
                  <option value="NUMERIC">{t('admin.testEdit.numeric')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.testEdit.questionText')}</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.testEdit.points')}</label>
                <input
                  type="number"
                  className="form-control"
                  value={question.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                  min="1"
                />
              </div>

              {(question.type === 'SINGLE' || question.type === 'MULTIPLE' || question.type === 'TRUEFALSE') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label">{t('admin.testEdit.choices')}</label>
                    {question.type !== 'TRUEFALSE' && (
                      <button onClick={() => addChoice(qIndex)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                        {t('admin.testEdit.addChoice')}
                      </button>
                    )}
                  </div>

                  {question.choices.map((choice, cIndex) => (
                    <div key={choice.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type={question.type === 'MULTIPLE' ? 'checkbox' : 'radio'}
                        name={`correct_${qIndex}`}
                        checked={choice.isCorrect}
                        onChange={(e) => {
                          if (question.type === 'SINGLE' || question.type === 'TRUEFALSE') {
                            const choices = question.choices.map((c, i) => ({
                              ...c,
                              isCorrect: i === cIndex,
                            }));
                            updateQuestion(qIndex, 'choices', choices);
                          } else {
                            updateChoice(qIndex, cIndex, 'isCorrect', e.target.checked);
                          }
                        }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={choice.text}
                        onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)}
                        placeholder={t('admin.testEdit.choicePlaceholder')}
                        style={{ flex: 1 }}
                      />
                      {question.type !== 'TRUEFALSE' && (
                        <button
                          onClick={() => deleteChoice(qIndex, cIndex)}
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.75rem' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(question.type === 'OPEN' || question.type === 'NUMERIC') && (
                <div className="form-group">
                  <label className="form-label">{t('admin.testEdit.correctAnswer')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={question.correctAnswer || ''}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                    placeholder={t('admin.testEdit.correctAnswerPlaceholder')}
                  />
                </div>
              )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleSave(false)} className="btn btn-secondary">
              {t('admin.testEdit.saveDraft')}
            </button>
            <button onClick={() => handleSave(true)} className="btn btn-success">
              {t('admin.testEdit.publish')}
            </button>
            <button onClick={() => navigate('/admin/tests')} className="btn btn-secondary">
              {t('admin.testEdit.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestEdit;
