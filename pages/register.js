import './login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../api/api';

function Register() {
    const navigate = useNavigate();
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
        try {
            const res = await createUser({ name: nome, email, password });

            if (!res.ok) {
                setError(res.data?.detail || 'Erro ao criar conta');
                return;
            }

            setSuccess('Conta criada! Redirecionando...');
            setTimeout(() => navigate('/'), 1500);

        } catch (err) {
            setError('Erro ao conectar com servidor');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-bg">
            <div className="login-card">
                <div className="login-brand">
                    <span className="login-logo">✓</span>
                    <span className="login-title">TodoApp</span>
                </div>

                <h2 className="login-heading">Criar conta</h2>
                <p className="login-sub">Preencha os dados para se cadastrar</p>

                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label>Nome</label>
                        <input
                            type="text"
                            placeholder="Seu nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label>Senha</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Criar conta'}
                    </button>
                </form>

                <p className="login-footer">
                    Já tem conta?{' '}
                    <span className="login-link" onClick={() => navigate('/')}>
                        Entrar
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;
