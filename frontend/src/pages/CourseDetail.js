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
  const [expandedModule, setExpandedModule] = useState(null);
  const [progress, setProgress] = useState({ completedModuleIds: [], completed: false });
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await coursesAPI.getCourseById(id);
      setCourse(data.course);
      setCourseTests(data.tests || []);

      if (user) {
        try {
          const prog = await coursesAPI.getCourseProgress(id);
          setProgress(prog);
        } catch (e) {
          // Not logged in or error
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteModule = async (moduleId) => {
    if (!user) return;
    setCompleting(moduleId);
    try {
      const updatedProgress = await coursesAPI.completeModule(id, moduleId);
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error completing module:', error);
    } finally {
      setCompleting(null);
    }
  };

  const isModuleCompleted = (moduleId) => {
    return progress.completedModuleIds?.includes(moduleId);
  };

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'badge-success';
      case 'INTERMEDIATE': return 'badge-info';
      case 'ADVANCED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const renderContent = (content) => {
    if (!content) return null;
    // Simple markdown-like rendering
    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeLines = [];
    let codeKey = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${codeKey++}`} style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              margin: '0.75rem 0',
            }}>
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#1e293b' }}>{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: '#334155' }}>{line.slice(4)}</h3>);
      } else if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\*\s*[—-]\s*(.+)$/);
        if (match) {
          elements.push(<li key={i} style={{ marginBottom: '0.25rem' }}><strong>{match[1]}</strong> — {match[2]}</li>);
        } else {
          const boldMatch = line.match(/^- \*\*(.+?)\*\*(.*)$/);
          if (boldMatch) {
            elements.push(<li key={i} style={{ marginBottom: '0.25rem' }}><strong>{boldMatch[1]}</strong>{boldMatch[2]}</li>);
          } else {
            elements.push(<li key={i} style={{ marginBottom: '0.25rem' }}>{line.slice(2)}</li>);
          }
        }
      } else if (line.startsWith('- ')) {
        elements.push(<li key={i} style={{ marginBottom: '0.25rem' }}>{line.slice(2)}</li>);
      } else if (line.startsWith('| ')) {
        // Simple table rendering
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
        if (cells.some(c => /^[-]+$/.test(c))) continue; // Skip separator row
        elements.push(
          <div key={i} style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e2e8f0' }}>
            {cells.map((cell, ci) => (
              <div key={ci} style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.9rem',
                fontWeight: i === 0 ? 'bold' : 'normal',
                background: '#f8fafc',
              }}>
                {cell}
              </div>
            ))}
          </div>
        );
      } else if (line.trim() === '') {
        // Skip empty lines
      } else {
        // Inline code and bold rendering
        let text = line;
        const parts = [];
        let lastIdx = 0;
        const regex = /`([^`]+)`|\*\*([^*]+)\*\*/g;
        let m;
        while ((m = regex.exec(text)) !== null) {
          if (m.index > lastIdx) {
            parts.push(text.slice(lastIdx, m.index));
          }
          if (m[1]) {
            parts.push(<code key={`${i}-${m.index}`} style={{ background: '#e0e7ff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.9em' }}>{m[1]}</code>);
          } else if (m[2]) {
            parts.push(<strong key={`${i}-${m.index}`}>{m[2]}</strong>);
          }
          lastIdx = m.index + m[0].length;
        }
        if (lastIdx < text.length) {
          parts.push(text.slice(lastIdx));
        }
        elements.push(<p key={i} style={{ margin: '0.5rem 0', lineHeight: '1.7', color: '#374151' }}>{parts.length > 0 ? parts : text}</p>);
      }
    }

    return <div style={{ marginTop: '1rem' }}>{elements}</div>;
  };

  const completedCount = progress.completedModuleIds?.length || 0;
  const totalModules = course?.modules?.length || 0;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

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
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0 }}>{course.title}</h1>
                {progress.completed && (
                  <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    {t('courses.completed')}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="badge badge-info">{course.category}</span>
                <span className={`badge ${getDifficultyBadgeClass(course.difficulty)}`}>
                  {t(`difficulty.${course.difficulty}`)}
                </span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '1.1rem', color: '#475569', margin: 0 }}>{course.description}</p>

          {/* Progress bar */}
          {user && totalModules > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{t('courses.progress')}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: course.color || '#667eea' }}>
                  {completedCount}/{totalModules} ({progressPercent}%)
                </span>
              </div>
              <div style={{
                height: '8px',
                background: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: progress.completed
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : `linear-gradient(90deg, ${course.color || '#667eea'}, ${course.color || '#667eea'}cc)`,
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Course Modules */}
        <h2 style={{ marginBottom: '1.5rem' }}>{t('courses.courseModules')}</h2>
        <div style={{ marginBottom: '2rem' }}>
          {course.modules?.map((module, index) => {
            const completed = isModuleCompleted(module.id);
            const isExpanded = expandedModule === module.id;

            return (
              <div key={module.id} className="card" style={{
                marginBottom: '1rem',
                borderLeft: `3px solid ${completed ? '#22c55e' : (course.color || '#667eea')}`,
                cursor: module.content ? 'pointer' : 'default',
              }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                  onClick={() => module.content && setExpandedModule(isExpanded ? null : module.id)}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: completed ? '#22c55e' : (course.color || '#667eea'),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    fontSize: completed ? '1.2rem' : '1rem',
                  }}>
                    {completed ? '\u2713' : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {module.title}
                      {completed && (
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                          {t('courses.moduleCompleted')}
                        </span>
                      )}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>{module.description}</p>
                  </div>
                  {module.content && (
                    <div style={{
                      fontSize: '1.2rem',
                      color: '#94a3b8',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }}>
                      \u25BC
                    </div>
                  )}
                </div>

                {/* Expanded theory content */}
                {isExpanded && module.content && (
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e2e8f0',
                  }}>
                    {renderContent(module.content)}

                    {/* Mark as completed button */}
                    {user && !completed && (
                      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteModule(module.id);
                          }}
                          className="btn btn-primary"
                          disabled={completing === module.id}
                          style={{
                            background: `linear-gradient(135deg, ${course.color || '#667eea'}, ${course.color || '#667eea'}cc)`,
                            border: 'none',
                            padding: '0.75rem 2rem',
                          }}
                        >
                          {completing === module.id ? t('common.loading') : t('courses.markComplete')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
                    progress.completed ? (
                      <button className="btn btn-secondary" style={{ width: '100%', opacity: 0.7 }} disabled>
                        {t('courses.courseCompleted')}
                      </button>
                    ) : (
                      <Link to={`/test/${test.id}/start`} className="btn btn-primary" style={{ width: '100%' }}>
                        {t('tests.startTest')}
                      </Link>
                    )
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
