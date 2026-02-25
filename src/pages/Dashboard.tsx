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

  const [activeTab, setActiveTab] = useState<'visao-geral' | 'materiais' | 'sobre'>('sobre');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Controle do Modo Foco (Tela Cheia para Textos)
  const [expandedField, setExpandedField] = useState<{ name: keyof AutorInfo, title: string, helper: string, maxLength: number } | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message, type }), 4000);
  };

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

  // NOVA FUNÇÃO: Detecta se é celular e expande ao clicar direto na caixa
  const handleTextareaClick = (fieldData: { name: keyof AutorInfo, title: string, helper: string, maxLength: number }) => {
    if (window.innerWidth <= 768) {
      setExpandedField(fieldData);
    }
  };

  const toastColors = { success: '#4CAF50', error: '#e74c3c', info: '#3498db' };

  return (
    <div className="dashboard-container">
      
      <style>{`
        * { box-sizing: border-box; }

        .dashboard-container {
          display: flex; min-height: 100vh; background-color: #f4f6f9;
          font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; width: 100%;
        }

        .sidebar {
          width: 260px; background-color: var(--cor-roxo-escuro); color: white; display: flex;
          flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0;
          transition: transform 0.3s ease; z-index: 1000; box-shadow: 4px 0 15px rgba(0,0,0,0.1);
        }
        
        .sidebar-header { padding: 2rem 1.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar-menu { flex: 1; padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        
        .menu-item {
          padding: 12px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center;
          gap: 12px; font-weight: 600; color: rgba(255,255,255,0.7); transition: all 0.2s ease;
          border: none; background: transparent; text-align: left; font-size: 1rem;
        }
        .menu-item:hover { background-color: rgba(255,255,255,0.05); color: white; }
        .menu-item.active { background-color: var(--cor-rosa); color: white; box-shadow: 0 4px 10px rgba(200,93,161,0.3); }

        .main-content {
          flex: 1; margin-left: 260px; display: flex; flex-direction: column;
          transition: margin-left 0.3s ease; min-height: 100vh; width: calc(100% - 260px);
        }

        .topbar {
          background-color: white; padding: 1rem 2rem; display: flex; justify-content: space-between;
          align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); position: sticky; top: 0; z-index: 90;
        }

        .hamburger-btn { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--cor-roxo-escuro); }

        .content-area { padding: 2.5rem; flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; }

        .glass-card { background: white; border-radius: 20px; padding: 2.5rem; box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); }

        .stat-card {
          background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          display: flex; align-items: center; gap: 1.5rem; border-left: 5px solid var(--cor-lilas); transition: transform 0.2s;
        }

        .modern-input {
          width: 100%; padding: 14px 16px; border-radius: 12px; border: 2px solid #edf2f7; background-color: #f8fafc;
          font-size: 1rem; color: #2d3748; transition: all 0.3s ease; outline: none; font-family: inherit;
          line-height: 1.6;
        }
        .modern-input:focus { border-color: var(--cor-lilas); background-color: white; box-shadow: 0 0 0 4px rgba(162, 136, 171, 0.1); }

        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .toast-enter { animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

        .btn-expand {
          background: #f1f5f9; border: none; color: var(--cor-roxo-escuro); padding: 4px 10px;
          border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s;
        }
        .btn-expand:hover { background: #e2e8f0; }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; width: 100vw; max-width: 100vw; overflow-x: hidden; }
          .hamburger-btn { display: block; }
          .topbar { padding: 1rem; }
          .content-area { padding: 1.2rem; width: 100%; overflow-x: hidden; }
          
          .glass-card { padding: 1.5rem; border-radius: 16px; }
          .stat-grid { grid-template-columns: 1fr !important; }
          .profile-grid { flex-direction: column; gap: 2rem !important; }
          .mobile-full-width { min-width: 100% !important; width: 100% !important; }
          .input-grid { grid-template-columns: 1fr !important; }
          .btn-mobile-full { width: 100%; justify-content: center; margin-top: 0.5rem; }
          
          textarea.modern-input { min-height: 120px !important; }
        }
        
        .overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; }
        .overlay.open { display: block; }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="toast-enter" style={{ position: 'fixed', top: '24px', left: '50%', zIndex: 9999, backgroundColor: toastColors[toast.type], color: 'white', padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px', width: 'max-content', maxWidth: '90vw' }}>
          {toast.type === 'success' ? '✨' : toast.type === 'error' ? '⚠️' : '⏳'} {toast.message}
        </div>
      )}

      {/* MODAL DE TELA CHEIA PARA TEXTOS */}
      {expandedField && (
        <div className="slide-up" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--cor-roxo-escuro)', fontSize: '1.3rem' }}>{expandedField.title}</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>{expandedField.helper}</p>
            </div>
            <button onClick={() => setExpandedField(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#888', cursor: 'pointer', padding: '10px' }}>✖</button>
          </div>
          <textarea
            autoFocus
            value={autorData[expandedField.name] as string || ''}
            onChange={handleChange}
            name={expandedField.name}
            maxLength={expandedField.maxLength}
            placeholder="Comece a digitar aqui..."
            style={{ flex: 1, padding: '1.5rem', fontSize: '1.15rem', border: 'none', outline: 'none', resize: 'none', lineHeight: '1.7', color: 'var(--cor-texto-escuro)', fontFamily: 'inherit' }}
          />
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <span style={{ color: (autorData[expandedField.name]?.length || 0) >= expandedField.maxLength ? '#e74c3c' : '#888', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {(autorData[expandedField.name]?.length || 0)} / {expandedField.maxLength}
            </span>
            <button onClick={() => setExpandedField(null)} style={{ backgroundColor: 'var(--cor-rosa)', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              Concluído
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY PARA MOBILE */}
      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* SIDEBAR */}
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
          <button className={`menu-item ${activeTab === 'visao-geral' ? 'active' : ''}`} onClick={() => { setActiveTab('visao-geral'); setIsSidebarOpen(false); }}>📊 Visão Geral</button>
          <button className={`menu-item ${activeTab === 'materiais' ? 'active' : ''}`} onClick={() => { setActiveTab('materiais'); setIsSidebarOpen(false); }}>📚 Catálogo</button>
          <button className={`menu-item ${activeTab === 'sobre' ? 'active' : ''}`} onClick={() => { setActiveTab('sobre'); setIsSidebarOpen(false); }}>🎨 Perfil & Aparência</button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="menu-item" style={{ width: '100%', color: '#ff7675', justifyContent: 'center' }}>Sair do Sistema</button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
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

        {/* ÁREA DE RENDERIZAÇÃO */}
        <div className="content-area">

          {/* ABA: VISÃO GERAL */}
          {activeTab === 'visao-geral' && (
            <div className="fade-in">
              <h1 className="page-title" style={{ fontSize: '2rem', color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem' }}>Olá, {autorData.nome ? autorData.nome.split(' ')[0] : 'Vitória'}! 👋</h1>
              <p style={{ color: '#666', fontSize: '1rem', marginBottom: '2.5rem' }}>Aqui está o resumo do seu ecossistema digital.</p>
              
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

              <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
                <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '1rem', fontSize: '1.2rem' }}>Próximos Passos recomendados:</h3>
                <ul style={{ color: '#555', lineHeight: '1.8', paddingLeft: '20px', fontSize: '0.95rem' }}>
                  <li>Acesse a aba <strong>Perfil & Aparência</strong> para configurar sua foto oficial e biografia.</li>
                  <li>Prepare as capas dos seus E-books para o futuro cadastro no <strong>Catálogo</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ABA: SOBRE A AUTORA */}
          {activeTab === 'sobre' && (
            <div className="glass-card fade-in">
              <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '2px solid #f4f6f9', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 className="page-title" style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Identidade Visual</h2>
                  <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Configure como o público enxerga a sua marca.</p>
                </div>
                <button onClick={handleSalvarSobreMim} disabled={isSaving || uploadLoading} className="btn-hover btn-mobile-full" style={{ padding: '14px 28px', backgroundColor: 'var(--cor-rosa)', color: 'white', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: (isSaving || uploadLoading) ? 'not-allowed' : 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(200,93,161,0.3)' }}>
                  {isSaving ? 'Salvando...' : '💾 Salvar e Publicar'}
                </button>
              </div>
              
              <div className="profile-grid" style={{ display: 'flex', gap: '3rem' }}>
                
                {/* Lado Esquerdo: Imagens */}
                <div className="mobile-full-width" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--cor-texto-escuro)', marginBottom: '1rem' }}>Sua Foto de Perfil</h3>
                    <div style={{ width: '180px', height: '180px', borderRadius: '50%', backgroundColor: '#f8fafc', margin: '0 auto 1.2rem', overflow: 'hidden', border: '6px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', position: 'relative' }}>
                      <img src={autorData.imagemUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploadLoading ? 0.5 : 1 }} />
                    </div>
                    <label className="btn-hover" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--cor-lilas)', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', width: '100%', maxWidth: '200px' }}>
                      {uploadLoading ? 'Enviando...' : '📸 Trocar Foto'}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imagemUrl')} style={{ display: 'none' }} disabled={uploadLoading} />
                    </label>
                  </div>

                  <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--cor-texto-escuro)', marginBottom: '1rem' }}>Logo do Site (Opcional)</h3>
                    {autorData.logoUrl ? (
                      <div style={{ marginBottom: '1rem' }}>
                        <img src={autorData.logoUrl} alt="Logo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
                        <br/><button onClick={() => setAutorData(prev => ({...prev, logoUrl: ''}))} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>Remover Logo</button>
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
                <div className="mobile-full-width" style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="input-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '8px', fontSize: '0.95rem' }}>Nome de Exibição</label>
                      <input className="modern-input" type="text" name="nome" value={autorData.nome || ''} onChange={handleChange} placeholder="Como o público vai te chamar" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '8px', fontSize: '0.95rem' }}>@ do Instagram</label>
                      <input className="modern-input" type="text" name="instagramUrl" value={autorData.instagramUrl || ''} onChange={handleChange} placeholder="Ex: _umafarmaceutica" />
                    </div>
                  </div>

                  {/* CAIXA 1 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                      <label style={{ fontWeight: '700', color: 'var(--cor-roxo-escuro)', fontSize: '0.95rem' }}>Frase de Impacto</label>
                      <button onClick={() => setExpandedField({ name: 'textoIntro', title: 'Frase de Impacto', helper: 'A sua vitrine. Escreva uma frase curta e poderosa que mostre como você transforma a vida ou os estudos do seu público.', maxLength: 150 })} className="btn-expand">⤢ Expandir</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', lineHeight: '1.4' }}>
                      A sua vitrine. Escreva uma frase curta e poderosa que mostre como você transforma a vida ou os estudos do seu público.
                    </p>
                    <textarea 
                      className="modern-input" 
                      name="textoIntro" 
                      maxLength={150} 
                      value={autorData.textoIntro || ''} 
                      onChange={handleChange}
                      onClick={() => handleTextareaClick({ name: 'textoIntro', title: 'Frase de Impacto', helper: 'A sua vitrine. Escreva uma frase curta e poderosa que mostre como você transforma a vida ou os estudos do seu público.', maxLength: 150 })}
                      rows={3} 
                      style={{ resize: 'vertical' }} 
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoIntro?.length || 0)} / 150</div>
                  </div>

                  {/* CAIXA 2 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                      <label style={{ fontWeight: '700', color: 'var(--cor-roxo-escuro)', fontSize: '0.95rem' }}>Autoridade & Formação</label>
                      <button onClick={() => setExpandedField({ name: 'textoFormacao', title: 'Autoridade & Formação', helper: 'O seu crachá de credibilidade. Destaque suas especializações e conquistas para que os alunos tenham total segurança no seu domínio técnico.', maxLength: 300 })} className="btn-expand">⤢ Expandir</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', lineHeight: '1.4' }}>
                      O seu crachá de credibilidade. Destaque suas especializações e conquistas para que os alunos tenham total segurança no seu domínio técnico.
                    </p>
                    <textarea 
                      className="modern-input" 
                      name="textoFormacao" 
                      maxLength={300} 
                      value={autorData.textoFormacao || ''} 
                      onChange={handleChange} 
                      onClick={() => handleTextareaClick({ name: 'textoFormacao', title: 'Autoridade & Formação', helper: 'O seu crachá de credibilidade. Destaque suas especializações e conquistas para que os alunos tenham total segurança no seu domínio técnico.', maxLength: 300 })}
                      rows={4} 
                      style={{ resize: 'vertical' }} 
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoFormacao?.length || 0)} / 300</div>
                  </div>

                  {/* CAIXA 3 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                      <label style={{ fontWeight: '700', color: 'var(--cor-roxo-escuro)', fontSize: '0.95rem' }}>Propósito (Lado Humano)</label>
                      <button onClick={() => setExpandedField({ name: 'textoMissao', title: 'Propósito (Lado Humano)', helper: 'A sua essência. Compartilhe o que move o seu coração, seus valores e sua missão. É aqui que os visitantes se conectam de verdade com você.', maxLength: 350 })} className="btn-expand">⤢ Expandir</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', lineHeight: '1.4' }}>
                      A sua essência. Compartilhe o que move o seu coração, seus valores e sua missão. É aqui que os visitantes se conectam de verdade com você.
                    </p>
                    <textarea 
                      className="modern-input" 
                      name="textoMissao" 
                      maxLength={350} 
                      value={autorData.textoMissao || ''} 
                      onChange={handleChange} 
                      onClick={() => handleTextareaClick({ name: 'textoMissao', title: 'Propósito (Lado Humano)', helper: 'A sua essência. Compartilhe o que move o seu coração, seus valores e sua missão. É aqui que os visitantes se conectam de verdade com você.', maxLength: 350 })}
                      rows={4} 
                      style={{ resize: 'vertical' }} 
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoMissao?.length || 0)} / 350</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ABA: MATERIAIS */}
          {activeTab === 'materiais' && (
            <div className="fade-in">
              <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <h2 className="page-title" style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2rem', margin: 0 }}>Catálogo de Materiais</h2>
                <button className="btn-hover btn-mobile-full" style={{ backgroundColor: 'var(--cor-rosa)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 4px 15px rgba(200,93,161,0.3)' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 0 }}>+</span> Adicionar Produto
                </button>
              </div>
              
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: '1.5rem', color: 'var(--cor-roxo-escuro)' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>Sua estante está vazia</h3>
                <p style={{ color: '#888', fontSize: '1rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                  Quando você cadastrar seus E-books, Mapas Mentais ou Flashcards, eles aparecerão aqui.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}