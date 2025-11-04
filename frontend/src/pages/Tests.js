import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testsAPI } from '../api/tests';
import { useLanguage } from '../contexts/LanguageContext';

const Tests = () => {
  const { t } = useLanguage();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await testsAPI.getAllTests();
      setTests(data);
      setFilteredTests(data);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [tests, search, selectedCategory, selectedDifficulty, sortBy]);

  const applyFilters = () => {
    let result = [...tests];

    // Search filter
    if (search.trim() !== '') {
      result = result.filter(test =>
        test.title.toLowerCase().includes(search.toLowerCase()) ||
        test.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(test => test.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      result = result.filter(test => test.difficulty === selectedDifficulty);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return a.durationMinutes - b.durationMinutes;
        case 'questions':
          return (b.questions?.length || 0) - (a.questions?.length || 0);
        case 'difficulty':
          const difficultyOrder = { 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        default:
          return 0;
      }
    });

    setFilteredTests(result);
  };

  const getUniqueCategories = () => {
    const categories = tests.map(test => test.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'badge-success';
      case 'INTERMEDIATE':
        return 'badge-info';
      case 'ADVANCED':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="main-content">
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>{t('tests.title')}</h1>

        {/* Filters Section */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🔍 {t('tests.filters')}</h3>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder={`🔎 ${t('tests.search')}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Category Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                📂 {t('tests.category')}
              </label>
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">{t('tests.allCategories')}</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                ⭐ {t('tests.difficulty')}
              </label>
              <select
                className="form-control"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">{t('tests.allLevels')}</option>
                <option value="BEGINNER">{t('difficulty.BEGINNER')}</option>
                <option value="INTERMEDIATE">{t('difficulty.INTERMEDIATE')}</option>
                <option value="ADVANCED">{t('difficulty.ADVANCED')}</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                🔄 {t('tests.sortBy')}
              </label>
              <select
                className="form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title">{t('tests.sortTitle')}</option>
                <option value="duration">{t('tests.sortDuration')}</option>
                <option value="questions">{t('tests.sortQuestions')}</option>
                <option value="difficulty">{t('tests.sortDifficulty')}</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div style={{ marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            {t('tests.showing')} {filteredTests.length} {t('tests.of')} {tests.length} {tests.length !== 1 ? t('tests.tests_plural') : t('tests.test')}
          </div>
        </div>

        {filteredTests.length === 0 ? (
          <div className="card">
            <p>{t('tests.noTests')}</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {filteredTests.map((test) => (
              <div key={test.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>{test.title}</h3>
                  {test.difficulty && (
                    <span className={`badge ${getDifficultyBadgeClass(test.difficulty)}`} style={{ flexShrink: 0, marginLeft: '1rem' }}>
                      {t(`difficulty.${test.difficulty}`)}
                    </span>
                  )}
                </div>

                {test.category && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                      📂 {test.category}
                    </span>
                  </div>
                )}

                <p className="card-description">{test.description}</p>

                <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <strong>⏱️ {t('tests.duration')}:</strong> {test.durationMinutes} {t('tests.minutes')}
                  </div>
                  <div>
                    <strong>❓ {t('tests.questions')}:</strong> {test.questions?.length || 0}
                  </div>
                  <div>
                    <strong>🎯 {t('tests.passing')}:</strong> {test.passingScore}%
                  </div>
                </div>

                {test.tags && test.tags.length > 0 && (
                  <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {test.tags.map((tag, index) => (
                      <span key={index} className="badge badge-info">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Link to={`/test/${test.id}/start`} className="btn btn-primary" style={{ width: '100%' }}>
                  {t('tests.startTest')} →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;
