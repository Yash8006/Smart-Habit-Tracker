import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ERR = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password':        'Password must be at least 6 characters.',
  'auth/invalid-email':        'Invalid email address.',
};

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name     = 'Name is required.';
    if (!form.email.trim())   e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)       e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Min 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setServerErr('');
    try {
      await signup(form.email, form.password, form.name);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerErr(ERR[err.code] || 'Sign-up failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGLoading(true); setServerErr('');
    try {
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerErr('Google sign-in failed. Please try again.');
    } finally { setGLoading(false); }
  };

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
    setServerErr('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🚀</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start building better habits today</p>
        </div>

        {serverErr && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{serverErr}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className={`form-input${errors.name?' error':''}`}
              placeholder="John Doe" value={form.name} onChange={onChange} disabled={loading||gLoading} autoComplete="name" />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="su-email">Email</label>
            <input id="su-email" name="email" type="email" className={`form-input${errors.email?' error':''}`}
              placeholder="you@example.com" value={form.email} onChange={onChange} disabled={loading||gLoading} autoComplete="email" />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="su-password">Password</label>
            <input id="su-password" name="password" type="password" className={`form-input${errors.password?' error':''}`}
              placeholder="Min. 6 characters" value={form.password} onChange={onChange} disabled={loading||gLoading} autoComplete="new-password" />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input id="confirm" name="confirm" type="password" className={`form-input${errors.confirm?' error':''}`}
              placeholder="Re-enter password" value={form.confirm} onChange={onChange} disabled={loading||gLoading} autoComplete="new-password" />
            {errors.confirm && <p className="form-error">{errors.confirm}</p>}
          </div>

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading||gLoading} id="signup-btn">
            {loading ? <><span className="spinner spinner-sm"/>Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button className="btn btn-secondary btn-lg btn-full" type="button" onClick={handleGoogle}
          disabled={loading||gLoading} id="google-signup-btn">
          {gLoading ? <><span className="spinner spinner-sm"/>Connecting…</> : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
