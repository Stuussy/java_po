import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import { testsAPI } from '../api/tests';

const AdminTestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [test, setTest] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    passingScore: 70,
    tags: [],
    published: false,
    questions: [],
  });
  const [loading, setLoading] = useState(isEdit);

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

  const handleSave = async (publish = false) => {
    const testData = { ...test, published: publish };

    try {
      if (isEdit) {
        await adminAPI.updateTest(id, testData);
      } else {
        await adminAPI.createTest(testData);
      }
      navigate('/admin/tests');
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Failed to save test');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 className="card-title">{isEdit ? 'Edit Test' : 'Create New Test'}</h1>

        <div className="card">
          <h2>Test Information</h2>

          <div className="form-group">
            <label className="form-label">Title</label>
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
            <label className="form-label">Description</label>
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
              <label className="form-label">Duration (minutes)</label>
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
              <label className="form-label">Passing Score (%)</label>
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
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-control"
              value={test.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="JavaScript, React, Advanced"
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
              {' '}Published
            </label>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Questions</h2>
            <button onClick={addQuestion} className="btn btn-success">
              Add Question
            </button>
          </div>

          {test.questions.map((question, qIndex) => (
            <div key={question.id} className="card" style={{ background: '#f8f9fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Question {qIndex + 1}</h3>
                <button onClick={() => deleteQuestion(qIndex)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem' }}>
                  Delete
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Question Type</label>
                <select
                  className="form-control"
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                >
                  <option value="SINGLE">Single Choice</option>
                  <option value="MULTIPLE">Multiple Choice</option>
                  <option value="TRUEFALSE">True/False</option>
                  <option value="OPEN">Open Ended</option>
                  <option value="NUMERIC">Numeric</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Points</label>
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
                    <label className="form-label">Choices</label>
                    {question.type !== 'TRUEFALSE' && (
                      <button onClick={() => addChoice(qIndex)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                        Add Choice
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
                        placeholder="Choice text"
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
                  <label className="form-label">Correct Answer (for reference)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={question.correctAnswer || ''}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleSave(false)} className="btn btn-secondary">
              Save as Draft
            </button>
            <button onClick={() => handleSave(true)} className="btn btn-success">
              Publish Test
            </button>
            <button onClick={() => navigate('/admin/tests')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestEdit;
