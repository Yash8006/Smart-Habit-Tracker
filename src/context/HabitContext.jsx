import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, serverTimestamp, deleteField,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const HabitContext = createContext(null);

const TODAY = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const getStreak = (logs = {}) => {
  if (!logs || !Object.keys(logs).length) return 0;
  const keys = new Set(Object.keys(logs));
  let streak = 0;
  const cur = new Date();
  if (!keys.has(TODAY())) cur.setDate(cur.getDate() - 1);
  for (;;) {
    const k = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
    if (keys.has(k)) { streak++; cur.setDate(cur.getDate()-1); }
    else break;
  }
  return streak;
};

export function HabitProvider({ children }) {
  const { user } = useAuth();
  const [habits, setHabits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user) { setHabits([]); setLoading(false); return; }
    setLoading(true);
    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q,
      (snap) => {
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setHabits(data);
        setLoading(false);
        setError(null);
      },
      (err) => { console.error(err); setError('Failed to load habits'); setLoading(false); }
    );
    return unsub;
  }, [user]);

  const addHabit = useCallback(async (data) => {
    if (!user) return;
    await addDoc(collection(db, 'habits'), {
      userId:      user.uid,
      name:        data.name.trim(),
      description: data.description?.trim() ?? '',
      category:    data.category ?? 'Custom',
      frequency:   data.frequency ?? 'daily',
      logs:        {},
      createdAt:   serverTimestamp(),
      updatedAt:   serverTimestamp(),
    });
  }, [user]);

  const updateHabit = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'habits', id), { ...data, updatedAt: serverTimestamp() });
  }, []);

  const deleteHabit = useCallback(async (id) => {
    await deleteDoc(doc(db, 'habits', id));
  }, []);

  const logHabit = useCallback(async (id, date = TODAY()) => {
    await updateDoc(doc(db, 'habits', id), {
      [`logs.${date}`]: true,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const unlogHabit = useCallback(async (id, date = TODAY()) => {
    await updateDoc(doc(db, 'habits', id), {
      [`logs.${date}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });
  }, []);

  const today = TODAY();
  const completedToday = habits.filter(h => h.logs?.[today]).length;
  const bestStreak = habits.reduce((mx, h) => Math.max(mx, getStreak(h.logs)), 0);

  return (
    <HabitContext.Provider value={{
      habits, loading, error, today,
      stats: { total: habits.length, completedToday, bestStreak },
      addHabit, updateHabit, deleteHabit, logHabit, unlogHabit,
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be inside HabitProvider');
  return ctx;
};
