// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// Tipagem simples para dizer que esse componente vai "abraçar" outros componentes
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Fica escutando o status do Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se tem usuário logado, vamos conferir se é um de vocês dois
        const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || '';
        const adminEmails = adminEmailsString.split(',');

        if (user.email && adminEmails.includes(user.email)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        // Ninguém logado
        setIsAuthenticated(false);
      }
      
      // Terminou a verificação, pode tirar a tela de loading
      setLoading(false);
    });

    // Limpa o "olheiro" quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  // 1. Enquanto o Firebase pensa, mostra um Loading com a cor da marca
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--cor-creme)' }}>
        <h3 style={{ color: 'var(--cor-roxo-escuro)' }}>Verificando acesso...</h3>
      </div>
    );
  }

  // 2. Se não estiver autenticado (ou não for da equipe), chuta pro login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se deu tudo certo, renderiza a página que ele estava tentando acessar (o Dashboard)
  return <>{children}</>;
}