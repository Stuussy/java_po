import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesAPI } from '../api/courses';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const courseIcons = {
  python: '\uD83D\uDC0D',
  java: '\u2615',
  javascript: '\uD83D\uDFE1',
  react: '\u269B\uFE0F',
  database: '\uD83D\uDDC4\uFE0F',
  cplusplus: '\u2699\uFE0F',
};

const CourseDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [courseTests, setCourseTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await coursesAPI.getCourseById(id);
      setCourse(data.course);
      setCourseTests(data.tests || []);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'badge-success';
      case 'INTERMEDIATE': return 'badge-info';
      case 'ADVANCED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!course) {
    return (
      <div className="main-content">
        <div className="container">
          <div className="card">
            <p>{t('courses.notFound')}</p>
            <Link to="/courses" className="btn btn-primary">{t('common.back')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const icon = courseIcons[course.icon] || '\uD83D\uDCDA';

  return (
    <div className="main-content">
      <div className="container">
        {/* Course Header */}
        <div className="card" style={{
          background: `linear-gradient(135deg, ${course.color || '#667eea'}15 0%, ${course.color || '#667eea'}30 100%)`,
          borderLeft: `4px solid ${course.color || '#667eea'}`,
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <div style={{
              fontSize: '3.5rem',
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              backgroundColor: (course.color || '#667eea') + '30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {icon}
            </div>
            <div>
              <h1 style={{ margin: 0 }}>{course.title}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="badge badge-info">{course.category}</span>
                <span className={`badge ${getDifficultyBadgeClass(course.difficulty)}`}>
                  {t(`difficulty.${course.difficulty}`)}
                </span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '1.1rem', color: '#475569', margin: 0 }}>{course.description}</p>
        </div>

        {/* Course Modules */}
        <h2 style={{ marginBottom: '1.5rem' }}>{t('courses.courseModules')}</h2>
        <div style={{ marginBottom: '2rem' }}>
          {course.modules?.map((module, index) => (
            <div key={module.id} className="card" style={{
              marginBottom: '1rem',
              borderLeft: `3px solid ${course.color || '#667eea'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: course.color || '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}>
                  {index + 1}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{module.title}</h3>
                  <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>{module.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course Tests */}
        {courseTests.length > 0 && (
          <>
            <h2 style={{ marginBottom: '1.5rem' }}>{t('courses.courseTests')}</h2>
            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
              {courseTests.map((test) => (
                <div key={test.id} className="card">
                  <h3 className="card-title">{test.title}</h3>
                  <p className="card-description">{test.description}</p>
                  <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <strong>{t('tests.duration')}:</strong> {test.durationMinutes} {t('tests.minutes')}
                    </div>
                    <div>
                      <strong>{t('tests.questions')}:</strong> {test.questions?.length || 0}
                    </div>
                    <div>
                      <strong>{t('tests.passing')}:</strong> {test.passingScore}%
                    </div>
                  </div>
                  {user ? (
                    <Link to={`/test/${test.id}/start`} className="btn btn-primary" style={{ width: '100%' }}>
                      {t('tests.startTest')}
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                      {t('header.login')}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <Link to="/courses" className="btn btn-secondary">{t('common.back')}</Link>
      </div>
    </div>
  );
};

export default CourseDetail;
