import { useState } from 'react';
import { useHabits, getStreak } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import HabitModal from '../components/HabitModal';

const CATEGORIES = ['Health','Fitness','Learning','Mindfulness','Productivity','Social','Custom'];

const GREET = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
const DATE_STR = () => new Date().toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'});

function catClass(c) {
  return 'cat-' + (c || 'custom').toLowerCase();
}

function HabitCard({ habit, onEdit, onDelete }) {
  const { logHabit, unlogHabit, today } = useHabits();
  const done    = !!habit.logs?.[today];
  const streak  = getStreak(habit.logs);

  return (
    <div className={`habit-card${done ? ' completed' : ''}`}>
      <button
        className={`habit-check${done ? ' checked' : ''}`}
        onClick={() => done ? unlogHabit(habit.id) : logHabit(habit.id)}
        title={done ? 'Mark incomplete' : 'Mark complete'}
        id={`habit-check-${habit.id}`}
      >
        {done ? '✓' : ''}
      </button>

      <div className="habit-info">
        <div className={`habit-name${done ? ' done' : ''}`}>{habit.name}</div>
        <div className="habit-meta">
          <span className={`habit-badge ${catClass(habit.category)}`}>{habit.category}</span>
          {streak > 0 && (
            <span className="habit-streak">🔥 {streak} day{streak !== 1 ? 's' : ''}</span>
          )}
          {habit.description && (
            <span className="habit-streak" style={{color:'var(--text-muted)'}}>{habit.description}</span>
          )}
        </div>
      </div>

      <div className="habit-actions">
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(habit)} title="Edit" id={`edit-${habit.id}`}>✏️</button>
        <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(habit.id)} title="Delete" id={`delete-${habit.id}`}>🗑️</button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { habits, loading, error, stats } = useHabits();
  const { deleteHabit } = useHabits();
  const [showModal, setShowModal]   = useState(false);
  const [editHabit, setEditHabit]   = useState(null);
  const [filter, setFilter]         = useState('All');

  const filtered = filter === 'All' ? habits
    : habits.filter(h => h.category === filter);

  const handleEdit = (h) => { setEditHabit(h); setShowModal(true); };
  const handleAdd  = ()  => { setEditHabit(null); setShowModal(true); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this habit?')) await deleteHabit(id);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg"/>
      <p>Loading your habits…</p>
    </div>
  );

  return (
    <div className="page">
      {/* Greeting */}
      <div className="greeting-section">
        <h1 className="greeting-text">
          {GREET()}, <span className="gradient-text">{user?.displayName || user?.email?.split('@')[0] || 'there'}</span> 👋
        </h1>
        <p className="greeting-date">{DATE_STR()}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <span className="stat-value" style={{color:'var(--indigo-light)'}}>{stats.total}</span>
          <span className="stat-label">Total Habits</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value" style={{color:'var(--emerald)'}}>{stats.completedToday}</span>
          <span className="stat-label">Done Today</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-value" style={{color:'var(--amber)'}}>
            {stats.total > 0 ? Math.round((stats.completedToday / stats.total) * 100) : 0}%
          </span>
          <span className="stat-label">Completion Rate</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value" style={{color:'var(--rose)'}}>{stats.bestStreak}</span>
          <span className="stat-label">Best Streak</span>
        </div>
      </div>

      {/* Habits Section */}
      <div className="habits-header">
        <h2 className="habits-title">Your Habits</h2>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center'}}>
          {/* Category filter */}
          <select
            className="form-select"
            style={{width:'auto', padding:'0.4rem 0.75rem', fontSize:'0.8rem'}}
            value={filter}
            onChange={e => setFilter(e.target.value)}
            id="category-filter"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} id="add-habit-btn">
            + Add Habit
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{error}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <h3>{habits.length === 0 ? 'No habits yet' : 'No habits in this category'}</h3>
          <p>{habits.length === 0
            ? 'Add your first habit and start building a better routine!'
            : 'Try selecting a different category or add a new habit.'}</p>
          {habits.length === 0 &&
            <button className="btn btn-primary" onClick={handleAdd} id="first-habit-btn">
              Add your first habit
            </button>}
        </div>
      ) : (
        <div className="habit-list">
          {filtered.map(h => (
            <HabitCard key={h.id} habit={h} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <HabitModal
          habit={editHabit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
