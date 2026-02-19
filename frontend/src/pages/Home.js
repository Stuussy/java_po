import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { coursesAPI } from '../api/courses';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const courseIcons = {
  python: '\uD83D\uDC0D',
  java: '\u2615',
  javascript: '\uD83D\uDFE1',
  react: '\u269B\uFE0F',
  database: '\uD83D\uDDC4\uFE0F',
  cplusplus: '\u2699\uFE0F',
};

const Home = () => {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testsData, coursesData] = await Promise.all([
        testsAPI.getAllTests(),
        coursesAPI.getAllCourses().catch(() => []),
      ]);
      setTests(testsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = tests.reduce((sum, test) => sum + (test.questions?.length || 0), 0);

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        {/* Hero Banner */}
        <div className="hero-banner" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(14, 165, 233, 0.08)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(20, 184, 166, 0.08)',
          }} />
          <h1>{t('home.welcome')}</h1>
          <p style={{ marginBottom: '2rem' }}>{t('home.description')}</p>
          {!user && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1.1rem' }}>
                {t('home.ctaButton')}
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.875rem 2.5rem', fontSize: '1.1rem' }}>
                {t('header.login')}
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '3rem' }}>
          <div className="stat-card">
            <div className="stat-value">{tests.length}</div>
            <div className="stat-label">{t('home.statsTests')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">{t('home.statsCourses')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalQuestions}</div>
            <div className="stat-label">{t('home.statsQuestions')}</div>
          </div>
        </div>

        {/* Features */}
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>
          {t('home.featuresTitle')}
        </h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', marginBottom: '3rem' }}>
          {[
            { icon: '\uD83C\uDFAF', title: t('home.feature1Title'), desc: t('home.feature1Desc'), color: '#0ea5e9' },
            { icon: '\uD83D\uDCDA', title: t('home.feature2Title'), desc: t('home.feature2Desc'), color: '#10b981' },
            { icon: '\uD83E\uDD16', title: t('home.feature3Title'), desc: t('home.feature3Desc'), color: '#8b5cf6' },
            { icon: '\uD83C\uDFC6', title: t('home.feature4Title'), desc: t('home.feature4Desc'), color: '#f59e0b' },
          ].map((feature, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                width: '70px',
                height: '70px',
                borderRadius: '16px',
                background: feature.color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Popular Courses */}
        {courses.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
                {t('home.popularCourses')}
              </h2>
              <Link to="/courses" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                {t('home.viewAllCourses')}
              </Link>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginBottom: '3rem' }}>
              {courses.slice(0, 3).map((course) => {
                const icon = courseIcons[course.icon] || '\uD83D\uDCDA';
                return (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="card" style={{ height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          fontSize: '2rem',
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          backgroundColor: (course.color || '#667eea') + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {icon}
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{course.title}</h3>
                      </div>
                      <p className="card-description" style={{ marginBottom: '1rem' }}>
                        {course.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span>{course.modules?.length || 0} {t('courses.modules')}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Latest Tests */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
            {t('home.latestTests')}
          </h2>
          <Link to="/tests" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
            {t('home.viewAllTests')}
          </Link>
        </div>

        {tests.length === 0 ? (
          <div className="card">
            <p>{t('home.noTests')}</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ marginBottom: '3rem' }}>
            {tests.slice(0, 4).map((test) => (
              <div key={test.id} className="card">
                <h3 className="card-title">{test.title}</h3>
                <p className="card-description">{test.description}</p>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span>
                    <strong>{t('tests.duration')}:</strong> {test.durationMinutes} {t('tests.minutes')}
                  </span>
                  <span>
                    <strong>{t('tests.passing')}:</strong> {test.passingScore}%
                  </span>
                  <span>
                    <strong>{t('tests.questions')}:</strong> {test.questions?.length || 0}
                  </span>
                </div>
                {user ? (
                  <Link to={`/test/${test.id}/start`} className="btn btn-primary">
                    {t('tests.startTest')}
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    {t('header.login')}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'white',
            marginBottom: '2rem',
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>
              {t('home.ctaTitle')}
            </h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
              {t('home.ctaDesc')}
            </p>
            <Link to="/register" className="btn" style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '0.875rem 3rem',
              fontSize: '1.1rem',
              fontWeight: '700',
            }}>
              {t('home.ctaButton')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
