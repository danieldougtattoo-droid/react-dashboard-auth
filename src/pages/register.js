import './login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser, login, setSession } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { devError, devLog } from '../utils/devLog';

function formatApiError(data) {
    if (!data?.detail) return 'Erro ao criar conta';
    const d = data.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) {
        return d
            .map((item) => (typeof item === 'string' ? item : item.msg || JSON.stringify(item)))
            .join(' ');
    }
    return 'Erro ao criar conta';
}

function Register() {
    const navigate = useNavigate();
    const { loadUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await createUser({ name: nome, email, password });

            if (!res.ok) {
                setError(formatApiError(res.data));
                return;
            }

            devLog('[register] conta criada, tentando login automático');
            const loginRes = await login(email, password);

            if (loginRes.networkError) {
                setSuccess(
                    'Conta criada! Não foi possível entrar automaticamente — faça login na próxima página.'
                );
                setTimeout(() => navigate('/', { replace: true, state: { registered: true } }), 1200);
                return;
            }

            if (loginRes.ok) {
                const token =
                    loginRes.data.access_token ||
                    loginRes.data.access ||
                    loginRes.data.token;
                const refresh =
                    loginRes.data.refresh_token || loginRes.data.refresh;

                if (token) {
                    if (!refresh) {
                        localStorage.removeItem('refresh_token');
                    }
                    if (
                        setSession({
                            access_token: token,
                            ...(refresh ? { refresh_token: refresh } : {}),
                        })
                    ) {
                        await loadUser();
                        navigate('/dashboard', { replace: true });
                        return;
                    }
                }
            }

            setSuccess('Conta criada! Faça login com seu email e senha.');
            setTimeout(() => navigate('/', { replace: true, state: { registered: true } }), 1200);
        } catch (err) {
            devError(err);
            setError(
                err?.message
                    ? `Erro inesperado: ${err.message}`
                    : 'Erro inesperado ao cadastrar.'
            );
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
                    <h1 className="login-title">Cadastrar</h1>
                    <p className="login-sub">Nome, email e senha para criar sua conta</p>
                </div>

                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label className="login-label" htmlFor="register-nome">
                            Nome
                        </label>
                        <input
                            id="register-nome"
                            className="login-input"
                            type="text"
                            placeholder="Seu nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label" htmlFor="register-email">
                            Email
                        </label>
                        <input
                            id="register-email"
                            className="login-input"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label" htmlFor="register-senha">
                            Senha
                        </label>
                        <input
                            id="register-senha"
                            className="login-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>

                <Link className="login-btn-secondary" to="/">
                    Entrar
                </Link>

                <p className="login-footer">Já tem conta? Use o botão acima para entrar.</p>
            </div>
        </div>
    );
}

export default Register;
