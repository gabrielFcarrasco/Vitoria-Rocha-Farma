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
    <div style={{ backgroundColor: 'var(--cor-creme)', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '3rem' }}>
      
      {/* HEADER DO PAINEL */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1rem 5%', backgroundColor: 'var(--cor-roxo-escuro)', color: 'var(--cor-branco)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Painel VR Farma</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--cor-lilas)', display: 'none', '@media (minWidth: 768px)': { display: 'block' } }}>
            Modo Administrador
          </span>
          <button 
            onClick={handleLogout}
            className="btn-hover"
            style={{ 
              padding: '8px 16px', backgroundColor: 'transparent', color: 'var(--cor-branco)', 
              border: '1px solid var(--cor-lilas)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' 
            }}
          >
            Sair 👋
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 5%' }}>
        
        {/* CARD DE BOAS-VINDAS (A mensagem especial) */}
        <div className="animate-fade-up" style={{ 
          backgroundColor: 'var(--cor-branco)', padding: '2.5rem', borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '2.5rem',
          borderLeft: '6px solid var(--cor-rosa)', position: 'relative', overflow: 'hidden'
        }}>
          {/* Elemento decorativo de fundo */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', backgroundColor: 'var(--cor-creme)', borderRadius: '50%', opacity: 0.5 }}></div>
          
          <h1 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2rem', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
            Bem-vinda, Vitória! ✨
          </h1>
          <p style={{ color: 'var(--cor-texto-escuro)', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '700px', position: 'relative', zIndex: 1 }}>
            Aqui será o seu painel de controle exclusivo para gerenciar todo o seu site. 
            Estou preparando tudo com muito carinho e <b>ansioso para dar continuidade</b> e deixar esse sistema perfeito para você!
          </p>
        </div>

        {/* ESTATÍSTICAS RÁPIDAS (Mockup visual) */}
        <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <div className="card-hover" style={{ flex: '1', minWidth: '200px', backgroundColor: 'var(--cor-branco)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>MATERIAIS CADASTRADOS</p>
            <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2rem' }}>5</h3>
          </div>
          <div className="card-hover" style={{ flex: '1', minWidth: '200px', backgroundColor: 'var(--cor-branco)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>DOWNLOADS GRATUITOS</p>
            <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2rem' }}>128</h3>
          </div>
          <div className="card-hover" style={{ flex: '1', minWidth: '200px', backgroundColor: 'var(--cor-branco)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>ACESSOS HOJE</p>
            <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2rem' }}>42</h3>
          </div>
        </div>

        {/* GERENCIADOR DE PRODUTOS */}
        <div className="animate-fade-up delay-2" style={{ backgroundColor: 'var(--cor-branco)', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.5rem' }}>Seus Materiais</h2>
            
            <button className="btn-hover" style={{ 
              backgroundColor: 'var(--cor-rosa)', color: 'var(--cor-branco)', border: 'none', 
              padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>+</span> Novo Material
            </button>
          </div>

          {/* LISTA DE PRODUTOS (Mockup) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Item 1 - Premium */}
            <div className="card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--cor-lilas)', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>PDF</div>
                <div>
                  <h4 style={{ color: 'var(--cor-texto-escuro)', marginBottom: '0.2rem' }}>E-book Sistema Nervoso</h4>
                  <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--cor-roxo-escuro)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Premium - R$ 47,90</span>
                </div>
              </div>
              <button className="btn-hover" style={{ padding: '8px 16px', backgroundColor: 'transparent', color: 'var(--cor-lilas)', border: '2px solid var(--cor-lilas)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Editar
              </button>
            </div>

            {/* Item 2 - Gratuito */}
            <div className="card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--cor-creme)', border: '1px solid var(--cor-lilas)', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--cor-roxo-escuro)', fontWeight: 'bold', fontSize: '0.8rem' }}>PDF</div>
                <div>
                  <h4 style={{ color: 'var(--cor-texto-escuro)', marginBottom: '0.2rem' }}>Transtornos Mentais</h4>
                  <span style={{ fontSize: '0.8rem', backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Isca Gratuita</span>
                </div>
              </div>
              <button className="btn-hover" style={{ padding: '8px 16px', backgroundColor: 'transparent', color: 'var(--cor-lilas)', border: '2px solid var(--cor-lilas)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Editar
              </button>
            </div>

            {/* Item 3 - Premium */}
            <div className="card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--cor-lilas)', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>CRD</div>
                <div>
                  <h4 style={{ color: 'var(--cor-texto-escuro)', marginBottom: '0.2rem' }}>Psicocards (Flashcards)</h4>
                  <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--cor-roxo-escuro)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Premium - R$ 29,90</span>
                </div>
              </div>
              <button className="btn-hover" style={{ padding: '8px 16px', backgroundColor: 'transparent', color: 'var(--cor-lilas)', border: '2px solid var(--cor-lilas)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Editar
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}