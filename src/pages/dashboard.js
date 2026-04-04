import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/api';
import { devError, devLog } from '../utils/devLog';
import './dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();

    async function handleTest() {
        devLog('[Teste] botão: chamando getMe() → fetchWithAuth /auth/me');
        try {
            const data = await getMe();
            if (data) {
                devLog('[Teste] OK — /me respondeu:', data);
            } else {
                devLog('[Teste] /me devolveu null (401 após refresh ou sem sessão)');
            }
        } catch (err) {
            devError('[Teste] erro:', err);
        }
    }

    const initials = user?.email?.[0]?.toUpperCase() || 'U';

    return (
            <div className="dash-layout">
              <aside className="dash-sidebar">
                <div className="dash-brand">
                  <span className="dash-brand-icon">✦</span>
                  <span className="dash-brand-name">Meu Sistema</span>
                </div>
        
                <div className="dash-user-card">
                  <div className="dash-avatar">{initials}</div>
                  <div className="dash-user-info">
                    <span className="dash-user-name">{user?.username || 'Utilizador'}</span>
                    <span className="dash-user-email">{user?.email}</span>
                  </div>
                </div>
        
                <nav className="dash-nav">
                  <button className="dash-nav-item dash-nav-active">
                    <span>⊞</span> Dashboard
                  </button>
                  <button className="dash-nav-item">
                    <span>✓</span> Tarefas
                  </button>
                  <button className="dash-nav-item">
                    <span>◎</span> Configurações
                  </button>
                </nav>
        
                <button type="button" className="dash-logout" onClick={logout}>
                  → Sair
                </button>
              </aside>
        
              <main className="dash-main">
                <header className="dash-header">
                  <div>
                    <h1 className="dash-page-title">Dashboard</h1>
                    <p className="dash-page-sub">
                      Bem-vindo de volta, {user?.email ?? 'Utilizador'}!
                    </p>
                  </div>
                  <div className="dash-badge">
                    <span className="dash-dot"></span>
                    Online
                  </div>
                </header>
        
                <div className="dash-cards">
                  <div className="dash-card dash-card-accent">
                    <div className="dash-card-icon">✦</div>
                    <div className="dash-card-body">
                      <span className="dash-card-label">Sessão</span>
                      <span className="dash-card-value">Autenticado com sucesso</span>
                    </div>
                  </div>
        
                  <div className="dash-card">
                    <div className="dash-card-icon">◎</div>
                    <div className="dash-card-body">
                      <span className="dash-card-label">Email</span>
                      <span className="dash-card-value">{user?.email ?? '—'}</span>
                    </div>
                  </div>
        
                  <div className="dash-card">
                    <div className="dash-card-icon">⊞</div>
                    <div className="dash-card-body">
                      <span className="dash-card-label">Conta</span>
                      <span className="dash-card-value">Ativa</span>
                    </div>
                  </div>
                </div>
        
                <div className="dash-welcome">
                  <h2 className="dash-welcome-title">Tudo pronto por aqui 🚀</h2>
                  <p className="dash-welcome-text">
                    Sistema funcionando corretamente. Use o menu lateral para navegar entre as seções.
                  </p>
                  <button type="button" className="dash-test-btn" onClick={handleTest}>
                    Testar /me
                  </button>
                </div>
              </main>
            </div>
          );
        }
        
        export default Dashboard;
        