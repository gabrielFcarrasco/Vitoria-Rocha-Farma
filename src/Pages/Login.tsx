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
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'var(--cor-creme)',
      fontFamily: 'sans-serif',
      padding: '1rem' // Garante que não encoste nas bordas no mobile
    }}>
      
      {/* O Card Central */}
      <div className="animate-fade-up" style={{ 
        textAlign: 'center', 
        padding: '3.5rem 2.5rem', 
        borderRadius: '16px', 
        backgroundColor: 'var(--cor-branco)', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        borderTop: '6px solid var(--cor-roxo-escuro)',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Detalhe visual de fundo do card */}
        <div style={{ 
          position: 'absolute', top: '-40px', right: '-40px', 
          width: '100px', height: '100px', 
          backgroundColor: 'var(--cor-lilas)', opacity: '0.1', 
          borderRadius: '50%', zIndex: 0 
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ 
            color: 'var(--cor-roxo-escuro)', 
            marginBottom: '0.5rem', 
            fontSize: '1.8rem',
            fontWeight: '800'
          }}>
            Acesso Restrito
          </h2>
          
          <p style={{ 
            marginBottom: '2.5rem', 
            color: 'var(--cor-texto-escuro)',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            Painel Administrativo da<br/>
            <b style={{ color: 'var(--cor-rosa)' }}>Vitória Rocha Farma</b>
          </p>
          
          {/* O Botão do Google Profissional */}
          <button 
            onClick={handleLogin}
            className="btn-hover"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 24px', 
              cursor: 'pointer', 
              backgroundColor: '#FFFFFF', 
              color: '#3c4043', 
              border: '1px solid #dadce0', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: '600',
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif', // Fonte clássica do Google
              transition: 'background-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
          >
            {/* Ícone SVG oficial do Google */}
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Logo do Google" 
              style={{ width: '20px', height: '20px' }}
            />
            Continuar com o Google
          </button>

          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#999' }}>
            Acesso permitido apenas para a equipe autorizada.
          </p>
        </div>
      </div>
    </div>
  );
}