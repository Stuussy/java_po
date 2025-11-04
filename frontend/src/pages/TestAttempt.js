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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, [testId]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveCurrentAnswer();
    }, 30000); 

    return () => clearInterval(autoSaveInterval);
  }, [answers, currentQuestionIndex]);

  const loadTest = async () => {
    try {
      const testData = await testsAPI.getTestById(testId);
      setTest(testData);
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

  const handleSubmit = async () => {
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

  return (
    <div className="main-content">
      <Timer durationMinutes={test.durationMinutes} onTimeUp={handleTimeUp} />

      <div className="container">
        <div className="card">
          <div style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
            {t('testAttempt.questionOf').replace('{current}', currentQuestionIndex + 1).replace('{total}', test.questions.length)}
          </div>

          <h2 className="question-text">{currentQuestion.text}</h2>

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
                <button onClick={handleSubmit} className="btn btn-success">
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
