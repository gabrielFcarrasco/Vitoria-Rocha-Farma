// src/pages/Home.tsx
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div style={{ backgroundColor: 'var(--cor-creme)', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2.5rem', marginTop: '2rem' }}>
        Vitória Rocha Farma
      </h1>
      <p style={{ marginTop: '1rem', color: 'var(--cor-texto-escuro)', fontSize: '1.2rem' }}>
        Facilite seus estudos com nossos Mapas Mentais.
      </p>
      
      <div style={{ marginTop: '4rem' }}>
        <Link 
          to="/login" 
          style={{ 
            color: 'var(--cor-branco)', 
            backgroundColor: 'var(--cor-rosa)', 
            padding: '12px 24px', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          Acesso da Equipe (Admin) →
        </Link>
      </div>
    </div>
  );
}