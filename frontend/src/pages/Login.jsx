import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/';

  const [email,setEmail] = useState('');
  const [pass,setPass]   = useState('');
  const [errorMsg,setErrorMsg] = useState('');
  const [shaking,setShaking]   = useState(false);
  const [loading,setLoading]   = useState(false);
  const [msEnabled,setMsEnabled] = useState(false);

  useEffect(()=>{
    api.get('/config').then(r=>setMsEnabled(!!r.data.microsoftEnabled)).catch(()=>{});
  },[]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await onLogin(email, pass);
      nav(from, { replace:true });
    } catch {
      setErrorMsg('Credenciales inválidas. Intenta de nuevo.');
      setShaking(true);
      setTimeout(()=> setShaking(false), 600);
      setTimeout(()=> setErrorMsg(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className={`card shadow-lg p-4 auth-card ${shaking ? 'shake' : ''}`}>
        <div className="text-center mb-2">
          {/* Logo arriba del título */}
          <img
            src="/uvm-logo.svg"
            alt="Logo de la Universidad del Valle de México"
            className="mb-1"
            height={200}
          />
          <div className="h4 auth-brand mb-1">Universidad del Valle de México</div>
          <div className="text-muted">Banco de preguntas universitario</div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger auth-error d-flex align-items-center py-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email institucional</label>
            <input
              type="email" className="form-control" autoFocus required
              value={email} onChange={e=>setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <input
              type="password" className="form-control" required
              value={pass} onChange={e=>setPass(e.target.value)}
            />
          </div>

          <button className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Entrar'}
          </button>

          <button
            type="button"
            className="btn btn-outline-primary mb-5 w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={!msEnabled}
            onClick={()=>window.location.href='/api/auth/microsoft'}
          >
            <i className="bi bi-microsoft"></i> Entrar con Microsoft
          </button>
        </form>
      </div>
    </div>
  );
}
