// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  // null = ainda está carregando a resposta do Firebase
  // true = logado e autorizado
  // false = não logado ou não autorizado
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    // O Firebase avisa sempre que o estado de login muda
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        // Verifica novamente se o e-mail está na lista do .env (segurança dupla)
        const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || '';
        const adminEmails = adminEmailsString.split(',');
        
        if (adminEmails.includes(user.email)) {
          setIsAuth(true); // Autorizado!
        } else {
          setIsAuth(false); // Logou com conta errada
        }
      } else {
        setIsAuth(false); // Nem está logado
      }
    });

    // Limpa o "espião" do Firebase quando saímos da tela
    return () => unsubscribe();
  }, []);

  // Enquanto o Firebase pensa, mostramos uma tela de carregamento elegante
  if (isAuth === null) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--cor-creme)' }}>
        <h3 style={{ color: 'var(--cor-roxo-escuro)' }}>Verificando credenciais...</h3>
      </div>
    );
  }

  // Se estiver autorizado, renderiza o Dashboard (children). Se não, manda pro Login.
  return isAuth ? children : <Navigate to="/login" replace />;
}