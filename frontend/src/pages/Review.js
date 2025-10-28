import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../api/tests';

const Review = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReview();
  }, [attemptId]);

  const loadReview = async () => {
    try {
      const attemptData = await testsAPI.getAttempt(attemptId);
      setAttempt(attemptData);

      const testData = await testsAPI.getTestById(attemptData.testId);
      setTest(testData);
    } catch (error) {
      console.error('Error loading review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!attempt || !test) {
    return <div className="container">Review not found</div>;
  }

  const getAnswerForQuestion = (questionId) => {
    return attempt.answers?.find((a) => a.questionId === questionId);
  };

  const getCorrectChoices = (question) => {
    return question.choices?.filter((c) => c.isCorrect).map((c) => c.id) || [];
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <h1 className="card-title">Test Review</h1>
          <h2 style={{ color: '#7f8c8d', marginBottom: '2rem' }}>{test.title}</h2>

          <div style={{ marginBottom: '2rem' }}>
            <strong>Score:</strong> {attempt.score?.toFixed(1)}% ({attempt.earnedPoints}/{attempt.totalPoints} points)
          </div>
        </div>

        {test.questions?.map((question, index) => {
          const answer = getAnswerForQuestion(question.id);
          const correctChoices = getCorrectChoices(question);

          return (
            <div key={question.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>
                  Question {index + 1} ({question.points} {question.points === 1 ? 'point' : 'points'})
                </h3>
                {answer?.isCorrect ? (
                  <span className="badge badge-success" style={{ fontSize: '1rem' }}>✓ Correct</span>
                ) : (
                  <span className="badge badge-danger" style={{ fontSize: '1rem' }}>✗ Incorrect</span>
                )}
              </div>

              <div className="question-text" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                {question.text}
              </div>

              {renderQuestionReview(question, answer, correctChoices)}

              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Points Awarded:</strong> {answer?.pointsAwarded || 0} / {question.points}
              </div>
            </div>
          );
        })}

        <div className="card">
          <button onClick={() => navigate(`/result/${attemptId}`)} className="btn btn-primary">
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
};

const renderQuestionReview = (question, answer, correctChoices) => {
  switch (question.type) {
    case 'SINGLE':
    case 'MULTIPLE':
    case 'TRUEFALSE':
      return (
        <div>
          {question.choices?.map((choice) => {
            const isCorrect = correctChoices.includes(choice.id);
            const wasSelected = answer?.selectedChoices?.includes(choice.id);

            let className = 'choice';
            if (isCorrect) {
              className += ' correct';
            } else if (wasSelected) {
              className += ' incorrect';
            }

            return (
              <div key={choice.id} className={className}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {wasSelected && '✓ '}
                    {choice.text}
                  </span>
                  {isCorrect && <span style={{ fontWeight: 'bold', color: '#27ae60' }}>Correct Answer</span>}
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'OPEN':
      return (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Your Answer:</strong>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.5rem' }}>
              {answer?.textAnswer || '(No answer provided)'}
            </div>
          </div>
          <div>
            <strong>Expected Answer:</strong>
            <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px', marginTop: '0.5rem' }}>
              {question.correctAnswer || '(Requires manual grading)'}
            </div>
          </div>
        </div>
      );

    case 'NUMERIC':
      const isCorrect = answer?.numericAnswer === question.correctAnswer;
      return (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Your Answer:</strong>
            <div style={{ padding: '1rem', background: isCorrect ? '#d4edda' : '#f8d7da', borderRadius: '4px', marginTop: '0.5rem' }}>
              {answer?.numericAnswer || '(No answer provided)'}
            </div>
          </div>
          <div>
            <strong>Correct Answer:</strong>
            <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px', marginTop: '0.5rem' }}>
              {question.correctAnswer}
            </div>
          </div>
        </div>
      );

    default:
      return <div>Unknown question type</div>;
  }
};

export default Review;
