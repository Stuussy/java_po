import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { useLanguage } from '../contexts/LanguageContext';
import Timer from '../components/tests/Timer';

const TestAttempt = () => {
  const { id: testId, attemptId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadTestAndAttempt();
  }, [testId, attemptId]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveCurrentAnswer();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [answers, currentQuestionIndex]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const loadTestAndAttempt = async () => {
    try {
      const [testData, attemptData] = await Promise.all([
        testsAPI.getTestById(testId),
        testsAPI.getAttempt(attemptId),
      ]);
      setTest(testData);
      setAttempt(attemptData);

      // If the attempt is already submitted/graded, redirect to result
      if (attemptData.status === 'SUBMITTED' || attemptData.status === 'GRADED') {
        navigate(`/result/${attemptId}`);
        return;
      }
    } catch (error) {
      console.error('Error loading test:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentAnswer = async () => {
    if (!test || !test.questions[currentQuestionIndex]) return;

    const question = test.questions[currentQuestionIndex];
    const answer = answers[question.id];

    if (!answer) return;

    try {
      await testsAPI.saveAnswer(testId, attemptId, {
        questionId: question.id,
        selectedChoices: answer.selectedChoices,
        textAnswer: answer.textAnswer,
        numericAnswer: answer.numericAnswer,
      });
    } catch (error) {
      if (error.response?.data?.error === 'TIME_EXPIRED') {
        navigate(`/result/${attemptId}`);
        return;
      }
      console.error('Error saving answer:', error);
    }
  };

  const handleAnswerChange = (questionId, answerData) => {
    setAnswers({
      ...answers,
      [questionId]: answerData,
    });
  };

  const handleNext = async () => {
    await saveCurrentAnswer();
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    await saveCurrentAnswer();

    try {
      await testsAPI.submitTest(testId, attemptId);
      navigate(`/result/${attemptId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const handleTimeUp = useCallback(async () => {
    await saveCurrentAnswer();
    try {
      await testsAPI.submitTest(testId, attemptId);
      navigate(`/result/${attemptId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  }, [testId, attemptId, navigate, t]);

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return <div className="container">{t('testAttempt.notFound')}</div>;
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id] || {};
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test.questions.length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="main-content">
      <Timer durationMinutes={test.durationMinutes} startedAt={attempt?.startedAt} onTimeUp={handleTimeUp} />

      <div className="container">
        <div className="card">
          <div style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
            {t('testAttempt.questionOf').replace('{current}', currentQuestionIndex + 1).replace('{total}', test.questions.length)}
          </div>

          <h2 className="question-text">{currentQuestion.text}</h2>

          {currentQuestion.imageUrl && (
            <div style={{ margin: '1rem 0', textAlign: 'center' }}>
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            {renderQuestion(currentQuestion, currentAnswer, handleAnswerChange, t)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary"
            >
              {t('testAttempt.previous')}
            </button>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {currentQuestionIndex === test.questions.length - 1 ? (
                <button onClick={handleSubmitClick} className="btn btn-success">
                  {t('testAttempt.submitTest')}
                </button>
              ) : (
                <button onClick={handleNext} className="btn btn-primary">
                  {t('testAttempt.next')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{t('testAttempt.questionNavigation')}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {test.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: answers[q.id] ? '#3498db' : 'white',
                  color: answers[q.id] ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: currentQuestionIndex === index ? 'bold' : 'normal',
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '2.5rem',
              maxWidth: '480px',
              width: '90%',
              boxShadow: 'var(--shadow-xl)',
              animation: 'scaleIn 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: 'var(--text-primary)',
              textAlign: 'center',
            }}>
              {t('testAttempt.submitConfirmTitle')}
            </h2>

            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
            }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
                {t('testAttempt.submitConfirmAnswered')
                  .replace('{answered}', answeredCount)
                  .replace('{total}', totalQuestions)}
              </p>
              {unansweredCount > 0 && (
                <p style={{ color: 'var(--warning)', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {t('testAttempt.submitConfirmUnanswered').replace('{count}', unansweredCount)}
                </p>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('testAttempt.submitConfirmWarning')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="btn btn-success"
              >
                {t('testAttempt.confirmSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const renderQuestion = (question, answer, handleAnswerChange, t) => {
  switch (question.type) {
    case 'SINGLE':
      return (
        <div>
          {question.choices.map((choice) => (
            <label key={choice.id} className={`choice ${answer.selectedChoices?.[0] === choice.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name={question.id}
                value={choice.id}
                checked={answer.selectedChoices?.[0] === choice.id}
                onChange={() => handleAnswerChange(question.id, { selectedChoices: [choice.id] })}
              />
              {choice.text}
            </label>
          ))}
        </div>
      );

    case 'MULTIPLE':
      return (
        <div>
          {question.choices.map((choice) => (
            <label key={choice.id} className={`choice ${answer.selectedChoices?.includes(choice.id) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                value={choice.id}
                checked={answer.selectedChoices?.includes(choice.id) || false}
                onChange={(e) => {
                  const currentChoices = answer.selectedChoices || [];
                  const newChoices = e.target.checked
                    ? [...currentChoices, choice.id]
                    : currentChoices.filter((id) => id !== choice.id);
                  handleAnswerChange(question.id, { selectedChoices: newChoices });
                }}
              />
              {choice.text}
            </label>
          ))}
        </div>
      );

    case 'TRUEFALSE':
      return (
        <div>
          {question.choices.map((choice) => (
            <label key={choice.id} className={`choice ${answer.selectedChoices?.[0] === choice.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name={question.id}
                value={choice.id}
                checked={answer.selectedChoices?.[0] === choice.id}
                onChange={() => handleAnswerChange(question.id, { selectedChoices: [choice.id] })}
              />
              {choice.text}
            </label>
          ))}
        </div>
      );

    case 'OPEN':
      return (
        <textarea
          className="form-control"
          rows="5"
          value={answer.textAnswer || ''}
          onChange={(e) => handleAnswerChange(question.id, { textAnswer: e.target.value })}
          placeholder={t('testAttempt.openPlaceholder')}
        />
      );

    case 'NUMERIC':
      return (
        <input
          type="number"
          className="form-control"
          value={answer.numericAnswer || ''}
          onChange={(e) => handleAnswerChange(question.id, { numericAnswer: e.target.value })}
          placeholder={t('testAttempt.numericPlaceholder')}
        />
      );

    default:
      return <div>{t('testAttempt.unknownType')}</div>;
  }
};

export default TestAttempt;
