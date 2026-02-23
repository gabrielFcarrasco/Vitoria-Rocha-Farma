// src/pages/Login.tsx
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;

      const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || '';
      const adminEmails = adminEmailsString.split(',');

      if (userEmail && adminEmails.includes(userEmail)) {
        navigate('/admin'); 
      } else {
        await signOut(auth);
        alert('Acesso negado: Este e-mail não tem permissão de administrador.');
      }
    } catch (error) {
      console.error("Erro ao fazer login: ", error);
      alert('Ocorreu um erro ao tentar fazer login.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--cor-creme)' }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem', 
        borderRadius: '12px', 
        backgroundColor: 'var(--cor-branco)', 
        boxShadow: '0 10px 15px rgba(0,0,0,0.05)',
        borderTop: '5px solid var(--cor-roxo-escuro)' 
      }}>
        <h2 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem' }}>Acesso Restrito</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--cor-texto-escuro)' }}>
          Painel Administrativo <br/><b>Vitória Rocha Farma</b>
        </p>
        
        <button 
          onClick={handleLogin}
          style={{ 
            padding: '12px 24px', 
            cursor: 'pointer', 
            backgroundColor: 'var(--cor-roxo-escuro)', 
            color: 'var(--cor-branco)', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '16px', 
            fontWeight: 'bold',
            width: '100%',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--cor-lilas)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--cor-roxo-escuro)'}
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}