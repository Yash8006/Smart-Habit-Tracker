import { useMemo } from 'react';
import { useHabits, getStreak } from '../context/HabitContext';

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0,2),
      num: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
}

export default function AnalyticsPage() {
  const { habits, loading, today } = useHabits();
  const days = useMemo(() => getLast7Days(), []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg"/>
      <p>Loading analytics…</p>
    </div>
  );

  if (habits.length === 0) return (
    <div className="page">
      <div className="section-header">
        <h1 className="section-title">Analytics</h1>
        <div className="section-line" />
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>No data yet</h3>
        <p>Add and complete some habits to see your analytics here.</p>
      </div>
    </div>
  );

  // Per-day completion
  const dayStats = days.map(d => ({
    ...d,
    done:  habits.filter(h => !!h.logs?.[d.key]).length,
    total: habits.length,
  }));

  // Per-habit completion rate (last 7 days)
  const habitStats = habits.map(h => {
    const done = days.filter(d => !!h.logs?.[d.key]).length;
    return { id: h.id, name: h.name, done, pct: Math.round((done / 7) * 100), streak: getStreak(h.logs) };
  }).sort((a, b) => b.pct - a.pct);

  const totalCompletionsWeek = dayStats.reduce((s, d) => s + d.done, 0);
  const avgPerDay = habits.length > 0 ? (totalCompletionsWeek / 7).toFixed(1) : 0;
  const bestDay = dayStats.reduce((best, d) => d.done > (best?.done ?? -1) ? d : best, null);
  const topStreak = habits.reduce((mx, h) => Math.max(mx, getStreak(h.logs)), 0);

  return (
    <div className="page">
      <div className="section-header">
        <h1 className="section-title">Analytics</h1>
        <div className="section-line" />
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{marginBottom:'2rem'}}>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <span className="stat-value" style={{color:'var(--indigo-light)'}}>{totalCompletionsWeek}</span>
          <span className="stat-label">Completions This Week</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <span className="stat-value" style={{color:'var(--emerald)'}}>{avgPerDay}</span>
          <span className="stat-label">Avg / Day</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <span className="stat-value" style={{color:'var(--amber)'}}>
            {bestDay ? `${bestDay.done}/${habits.length}` : '–'}
          </span>
          <span className="stat-label">Best Day ({bestDay?.label ?? '–'})</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value" style={{color:'var(--rose)'}}>{topStreak}</span>
          <span className="stat-label">Longest Streak</span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Weekly overview heatmap */}
        <div className="chart-card">
          <div className="chart-title">📅 Last 7 Days</div>
          <div className="week-grid">
            {dayStats.map(d => {
              const pct = habits.length ? d.done / d.total : 0;
              const cls = pct === 0 ? 'empty' : pct >= 1 ? 'done' : 'partial';
              return (
                <div key={d.key} className={`day-cell ${cls}${d.isToday ? ' today' : ''}`}
                  title={`${d.label} ${d.num}: ${d.done}/${d.total} habits`}>
                  <span className="day-label">{d.label}</span>
                  <span className="day-num">{d.num}</span>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:'1rem', display:'flex', gap:'1rem', fontSize:'0.72rem', color:'var(--text-muted)'}}>
            <span style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{width:10,height:10,borderRadius:2,background:'rgba(16,185,129,0.25)',display:'inline-block'}}/>All done
            </span>
            <span style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{width:10,height:10,borderRadius:2,background:'rgba(245,158,11,0.2)',display:'inline-block'}}/>Partial
            </span>
            <span style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{width:10,height:10,borderRadius:2,background:'var(--bg-elevated)',display:'inline-block'}}/>None
            </span>
          </div>
        </div>

        {/* Bar chart – daily completions */}
        <div className="chart-card">
          <div className="chart-title">📊 Daily Completions</div>
          <div className="bar-chart">
            {dayStats.map(d => {
              const maxH = habits.length || 1;
              const h = Math.max((d.done / maxH) * 100, d.done > 0 ? 8 : 4);
              return (
                <div key={d.key} className="bar-item">
                  <div className="bar" style={{height:`${h}%`}} title={`${d.done} habits`}/>
                  <span className="bar-name">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit completion rates */}
        <div className="chart-card" style={{gridColumn:'1/-1'}}>
          <div className="chart-title">🏆 Habit Completion Rates (Last 7 Days)</div>
          <div className="progress-list">
            {habitStats.map(h => (
              <div key={h.id} className="progress-item">
                <div className="progress-header">
                  <span className="progress-name">{h.name}</span>
                  <span className="progress-pct">
                    {h.done}/7 &nbsp;·&nbsp; {h.pct}%
                    {h.streak > 0 && <span style={{marginLeft:'0.5rem'}}>🔥{h.streak}</span>}
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width:`${h.pct}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's status */}
        <div className="chart-card">
          <div className="chart-title">☀️ Today's Status</div>
          <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', marginTop:'0.5rem'}}>
            {habits.map(h => {
              const done = !!h.logs?.[today];
              return (
                <div key={h.id} style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                  <span style={{fontSize:'0.9rem'}}>{done ? '✅' : '⭕'}</span>
                  <span style={{
                    fontSize:'0.85rem', flex:1,
                    color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                    textDecoration: done ? 'none' : 'none',
                  }}>{h.name}</span>
                  {getStreak(h.logs) > 0 && (
                    <span style={{fontSize:'0.75rem', color:'var(--amber)'}}>🔥{getStreak(h.logs)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Streaks leaderboard */}
        <div className="chart-card">
          <div className="chart-title">🏅 Streak Leaderboard</div>
          <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', marginTop:'0.5rem'}}>
            {[...habitStats].sort((a,b) => b.streak - a.streak).slice(0,5).map((h, i) => (
              <div key={h.id} style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                <span style={{
                  width:24, height:24, borderRadius:'50%',
                  background: i===0?'rgba(245,158,11,0.2)':i===1?'rgba(100,116,139,0.2)':i===2?'rgba(180,83,9,0.2)':'var(--bg-elevated)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.7rem', fontWeight:700, color:'var(--text-secondary)',
                  flexShrink:0,
                }}>{i+1}</span>
                <span style={{flex:1, fontSize:'0.85rem', color:'var(--text-primary)'}}>{h.name}</span>
                <span style={{fontSize:'0.85rem', color: h.streak > 0 ? 'var(--amber)' : 'var(--text-muted)', fontWeight:700}}>
                  {h.streak > 0 ? `🔥 ${h.streak}` : '–'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
