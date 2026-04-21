import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); } catch (e) { console.error(e); }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/dashboard" className="navbar-brand">⚡ SmartHabit</a>

        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Analytics
          </NavLink>
        </div>

        <div className="navbar-actions">
          <span className="user-badge">{user?.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
