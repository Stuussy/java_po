import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { coursesAPI } from '../api/courses';
import { authAPI } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AvatarSelector from '../components/auth/AvatarSelector';
import { getAvatarById } from '../utils/avatars';
import '../styles/AvatarSelector.css';

const courseIcons = {
  python: '\uD83D\uDC0D',
  java: '\u2615',
  javascript: '\uD83D\uDFE1',
  react: '\u269B\uFE0F',
  database: '\uD83D\uDDC4\uFE0F',
  cplusplus: '\u2699\uFE0F',
};

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { t } = useLanguage();
  const [attempts, setAttempts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [attemptsData, certsData, progressData, coursesData] = await Promise.all([
        testsAPI.getMyAttempts(),
        testsAPI.getMyCertificates(),
        coursesAPI.getMyProgress(),
        coursesAPI.getAllCourses(),
      ]);
      setAttempts(attemptsData);
      setCertificates(certsData);
      setCompletedCourses(progressData.filter(p => p.completed));
      setAllCourses(coursesData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = async (avatarId) => {
    try {
      const updatedUser = await authAPI.updateAvatar(avatarId);
      updateUser({ avatar: updatedUser.avatar });
      setShowAvatarSelector(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleDownloadCertificate = async (cert) => {
    try {
      const blob = await testsAPI.downloadCertificate(cert.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${cert.verificationCode}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const getCourseById = (courseId) => allCourses.find(c => c.id === courseId);

  const currentAvatar = getAvatarById(user?.avatar || 'avatar1');

  return (
    <div className="main-content">
      <div className="container">
        {/* User Info Card */}
        <div className="card">
          <h1 className="card-title">{t('profile.title')}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  fontSize: '5rem',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: currentAvatar.color + '20',
                  border: `4px solid ${currentAvatar.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite'
                }}
              >
                {currentAvatar.emoji}
              </div>
              <button
                onClick={() => setShowAvatarSelector(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                {t('profile.changeAvatar')}
              </button>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('profile.name')}:</strong> {user?.name}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('profile.email')}:</strong> {user?.email}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>{t('profile.role')}:</strong>{' '}
                <span className={`badge ${user?.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>
                  {user?.role}
                </span>
              </div>
              {user?.organization && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{t('profile.organization')}:</strong> {user.organization}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button onClick={logout} className="btn btn-danger">
              {t('header.logout')}
            </button>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="card">
          <h2 className="card-title">{t('profile.completedCourses')}</h2>

          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : completedCourses.length === 0 ? (
            <p>{t('profile.noCompletedCourses')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {completedCourses.map((progress) => {
                const course = getCourseById(progress.courseId);
                if (!course) return null;
                const icon = courseIcons[course.icon] || '\uD83D\uDCDA';

                return (
                  <Link
                    key={progress.id}
                    to={`/courses/${course.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '2px solid #22c55e',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'transform 0.2s',
                    }}
                  >
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
                    <div>
                      <h4 style={{ margin: 0 }}>{course.title}</h4>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#16a34a' }}>
                        {t('courses.completed')} {progress.completedAt && `- ${new Date(progress.completedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificates */}
        <div className="card">
          <h2 className="card-title">{t('profile.myCertificates')}</h2>

          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : certificates.length === 0 ? (
            <p>{t('profile.noCertificates')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #f59e0b',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#92400e' }}>{cert.testTitle}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#a16207' }}>
                        {t('profile.score')}: <strong>{cert.score?.toFixed(1)}%</strong>
                      </p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#a16207' }}>
                        {t('certificate.issued')}: {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#a16207' }}>
                        {t('certificate.verificationCode')}:{' '}
                        <code style={{ background: '#fde68a', padding: '1px 6px', borderRadius: '4px' }}>
                          {cert.verificationCode}
                        </code>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="btn btn-primary"
                    style={{
                      marginTop: '0.75rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                      padding: '0.4rem 1rem',
                      fontSize: '0.85rem',
                      width: '100%',
                    }}
                  >
                    {t('certificate.download')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test History */}
        <div className="card">
          <h2 className="card-title">{t('profile.testHistory')}</h2>

          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : attempts.length === 0 ? (
            <p>{t('profile.noAttempts')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-mobile-cards">
                <thead>
                  <tr>
                    <th>{t('profile.date')}</th>
                    <th>{t('profile.testId')}</th>
                    <th>{t('profile.score')}</th>
                    <th>{t('profile.status')}</th>
                    <th>{t('profile.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td data-label={t('profile.date')}>{new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}</td>
                      <td data-label={t('profile.testId')}>{attempt.testId}</td>
                      <td data-label={t('profile.score')}>
                        {attempt.score !== null && attempt.score !== undefined ? (
                          <span style={{ fontWeight: 'bold' }}>{attempt.score.toFixed(1)}%</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td data-label={t('profile.status')}>
                        <span className={`badge ${
                          attempt.status === 'GRADED' ? 'badge-success' :
                          attempt.status === 'SUBMITTED' ? 'badge-info' :
                          'badge-danger'
                        }`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td data-label={t('profile.actions')}>
                        {attempt.status === 'GRADED' && (
                          <Link to={`/result/${attempt.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                            {t('profile.viewResult')}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAvatarSelector && (
          <AvatarSelector
            currentAvatar={user?.avatar || 'avatar1'}
            onSelect={handleAvatarSelect}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
