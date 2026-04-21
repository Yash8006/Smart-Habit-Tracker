import { useState } from 'react';
import { useHabits } from '../context/HabitContext';

const CATEGORIES = ['Health','Fitness','Learning','Mindfulness','Productivity','Social','Custom'];
const FREQUENCIES = ['daily','weekly','monthly'];

export default function HabitModal({ habit, onClose }) {
  const { addHabit, updateHabit } = useHabits();
  const [form, setForm]   = useState({
    name:        habit?.name        ?? '',
    description: habit?.description ?? '',
    category:    habit?.category    ?? 'Health',
    frequency:   habit?.frequency   ?? 'daily',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Habit name is required.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      if (habit) await updateHabit(habit.id, { name: form.name.trim(), description: form.description.trim(), category: form.category, frequency: form.frequency });
      else        await addHabit(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{habit ? 'Edit Habit' : 'Add New Habit'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="modal-close">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="h-name">Habit Name *</label>
            <input id="h-name" name="name" type="text" className={`form-input${errors.name?' error':''}`}
              placeholder="e.g. Meditate 10 mins" value={form.name} onChange={onChange} disabled={loading} autoFocus />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="h-desc">Description</label>
            <textarea id="h-desc" name="description" className="form-textarea"
              placeholder="What's this habit about?" value={form.description} onChange={onChange} disabled={loading} rows={2} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
            <div className="form-group">
              <label className="form-label" htmlFor="h-cat">Category</label>
              <select id="h-cat" name="category" className="form-select" value={form.category} onChange={onChange} disabled={loading}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="h-freq">Frequency</label>
              <select id="h-freq" name="frequency" className="form-select" value={form.frequency} onChange={onChange} disabled={loading}>
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-habit-btn">
              {loading ? <><span className="spinner spinner-sm"/>{habit ? 'Saving…' : 'Adding…'}</> : (habit ? 'Save Changes' : 'Add Habit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
