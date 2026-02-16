import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../api/courses';
import { useLanguage } from '../contexts/LanguageContext';

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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getAllCourses();
      setCourses(data);
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
        <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h1>{t('courses.title')}</h1>
          <p>{t('courses.description')}</p>
        </div>

        {courses.length === 0 ? (
          <div className="card">
            <p>{t('courses.noCourses')}</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ marginTop: '2rem' }}>
            {courses.map((course) => {
              const icon = courseIcons[course.icon] || { emoji: '\uD83D\uDCDA', label: course.title };
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="card"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    borderLeft: `4px solid ${course.color || '#667eea'}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
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
