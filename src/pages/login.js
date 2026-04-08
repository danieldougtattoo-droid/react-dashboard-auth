import './login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, setSession } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { devError, devLog } from '../utils/devLog';

function Login() {
    const navigate = useNavigate();
    const { loadUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await login(email.trim(), password);
            devLog('RES.DATA:', res.data);

            if (!res.ok) {
                setError('Email ou senha inválidos');
                return;
            }

            const token =
                res.data.access_token || res.data.access || res.data.token;
            const refresh =
                res.data.refresh_token || res.data.refresh;

            if (!token) {
                devError('Token não encontrado', res.data);
                setError('Erro ao obter token');
                return;
            }

            if (!refresh) {
                localStorage.removeItem('refresh_token');
            }
            if (
                !setSession({
                    access_token: token,
                    ...(refresh ? { refresh_token: refresh } : {}),
                })
            ) {
                setError('Erro ao guardar sessão');
                return;
            }

            devLog('TOKEN SALVO:', localStorage.getItem('access_token'));
            await loadUser();
            navigate('/dashboard', { replace: true });
        } catch (err) {
            devError(err);
            setError('Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-bg">
        <div className="login-card">
  
          <div className="login-brand">
            <span className="login-brand-icon">✦</span>
            <span className="login-brand-name">Meu Sistema</span>
          </div>
  
          <div className="login-header">
            <h1 className="login-title">Entrar</h1>
            <p className="login-sub">Bem-vindo de volta!</p>
          </div>

          <p className="login-top-register">
            Novo utilizador?{' '}
            <Link className="login-link" to="/register">
              Criar conta
            </Link>
          </p>
  
          {error && <div className="login-error">{error}</div>}
  
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
  
            <div className="login-field">
              <label className="login-label">Senha</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
  
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>

          <Link className="login-btn-secondary" to="/register">
            Cadastrar
          </Link>

          <p className="login-footer">
            Não tem conta? Use o botão acima para criar sua conta.
          </p>
        </div>
      </div>
    );
  }
  
  export default Login;
  
