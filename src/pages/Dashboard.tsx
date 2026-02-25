import { useState, useEffect, ChangeEvent } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { autorService } from '../config/autorService';
import type { AutorInfo } from '../config/autorService';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';

export function Dashboard() {
  const navigate = useNavigate();
  const { uploadImage, loading: uploadLoading } = useCloudinaryUpload();

  // Estados de navegação e layout
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'materiais' | 'sobre'>('visao-geral');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controle do menu no celular

  // Sistema de Notificação (Toast)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message, type }), 4000);
  };

  // Estado do formulário
  const [isSaving, setIsSaving] = useState(false);
  const [autorData, setAutorData] = useState<AutorInfo>({
    nome: '', idade: '', especialidades: [],
    textoIntro: '', textoFormacao: '', textoMissao: '',
    imagemUrl: 'https://gabrielfscarrasco.github.io/Img/IMG-20240223-WA0075.jpg',
    instagramUrl: '', logoUrl: ''
  });

  useEffect(() => {
    const carregarDados = async () => {
      const dadosSalvos = await autorService.getAutorInfo();
      if (dadosSalvos) {
        setAutorData(dadosSalvos);
      }
    };
    carregarDados();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      showToast("Erro ao sair do sistema.", "error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAutorData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'imagemUrl' | 'logoUrl') => {
    if (e.target.files && e.target.files[0]) {
      showToast(`Enviando ${field === 'logoUrl' ? 'logo' : 'imagem'} para a nuvem...`, "info");
      const file = e.target.files[0];
      const urlCloudinary = await uploadImage(file);
      
      if (urlCloudinary) {
        setAutorData(prev => ({ ...prev, [field]: urlCloudinary }));
        showToast(`${field === 'logoUrl' ? 'Logo' : 'Imagem'} enviada! Salve para aplicar.`, "success");
      } else {
        showToast("Erro ao processar o arquivo.", "error");
      }
    }
  };

  const handleSalvarSobreMim = async () => {
    setIsSaving(true);
    const sucesso = await autorService.salvarAutorInfo(autorData);
    setIsSaving(false);
    
    if (sucesso) {
      showToast('Perfil atualizado com sucesso no site oficial!', 'success');
    } else {
      showToast('Falha de conexão. Tente novamente.', 'error');
    }
  };

  const toastColors = { success: '#4CAF50', error: '#e74c3c', info: '#3498db' };

  return (
    <div className="dashboard-container">
      
      {/* CSS EMBUTIDO PARA O LAYOUT PREMIUM */}
      <style>{`
        /* Reset e Base */
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f4f6f9;
          font-family: 'Inter', system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* Sidebar (Menu Lateral) */
        .sidebar {
          width: 260px;
          background-color: var(--cor-roxo-escuro);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          transition: transform 0.3s ease;
          z-index: 1000;
          box-shadow: 4px 0 15px rgba(0,0,0,0.1);
        }
        
        .sidebar-header {
          padding: 2rem 1.5rem;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .sidebar-menu {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .menu-item {
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          text-align: left;
          font-size: 1rem;
        }
        
        .menu-item:hover {
          background-color: rgba(255,255,255,0.05);
          color: white;
        }
        
        .menu-item.active {
          background-color: var(--cor-rosa);
          color: white;
          box-shadow: 0 4px 10px rgba(200,93,161,0.3);
        }

        /* Área de Conteúdo Principal */
        .main-content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }

        /* Topbar (Barra Superior) */
        .topbar {
          background-color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--cor-roxo-escuro);
        }

        /* Conteúdo Interno */
        .content-area {
          padding: 2.5rem;
          flex: 1;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* Cards e Inputs Modernos */
        .glass-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.02);
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border-left: 5px solid var(--cor-lilas);
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-5px); }

        .modern-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid #edf2f7;
          background-color: #f8fafc;
          font-size: 1rem;
          color: #2d3748;
          transition: all 0.3s ease;
          outline: none;
          font-family: inherit;
        }
        .modern-input:focus {
          border-color: var(--cor-lilas);
          background-color: white;
          box-shadow: 0 0 0 4px rgba(162, 136, 171, 0.1);
        }

        /* Animações */
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .toast-enter { animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

        /* Responsividade Mobile */
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .hamburger-btn { display: block; }
          .content-area { padding: 1.5rem; }
          .stat-grid { grid-template-columns: 1fr !important; }
          .profile-grid { flex-direction: column; }
        }
        
        /* Overlay Escuro no Mobile */
        .overlay {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); z-index: 999;
        }
        .overlay.open { display: block; }
      `}</style>

      {/* TOAST NOTIFICATION (Agora centralizado no topo) */}
      {toast.show && (
        <div className="toast-enter" style={{
          position: 'fixed', top: '24px', left: '50%', zIndex: 9999,
          backgroundColor: toastColors[toast.type], color: 'white',
          padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {toast.type === 'success' ? '✨' : toast.type === 'error' ? '⚠️' : '⏳'} 
          {toast.message}
        </div>
      )}

      {/* OVERLAY PARA MOBILE */}
      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* ================= SIDEBAR (MENU LATERAL) ================= */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {autorData.logoUrl ? (
            <img src={autorData.logoUrl} alt="Logo" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>VR FARMA</h2>
          )}
          <span style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginTop: '5px' }}>Workspace</span>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === 'visao-geral' ? 'active' : ''}`} onClick={() => { setActiveTab('visao-geral'); setIsSidebarOpen(false); }}>
            📊 Visão Geral
          </button>
          <button className={`menu-item ${activeTab === 'materiais' ? 'active' : ''}`} onClick={() => { setActiveTab('materiais'); setIsSidebarOpen(false); }}>
            📚 Catálogo
          </button>
          <button className={`menu-item ${activeTab === 'sobre' ? 'active' : ''}`} onClick={() => { setActiveTab('sobre'); setIsSidebarOpen(false); }}>
            🎨 Perfil & Aparência
          </button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="menu-item" style={{ width: '100%', color: '#ff7675', justifyContent: 'center' }}>
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className="main-content">
        
        {/* TOPBAR */}
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--cor-texto-escuro)', fontSize: '0.95rem' }}>{autorData.nome || 'Administrador'}</span>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>Modo Edição</span>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--cor-lilas)' }}>
              <img src={autorData.imagemUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        {/* ÁREA DE RENDERIZAÇÃO DAS ABAS */}
        <div className="content-area">

          {/* ABA: VISÃO GERAL (NOVO!) */}
          {activeTab === 'visao-geral' && (
            <div className="fade-in">
              <h1 style={{ fontSize: '2rem', color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem' }}>Olá, {autorData.nome ? autorData.nome.split(' ')[0] : 'Vitória'}! 👋</h1>
              <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Aqui está o resumo do seu ecossistema digital hoje.</p>
              
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="stat-card" style={{ borderLeftColor: 'var(--cor-lilas)' }}>
                  <div style={{ fontSize: '2.5rem' }}>👀</div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--cor-roxo-escuro)' }}>--</h3>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Visitas na Landing Page</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: 'var(--cor-rosa)' }}>
                  <div style={{ fontSize: '2.5rem' }}>📚</div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--cor-roxo-escuro)' }}>0</h3>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Materiais no Catálogo</p>
                  </div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#f1c40f' }}>
                  <div style={{ fontSize: '2.5rem' }}>⭐</div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--cor-roxo-escuro)' }}>Ativo</h3>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Status do Sistema</p>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '1rem' }}>Próximos Passos recomendados:</h3>
                <ul style={{ color: '#555', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Acesse a aba <strong>Perfil & Aparência</strong> para configurar sua foto oficial e biografia.</li>
                  <li>Prepare as capas dos seus E-books para o futuro cadastro no <strong>Catálogo</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ABA: SOBRE A AUTORA (REFORMULADA) */}
          {activeTab === 'sobre' && (
            <div className="glass-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem', borderBottom: '2px solid #f4f6f9', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Identidade Visual e Textos</h2>
                  <p style={{ color: '#888', margin: 0 }}>Configure como o público enxerga a sua marca no site.</p>
                </div>
                <button 
                  onClick={handleSalvarSobreMim}
                  disabled={isSaving || uploadLoading}
                  className="btn-hover"
                  style={{ padding: '14px 28px', backgroundColor: 'var(--cor-rosa)', color: 'white', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: (isSaving || uploadLoading) ? 'not-allowed' : 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(200,93,161,0.3)' }}
                >
                  {isSaving ? 'Salvando...' : '💾 Salvar e Publicar'}
                </button>
              </div>
              
              <div className="profile-grid" style={{ display: 'flex', gap: '4rem' }}>
                
                {/* Lado Esquerdo: Imagens */}
                <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--cor-texto-escuro)', marginBottom: '1rem' }}>Sua Foto de Perfil</h3>
                    <div style={{ width: '200px', height: '200px', borderRadius: '50%', backgroundColor: '#f8fafc', margin: '0 auto 1.5rem', overflow: 'hidden', border: '6px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', position: 'relative' }}>
                      <img src={autorData.imagemUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploadLoading ? 0.5 : 1 }} />
                    </div>
                    <label className="btn-hover" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--cor-lilas)', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', width: '100%', maxWidth: '200px' }}>
                      {uploadLoading ? 'Enviando...' : '📸 Trocar Foto'}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imagemUrl')} style={{ display: 'none' }} disabled={uploadLoading} />
                    </label>
                  </div>

                  <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--cor-texto-escuro)', marginBottom: '1rem' }}>Logo do Site (Opcional)</h3>
                    {autorData.logoUrl ? (
                      <div style={{ marginBottom: '1rem' }}>
                        <img src={autorData.logoUrl} alt="Logo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
                        <br/>
                        <button onClick={() => setAutorData(prev => ({...prev, logoUrl: ''}))} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>Remover Logo</button>
                      </div>
                    ) : (
                      <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', marginBottom: '1rem', fontSize: '0.9rem' }}>Nenhuma logo aplicada</div>
                    )}
                    <label className="btn-hover" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: 'var(--cor-roxo-escuro)', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                      ⬆️ Subir Logo
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} style={{ display: 'none' }} disabled={uploadLoading} />
                    </label>
                  </div>
                </div>

                {/* Lado Direito: Textos */}
                <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '8px' }}>Nome de Exibição</label>
                      <input className="modern-input" type="text" name="nome" value={autorData.nome || ''} onChange={handleChange} placeholder="Como o público vai te chamar" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '8px' }}>@ do Instagram</label>
                      <input className="modern-input" type="text" name="instagramUrl" value={autorData.instagramUrl || ''} onChange={handleChange} placeholder="Ex: _umafarmaceutica" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '4px' }}>Frase de Impacto</label>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>Sua apresentação principal para atrair o público.</p>
                    <textarea className="modern-input" name="textoIntro" maxLength={150} value={autorData.textoIntro || ''} onChange={handleChange} rows={2} style={{ resize: 'vertical' }} />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoIntro?.length || 0)} / 150</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '4px' }}>Autoridade & Formação</label>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>Mostre por que você é especialista no assunto.</p>
                    <textarea className="modern-input" name="textoFormacao" maxLength={300} value={autorData.textoFormacao || ''} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoFormacao?.length || 0)} / 300</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '4px' }}>Propósito (O Lado Humano)</label>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>Gere conexão emocional com os visitantes do site.</p>
                    <textarea className="modern-input" name="textoMissao" maxLength={350} value={autorData.textoMissao || ''} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoMissao?.length || 0)} / 350</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ABA: MATERIAIS */}
          {activeTab === 'materiais' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2rem', margin: 0 }}>Catálogo de Materiais</h2>
                <button className="btn-hover" style={{ backgroundColor: 'var(--cor-rosa)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 4px 15px rgba(200,93,161,0.3)' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 0 }}>+</span> Adicionar Produto
                </button>
              </div>
              
              <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📦</div>
                <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sua estante está vazia</h3>
                <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                  Quando você cadastrar seus E-books, Mapas Mentais ou Flashcards, eles aparecerão aqui para gerenciamento.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}