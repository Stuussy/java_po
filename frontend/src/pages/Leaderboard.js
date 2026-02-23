import React, { useState, useEffect } from 'react';
import { testsAPI } from '../api/tests';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarById } from '../utils/avatars';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await testsAPI.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  const getMedalStyle = (rank) => {
    if (rank === 0) return { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#fff', fontSize: '1.5rem' };
    if (rank === 1) return { background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', color: '#fff', fontSize: '1.5rem' };
    if (rank === 2) return { background: 'linear-gradient(135deg, #CD7F32, #B8860B)', color: '#fff', fontSize: '1.5rem' };
    return { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '1rem' };
  };

  const getMedal = (rank) => {
    if (rank === 0) return '\uD83E\uDD47';
    if (rank === 1) return '\uD83E\uDD48';
    if (rank === 2) return '\uD83E\uDD49';
    return rank + 1;
  };

  return (
    <div className="main-content">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {t('leaderboard.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {t('leaderboard.description')}
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{t('leaderboard.empty')}</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {leaderboard.length >= 3 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}>
                {[1, 0, 2].map((rank) => {
                  const entry = leaderboard[rank];
                  if (!entry) return null;
                  const avatar = getAvatarById(entry.avatar || 'avatar1');
                  const isFirst = rank === 0;
                  return (
                    <div key={rank} className="card" style={{
                      textAlign: 'center',
                      padding: '1.5rem',
                      minWidth: '180px',
                      maxWidth: '220px',
                      transform: isFirst ? 'scale(1.1)' : 'none',
                      border: isFirst ? '2px solid #FFD700' : '1px solid var(--border)',
                      order: rank,
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {getMedal(rank)}
                      </div>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: avatar.color + '25',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 0.5rem',
                      }}>
                        {avatar.emoji}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        {entry.name}
                      </h3>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                        {entry.totalPoints}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {t('leaderboard.points')}
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {t('leaderboard.avgScore')}: {entry.avgScore}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('leaderboard.player')}</th>
                      <th>{t('leaderboard.totalPoints')}</th>
                      <th>{t('leaderboard.avgScore')}</th>
                      <th>{t('leaderboard.bestScore')}</th>
                      <th>{t('leaderboard.testsCompleted')}</th>
                      <th>{t('leaderboard.attempts')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const avatar = getAvatarById(entry.avatar || 'avatar1');
                      const isCurrentUser = user && entry.userId === user.id;
                      return (
                        <tr key={entry.userId} style={{
                          background: isCurrentUser ? 'var(--primary)10' : 'transparent',
                          fontWeight: isCurrentUser ? '600' : 'normal',
                        }}>
                          <td>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              ...getMedalStyle(index),
                            }}>
                              {getMedal(index)}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: avatar.color + '25',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                flexShrink: 0,
                              }}>
                                {avatar.emoji}
                              </div>
                              <span>{entry.name} {isCurrentUser ? `(${t('leaderboard.you')})` : ''}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                            {entry.totalPoints}
                          </td>
                          <td>{entry.avgScore}%</td>
                          <td>{entry.bestScore}%</td>
                          <td>{entry.testsCompleted}</td>
                          <td>{entry.attemptsCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
