// src/pages/Dashboard.tsx
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair: ", error);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--cor-branco)', minHeight: '100vh' }}>
      <h2 style={{ color: 'var(--cor-roxo-escuro)' }}>Painel de Controle - Vitória Rocha Farma</h2>
      <p style={{ color: 'var(--cor-texto-escuro)', marginBottom: '2rem', marginTop: '0.5rem' }}>
        bem-vinda Vitória, aqui será seu painel de contole para gerenciar seu site. estou ansioso para dar continuidade
      </p>

      <button 
        onClick={handleLogout}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'var(--cor-rosa)', 
          color: 'var(--cor-branco)', 
          border: 'none', 
          borderRadius: '6px', 
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Sair do Sistema
      </button>
    </div>
  );
}