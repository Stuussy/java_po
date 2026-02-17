import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../api/courses';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const courseIcons = {
  python: { emoji: '\uD83D\uDC0D', label: 'Python' },
  java: { emoji: '\u2615', label: 'Java' },
  javascript: { emoji: '\uD83D\uDFE1', label: 'JavaScript' },
  react: { emoji: '\u269B\uFE0F', label: 'React' },
  database: { emoji: '\uD83D\uDDC4\uFE0F', label: 'Database' },
  cplusplus: { emoji: '\u2699\uFE0F', label: 'C++' },
};

const Courses = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getAllCourses();
      setCourses(data);

      if (user) {
        try {
          const progressList = await coursesAPI.getMyProgress();
          const map = {};
          progressList.forEach(p => { map[p.courseId] = p; });
          setProgressMap(map);
        } catch (e) {
          // ignore
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
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

  return (
    <div className="main-content">
      <div className="container">
        <div className="hero-banner" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f766e 100%)',
          borderRadius: '16px',
          padding: '3rem 2rem',
          color: 'white',
          marginBottom: '0.5rem',
        }}>
          <h1 style={{ color: 'white' }}>{t('courses.title')}</h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>{t('courses.description')}</p>
        </div>

        {courses.length === 0 ? (
          <div className="card">
            <p>{t('courses.noCourses')}</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ marginTop: '2rem' }}>
            {courses.map((course) => {
              const icon = courseIcons[course.icon] || { emoji: '\uD83D\uDCDA', label: course.title };
              const courseProgress = progressMap[course.id];
              const isCompleted = courseProgress?.completed;
              const completedModules = courseProgress?.completedModuleIds?.length || 0;
              const totalModules = course.modules?.length || 0;

              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="card"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    borderLeft: `4px solid ${isCompleted ? '#22c55e' : (course.color || '#667eea')}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                  }}
                >
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}>
                      {t('courses.completed')}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '2.5rem',
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      backgroundColor: (course.color || '#667eea') + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {icon.emoji}
                    </div>
                    <div>
                      <h3 className="card-title" style={{ margin: 0 }}>{course.title}</h3>
                      <span className="badge badge-info" style={{ marginTop: '0.25rem' }}>
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <p className="card-description">{course.description}</p>

                  {/* Progress bar for in-progress courses */}
                  {user && completedModules > 0 && totalModules > 0 && (
                    <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t('courses.progress')}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isCompleted ? '#22c55e' : (course.color || '#667eea') }}>
                          {completedModules}/{totalModules}
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: '#e2e8f0',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.round((completedModules / totalModules) * 100)}%`,
                          background: isCompleted
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                            : `linear-gradient(90deg, ${course.color || '#667eea'}, ${course.color || '#667eea'}cc)`,
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <span className={`badge ${getDifficultyBadgeClass(course.difficulty)}`}>
                      {t(`difficulty.${course.difficulty}`)}
                    </span>
                    <span className="badge badge-info">
                      {course.modules?.length || 0} {t('courses.modules')}
                    </span>
                    {course.testIds?.length > 0 && (
                      <span className="badge badge-success">
                        {course.testIds.length} {t('courses.tests')}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
