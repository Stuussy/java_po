import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import Timer from '../components/tests/Timer';

const TestAttempt = () => {
  const { id: testId, attemptId } = useParams();
  const navigate = useNavigate();
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
    }, 30000); // Auto-save every 30 seconds

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
    if (!window.confirm('Are you sure you want to submit the test?')) {
      return;
    }

    await saveCurrentAnswer();

    try {
      await testsAPI.submitTest(testId, attemptId);
      navigate(`/result/${attemptId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test');
    }
  };

  const handleTimeUp = useCallback(async () => {
    alert('Time is up! Submitting your test...');
    await saveCurrentAnswer();
    try {
      await testsAPI.submitTest(testId, attemptId);
      navigate(`/result/${attemptId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  }, [testId, attemptId, navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return <div className="container">Test not found</div>;
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id] || {};

  return (
    <div className="main-content">
      <Timer durationMinutes={test.durationMinutes} onTimeUp={handleTimeUp} />

      <div className="container">
        <div className="card">
          <div style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </div>

          <h2 className="question-text">{currentQuestion.text}</h2>

          <div style={{ marginTop: '2rem' }}>
            {renderQuestion(currentQuestion, currentAnswer, handleAnswerChange)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {currentQuestionIndex === test.questions.length - 1 ? (
                <button onClick={handleSubmit} className="btn btn-success">
                  Submit Test
                </button>
              ) : (
                <button onClick={handleNext} className="btn btn-primary">
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Question Navigation</h3>
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

const renderQuestion = (question, answer, handleAnswerChange) => {
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
          placeholder="Type your answer here..."
        />
      );

    case 'NUMERIC':
      return (
        <input
          type="number"
          className="form-control"
          value={answer.numericAnswer || ''}
          onChange={(e) => handleAnswerChange(question.id, { numericAnswer: e.target.value })}
          placeholder="Enter a number..."
        />
      );

    default:
      return <div>Unknown question type</div>;
  }
};

export default TestAttempt;
