// src/pages/Dashboard.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { autorService } from '../config/autorService';
import type { AutorInfo } from '../config/autorService';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';

import versiculosData from '../data/versiculos.json';
import dicasData from '../data/dicas.json';

// --- TIPAGENS PARA OS PRODUTOS E HOTSPOTS ---
type HotspotStyle = 'target' | 'dot' | 'number';
type Hotspot = { id: string; x: number; y: number; title: string; description: string; style: HotspotStyle; color: string };
type ProdImage = { id: string; file?: File; previewUrl: string; hotspots: Hotspot[] };

export function Dashboard() {
  const navigate = useNavigate();
  const { uploadImage, loading: uploadLoading } = useCloudinaryUpload();

  const [activeTab, setActiveTab] = useState<'visao-geral' | 'materiais' | 'sobre'>('visao-geral');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modo Foco (Tela Cheia para Textos do Perfil)
  const [expandedField, setExpandedField] = useState<{ name: keyof AutorInfo, title: string, helper: string, maxLength: number } | null>(null);

  // --- CONTROLES DO MODAL DE PRODUTO WIZARD ---
  const [isProdutoModalOpen, setIsProdutoModalOpen] = useState(false);
  const [produtoStep, setProdutoStep] = useState(1);
  const [isGratuito, setIsGratuito] = useState(false);

  // Listas Dinâmicas (Matérias e Formatos)
  const [materias, setMaterias] = useState(['Farmacologia Clínica', 'Sistema Nervoso', 'Saúde Mental', 'Legislação']);
  const [formatos, setFormatos] = useState(['E-book (PDF)', 'Flashcards / Psicocards', 'Resumo / Mapa Mental']);
  const [showNovaMateria, setShowNovaMateria] = useState(false);
  const [novaMateriaText, setNovaMateriaText] = useState('');
  const [showNovoFormato, setShowNovoFormato] = useState(false);
  const [novoFormatoText, setNovoFormatoText] = useState('');
  
  // Imagens e Hotspots do Produto
  const [prodImages, setProdImages] = useState<ProdImage[]>([]);
  const [activeHotspotInput, setActiveHotspotInput] = useState<{ imageId: string, hotspotId: string } | null>(null);

  // Estúdio de Edição em Tela Cheia
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [markerStyle, setMarkerStyle] = useState<HotspotStyle>('target');
  const [markerColor, setMarkerColor] = useState<string>('#c85da1'); // Rosa padrão
  const [coresDisponiveis, setCoresDisponiveis] = useState<string[]>(['#c85da1', '#422850', '#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#ffffff', '#000000']);

  // --- CARROSSEL AUTOMÁTICO: VERSÍCULOS E DICAS ---
  const [verseIndex, setVerseIndex] = useState(Math.floor(Math.random() * versiculosData.length));
  const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * dicasData.length));

  // Roda automaticamente a cada 1 minuto (60000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setVerseIndex(prev => (prev + 1) % versiculosData.length);
      setTipIndex(prev => (prev + 1) % dicasData.length);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const nextVerse = () => setVerseIndex(prev => (prev + 1) % versiculosData.length);
  const nextTip = () => setTipIndex(prev => (prev + 1) % dicasData.length);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message, type }), 4000);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [autorData, setAutorData] = useState<AutorInfo>({
    nome: '', idade: '', especialidades: [], textoIntro: '', textoFormacao: '', textoMissao: '',
    imagemUrl: 'https://gabrielfscarrasco.github.io/Img/IMG-20240223-WA0075.jpg', instagramUrl: '', logoUrl: ''
  });

  useEffect(() => {
    const carregarDados = async () => { const dadosSalvos = await autorService.getAutorInfo(); if (dadosSalvos) setAutorData(dadosSalvos); };
    carregarDados();
  }, []);

  const handleLogout = async () => { try { await signOut(auth); navigate('/login'); } catch (error) { showToast("Erro ao sair.", "error"); } };

  // --- FUNÇÕES DA ABA PERFIL E TEXTOS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setAutorData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleTextareaClick = (fieldData: { name: keyof AutorInfo, title: string, helper: string, maxLength: number }) => { if (window.innerWidth <= 768) setExpandedField(fieldData); };
  
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'imagemUrl' | 'logoUrl') => {
    if (e.target.files && e.target.files[0]) {
      showToast(`Enviando ${field === 'logoUrl' ? 'logo' : 'a sua foto'} para a nuvem...`, "info");
      const urlCloudinary = await uploadImage(e.target.files[0]);
      
      if (urlCloudinary) { 
        setAutorData(prev => ({ ...prev, [field]: urlCloudinary })); 
        
        // O Easter Egg da foto de perfil!
        if (field === 'imagemUrl') {
          showToast("Foto carregada! E nossa, como você é linda! 😍 Salve para aplicar.", "success");
        } else {
          showToast("Logo enviada com sucesso! Salve para aplicar.", "success");
        }
      } 
      else {
        showToast("Ocorreu um erro no envio.", "error");
      }
    }
  };
  
  const handleSalvarSobreMim = async () => {
    setIsSaving(true); const sucesso = await autorService.salvarAutorInfo(autorData); setIsSaving(false);
    if (sucesso) showToast('Tudo salvo perfeitamente, amor! 🤍', 'success'); 
    else showToast('Erro de conexão.', 'error');
  };

  // --- FUNÇÕES DAS LISTAS DINÂMICAS ---
  const handleAddMateria = () => { if (novaMateriaText.trim()) { setMaterias(prev => [...prev, novaMateriaText.trim()]); setShowNovaMateria(false); setNovaMateriaText(''); } };
  const handleAddFormato = () => { if (novoFormatoText.trim()) { setFormatos(prev => [...prev, novoFormatoText.trim()]); setShowNovoFormato(false); setNovoFormatoText(''); } };

 // --- FUNÇÕES PARA O SELETOR DE CORES ---
  // 1. Muda a cor em tempo real no marcador (enquanto arrasta o mouse)
  const handleColorPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarkerColor(e.target.value);
  };

  // 2. Salva a cor final na paleta apenas quando ela fecha o seletor (onBlur)
  const handleColorSave = () => {
    setCoresDisponiveis(prev => {
       if (!prev.includes(markerColor)) { return [...prev, markerColor]; }
       return prev;
    });
  };

  // 3. Permite digitar o código Hexadecimal manualmente com '#' fixo
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pega o que foi digitado, remove qualquer coisa que não seja letra de A-F ou número, e limita a 6 caracteres
    const val = e.target.value.replace(/[^0-9A-Fa-f]/gi, '').slice(0, 6);
    setMarkerColor('#' + val);
  };

  // --- FUNÇÕES DAS IMAGENS E HOTSPOTS ---
  const handleAddProductImages = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({ id: Date.now().toString() + Math.random().toString(), file, previewUrl: URL.createObjectURL(file), hotspots: [] }));
      setProdImages(prev => [...prev, ...newImages]);
    }
  };
  
  const removeProductImage = (id: string) => setProdImages(prev => prev.filter(img => img.id !== id));

  const handleImageClickForHotspot = (e: React.MouseEvent<HTMLDivElement>, imageId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = { id: Date.now().toString(), x, y, title: '', description: '', style: markerStyle, color: markerColor };
    
    setProdImages(prev => prev.map(img => img.id === imageId ? { ...img, hotspots: [...img.hotspots, newHotspot] } : img));
    setActiveHotspotInput({ imageId, hotspotId: newHotspot.id });
  };

  const updateHotspotData = (field: 'title' | 'description', value: string) => {
    if (!activeHotspotInput) return;
    setProdImages(prev => prev.map(img => {
      if (img.id === activeHotspotInput.imageId) {
        return { ...img, hotspots: img.hotspots.map(hs => hs.id === activeHotspotInput.hotspotId ? { ...hs, [field]: value } : hs) };
      }
      return img;
    }));
  };

  const removeHotspot = (imageId: string, hotspotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); setProdImages(prev => prev.map(img => img.id === imageId ? { ...img, hotspots: img.hotspots.filter(hs => hs.id !== hotspotId) } : img));
  };

  const toastColors = { success: '#4CAF50', error: '#e74c3c', info: '#3498db' };

  // --- LÓGICA DE SAUDAÇÃO BASEADA NO HORÁRIO ---
  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Bom dia';
    if (hora >= 12 && hora < 19) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="dashboard-container">
      
      <style>{`
        * { box-sizing: border-box; }
        .dashboard-container { display: flex; min-height: 100vh; background-color: #f4f6f9; font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; width: 100%; }
        .sidebar { width: 260px; background-color: var(--cor-roxo-escuro); color: white; display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0; transition: transform 0.3s ease; z-index: 1000; box-shadow: 4px 0 15px rgba(0,0,0,0.1); }
        .sidebar-header { padding: 2rem 1.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar-menu { flex: 1; padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .menu-item { padding: 12px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 600; color: rgba(255,255,255,0.7); transition: all 0.2s ease; border: none; background: transparent; text-align: left; font-size: 1rem; }
        .menu-item:hover { background-color: rgba(255,255,255,0.05); color: white; }
        .menu-item.active { background-color: var(--cor-rosa); color: white; box-shadow: 0 4px 10px rgba(200,93,161,0.3); }
        .main-content { flex: 1; margin-left: 260px; display: flex; flex-direction: column; transition: margin-left 0.3s ease; min-height: 100vh; width: calc(100% - 260px); }
        .topbar { background-color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); position: sticky; top: 0; z-index: 90; }
        .hamburger-btn { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--cor-roxo-escuro); }
        .content-area { padding: 2.5rem; flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; }
        .glass-card { background: white; border-radius: 20px; padding: 2.5rem; box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); }
        .stat-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 1.5rem; border-left: 5px solid var(--cor-lilas); transition: transform 0.2s; }
        .modern-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 2px solid #edf2f7; background-color: #f8fafc; font-size: 1rem; color: #2d3748; transition: all 0.3s ease; outline: none; font-family: inherit; line-height: 1.6; }
        .modern-input:focus { border-color: var(--cor-lilas); background-color: white; box-shadow: 0 0 0 4px rgba(162, 136, 171, 0.1); }
        select.modern-input { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
        /* ANIMAÇÃO DE DESLIZE (SWIPE) PARA O CARROSSEL */
        .swipe-slide { animation: swipeLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        @keyframes swipeLeft {
          0% { transform: translateX(30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .carousel-nav-btn { background: rgba(255,255,255,0.2); border: none; color: inherit; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; }
        .carousel-nav-btn:hover { background: rgba(255,255,255,0.4); }
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .toast-enter { animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .btn-expand { background: #f1f5f9; border: none; color: var(--cor-roxo-escuro); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .btn-expand:hover { background: #e2e8f0; }

        /* CARTÃO DE VERSÍCULO */
        .verse-card { background: linear-gradient(135deg, var(--cor-roxo-escuro), var(--cor-lilas)); color: white; padding: 2rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(66, 40, 80, 0.15); margin-bottom: 2.5rem; position: relative; overflow: hidden; }
        .verse-quote { font-size: 1.15rem; font-style: italic; line-height: 1.6; margin-bottom: 1rem; position: relative; z-index: 2; font-weight: 300; }
        .verse-ref { font-size: 0.9rem; font-weight: bold; opacity: 0.9; text-align: right; z-index: 2; position: relative; }
        .verse-bg-icon { position: absolute; top: -20px; right: -20px; font-size: 8rem; opacity: 0.05; transform: rotate(15deg); z-index: 1; pointer-events: none; }

        /* WIZARD MODAL */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 1rem; animation: fadeIn 0.3s; }
        .modal-content { background: white; width: 100%; max-width: 700px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
        .step-indicator { display: flex; justify-content: space-between; position: relative; margin-bottom: 2rem; }
        .step-indicator::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 3px; background: #edf2f7; z-index: 1; transform: translateY(-50%); }
        .step-dot { width: 35px; height: 35px; border-radius: 50%; background: white; border: 3px solid #edf2f7; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #a0aec0; z-index: 2; transition: all 0.3s; }
        .step-dot.active { border-color: var(--cor-rosa); background: var(--cor-rosa); color: white; box-shadow: 0 0 0 5px rgba(200,93,161,0.2); }
        .step-dot.completed { border-color: var(--cor-lilas); background: var(--cor-lilas); color: white; }

        /* ESTÚDIO DE EDIÇÃO FULLSCREEN & HOTSPOTS */
        .fullscreen-studio { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #e2e8f0; z-index: 99999; display: flex; flex-direction: column; }
        .studio-toolbar { background: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); z-index: 10; flex-wrap: wrap; gap: 1rem; }
        .studio-canvas { flex: 1; overflow: auto; padding: 3rem; display: flex; justify-content: center; align-items: flex-start; }
        
        .hotspot-wrapper { position: relative; display: inline-block; cursor: crosshair; box-shadow: 0 10px 40px rgba(0,0,0,0.2); border-radius: 8px; }
        .hotspot-img { display: block; max-width: 100%; height: auto; border-radius: 8px; }
        
        .hotspot-marker { position: absolute; transform: translate(-50%, -50%); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: transform 0.2s; }
        .hotspot-marker:hover { transform: translate(-50%, -50%) scale(1.15); z-index: 20; }
        .hotspot-pulse { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%; animation: pulse 1.5s infinite; z-index: -1; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
        
        .hotspot-tooltip { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); background: white; padding: 16px; border-radius: 12px; width: 260px; pointer-events: none; opacity: 0; transition: all 0.3s ease; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid #edf2f7; text-align: left; z-index: 30; }
        .hotspot-marker:hover .hotspot-tooltip { opacity: 1; bottom: 45px; pointer-events: auto; }
        .hotspot-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; margin-left: -8px; border-width: 8px; border-style: solid; border-color: white transparent transparent transparent; }

        .style-btn { padding: 8px 16px; border-radius: 8px; border: 2px solid #edf2f7; background: white; cursor: pointer; font-weight: bold; color: #555; transition: 0.2s; }
        .style-btn.active { border-color: var(--cor-rosa); color: var(--cor-rosa); background: #fff0f7; }
        
        .color-btn { width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: 0.2s; }
        .color-btn.active { transform: scale(1.2); outline: 2px solid var(--cor-roxo-escuro); }
        .color-picker-btn { width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: 0.2s; position: relative; overflow: hidden; }
        .color-picker-btn:hover { transform: scale(1.1); }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; width: 100vw; max-width: 100vw; overflow-x: hidden; }
          .hamburger-btn { display: block; }
          .topbar { padding: 1rem; }
          .content-area { padding: 1.2rem; width: 100%; overflow-x: hidden; }
          .glass-card { padding: 1.5rem; border-radius: 16px; }
          .mobile-full-width { min-width: 100% !important; width: 100% !important; }
          .input-grid { grid-template-columns: 1fr !important; }
          .btn-mobile-full { width: 100%; justify-content: center; margin-top: 0.5rem; }
          textarea.modern-input { min-height: 120px !important; }
          .modal-content { max-height: 95vh; border-radius: 16px; }
          .studio-toolbar { flex-direction: column; align-items: stretch; padding: 1rem; gap: 1rem; }
          .studio-canvas { padding: 1rem; }
        }
        .overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 998; }
        .overlay.open { display: block; }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="toast-enter" style={{ position: 'fixed', top: '24px', left: '50%', zIndex: 999999, backgroundColor: toastColors[toast.type], color: 'white', padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {toast.type === 'success' ? '✨' : toast.type === 'error' ? '⚠️' : '⏳'} {toast.message}
        </div>
      )}

      {/* ================= ESTÚDIO DE EDIÇÃO FULLSCREEN ================= */}
      {editingImageId && (
        <div className="fullscreen-studio fade-in">
          
          {/* BARRA DE FERRAMENTAS */}
          <div className="studio-toolbar">
            <div>
              <h3 style={{ margin: 0, color: 'var(--cor-roxo-escuro)', fontSize: '1.2rem' }}>🎨 Estúdio Interativo</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Configure o marcador e toque na imagem.</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Estilos */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={`style-btn ${markerStyle === 'target' ? 'active' : ''}`} onClick={() => setMarkerStyle('target')}>🎯 Alvo</button>
                <button className={`style-btn ${markerStyle === 'dot' ? 'active' : ''}`} onClick={() => setMarkerStyle('dot')}>🟢 Lisa</button>
                <button className={`style-btn ${markerStyle === 'number' ? 'active' : ''}`} onClick={() => setMarkerStyle('number')}>🔢 Números</button>
              </div>

              {/* Cores e Seletor Novo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '1rem', borderLeft: '2px solid #eee' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '180px' }}>
                  {coresDisponiveis.map(cor => (
                    <button key={cor} className={`color-btn ${markerColor === cor ? 'active' : ''}`} style={{ backgroundColor: cor }} onClick={() => setMarkerColor(cor)} title={cor} />
                  ))}
                </div>

                {/* Botão de Nova Cor + Barra de HEX Customizada */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  
                  {/* Botão que abre a paleta do sistema (para quem gosta de arrastar) */}
                  <label className="color-picker-btn" style={{ backgroundColor: markerColor, cursor: 'pointer', margin: '0 auto' }} title="Escolher cor na paleta">
                    <span style={{ mixBlendMode: 'difference', color: 'white', fontSize: '1.4rem', fontWeight: '300', lineHeight: 0, paddingBottom: '4px' }}>+</span>
                    <input type="color" value={markerColor} onChange={handleColorPreview} onBlur={handleColorSave} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                  </label>

                  {/* A NOVA BARRA DE PESQUISA COM '#' FIXO */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '2px solid #edf2f7', borderRadius: '8px', overflow: 'hidden', width: '90px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ padding: '4px 0 4px 8px', color: '#a0aec0', fontWeight: 'bold', fontSize: '0.85rem', fontFamily: 'monospace' }}>#</span>
                    <input 
                      type="text" 
                      value={markerColor.replace('#', '')} 
                      onChange={handleHexInputChange}
                      onBlur={handleColorSave}
                      placeholder="FFFFFF"
                      title="Digite ou cole o HEX da cor"
                      style={{ width: '100%', border: 'none', outline: 'none', padding: '6px 8px 6px 2px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                  </div>

                </div>
              </div>
            </div>

            <button onClick={() => setEditingImageId(null)} className="btn-hover" style={{ padding: '10px 24px', backgroundColor: 'var(--cor-rosa)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              Salvar Imagem
            </button>
          </div>

          {/* ÁREA DE DESENHO (SCROLLÁVEL) */}
          <div className="studio-canvas">
            {prodImages.filter(img => img.id === editingImageId).map(img => (
              <div key={img.id} className="hotspot-wrapper" onClick={(e) => handleImageClickForHotspot(e, img.id)}>
                <img src={img.previewUrl} alt="Estúdio" className="hotspot-img" />
                
                {/* RENDERIZAR OS HOTSPOTS */}
                {img.hotspots.map((hs, index) => (
                  <div key={hs.id} className="hotspot-marker" style={{ left: `${hs.x}%`, top: `${hs.y}%`, width: hs.style === 'target' ? '30px' : '26px', height: hs.style === 'target' ? '30px' : '26px' }}>
                    
                    {/* Estilos */}
                    {hs.style === 'target' && (
                      <><div className="hotspot-pulse" style={{ backgroundColor: hs.color }}></div><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={hs.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg></>
                    )}
                    {hs.style === 'dot' && (
                      <><div className="hotspot-pulse" style={{ backgroundColor: hs.color }}></div><div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: hs.color, border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}></div></>
                    )}
                    {hs.style === 'number' && (
                      <><div className="hotspot-pulse" style={{ backgroundColor: hs.color }}></div><div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: hs.color, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}><span style={{ color: hs.color === '#ffffff' ? '#000' : 'white', fontWeight: '900', fontSize: '13px' }}>{index + 1}</span></div></>
                    )}

                    {/* TOOLTIP */}
                    <div className="hotspot-tooltip">
                      <div style={{ fontWeight: '900', color: 'var(--cor-roxo-escuro)', fontSize: '1rem', marginBottom: '6px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>{hs.title || 'Sem título'}</div>
                      <div style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{hs.description || 'Nenhuma explicação adicionada.'}</div>
                    </div>

                    <button onClick={(e) => removeHotspot(img.id, hs.id, e)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '12px', color: '#e74c3c', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 40 }}>✖</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL DE PRODUTO WIZARD ================= */}
      {!editingImageId && isProdutoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content slide-up">
            <div style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--cor-roxo-escuro)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Cadastrar Novo Material</h2>
              <button onClick={() => { setIsProdutoModalOpen(false); setProdutoStep(1); setProdImages([]); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}>✖</button>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              <div className="step-indicator">
                <div className={`step-dot ${produtoStep >= 1 ? (produtoStep === 1 ? 'active' : 'completed') : ''}`}>1</div>
                <div className={`step-dot ${produtoStep >= 2 ? (produtoStep === 2 ? 'active' : 'completed') : ''}`}>2</div>
                <div className={`step-dot ${produtoStep >= 3 ? (produtoStep === 3 ? 'active' : 'completed') : ''}`}>3</div>
              </div>

              {/* PASSO 1: INFORMAÇÕES BÁSICAS COM LISTAS DINÂMICAS */}
              {produtoStep === 1 && (
                <div className="fade-in">
                  <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>O que você está criando?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--cor-roxo-escuro)', marginBottom: '8px' }}>Nome do Material</label>
                      <input type="text" className="modern-input" placeholder="Ex: Guia Prático de Antibióticos" />
                    </div>

                    <div className="input-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {/* Coluna Matéria */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                          <label style={{ fontWeight: 'bold', color: 'var(--cor-roxo-escuro)' }}>Matéria</label>
                          <button onClick={() => setShowNovaMateria(!showNovaMateria)} style={{ background: 'none', border: 'none', color: 'var(--cor-rosa)', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>{showNovaMateria ? 'Cancelar' : '+ Nova'}</button>
                        </div>
                        {showNovaMateria ? (
                          <div className="fade-in" style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" className="modern-input" placeholder="Ex: Pediatria" value={novaMateriaText} onChange={(e) => setNovaMateriaText(e.target.value)} autoFocus style={{ padding: '10px' }} />
                            <button onClick={handleAddMateria} style={{ backgroundColor: 'var(--cor-lilas)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}>OK</button>
                          </div>
                        ) : (
                          <select className="modern-input">
                            <option value="">Selecione...</option>
                            {materias.map((mat, idx) => <option key={idx} value={mat}>{mat}</option>)}
                          </select>
                        )}
                      </div>

                      {/* Coluna Formato */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                          <label style={{ fontWeight: 'bold', color: 'var(--cor-roxo-escuro)' }}>Formato</label>
                          <button onClick={() => setShowNovoFormato(!showNovoFormato)} style={{ background: 'none', border: 'none', color: 'var(--cor-rosa)', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>{showNovoFormato ? 'Cancelar' : '+ Novo'}</button>
                        </div>
                        {showNovoFormato ? (
                          <div className="fade-in" style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" className="modern-input" placeholder="Ex: Tabela Excel" value={novoFormatoText} onChange={(e) => setNovoFormatoText(e.target.value)} autoFocus style={{ padding: '10px' }} />
                            <button onClick={handleAddFormato} style={{ backgroundColor: 'var(--cor-lilas)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}>OK</button>
                          </div>
                        ) : (
                          <select className="modern-input">
                            <option value="">Selecione...</option>
                            {formatos.map((form, idx) => <option key={idx} value={form}>{form}</option>)}
                          </select>
                        )}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--cor-roxo-escuro)', marginBottom: '8px' }}>Descrição Curta</label>
                      <textarea className="modern-input" rows={3} placeholder="Neste material você vai aprender..." style={{ resize: 'vertical' }}></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* PASSO 2: FOTOS E BOTÃO DE ABRIR O ESTÚDIO */}
              {produtoStep === 2 && (
                <div className="fade-in">
                  <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>A Vitrine Interativa</h3>
                  <p style={{ color: '#888', marginBottom: '1.5rem', lineHeight: '1.5' }}>Suba as fotos. Para criar materiais de "estudo ativo", edite as imagens adicionando marcadores explicativos!</p>
                  
                  <label className="btn-hover" style={{ display: 'block', padding: '1.5rem', border: '2px dashed var(--cor-lilas)', borderRadius: '16px', backgroundColor: '#fdfbfd', textAlign: 'center', cursor: 'pointer', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                    <h4 style={{ color: 'var(--cor-roxo-escuro)', margin: '0 0 0.5rem 0' }}>Subir Imagens</h4>
                    <input type="file" multiple accept="image/*" onChange={handleAddProductImages} style={{ display: 'none' }} />
                  </label>

                  {/* Grid de Miniaturas com Botão "Editar" */}
                  {prodImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      {prodImages.map((img, index) => (
                        <div key={img.id} style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #edf2f7', position: 'relative' }}>
                          <button onClick={() => removeProductImage(img.id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '25px', height: '25px', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>✖</button>
                          <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', backgroundImage: `url(${img.previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#555', textAlign: 'center' }}>Imagem {index + 1} ({img.hotspots.length} pontos)</p>
                          <button onClick={() => setEditingImageId(img.id)} className="btn-hover" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--cor-lilas)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>🎯 Adicionar Pontos</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PASSO 3: PREÇO E ENTREGA */}
              {produtoStep === 3 && (
                <div className="fade-in">
                  <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Preço e Arquivo Final</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                      <input type="checkbox" id="toggle-gratis" checked={isGratuito} onChange={(e) => setIsGratuito(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--cor-rosa)' }} />
                      <label htmlFor="toggle-gratis" style={{ fontWeight: 'bold', color: 'var(--cor-texto-escuro)', cursor: 'pointer', flex: 1 }}>Este é um material 100% Gratuito</label>
                    </div>
                    {!isGratuito && (
                      <div className="fade-in">
                        <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--cor-roxo-escuro)', marginBottom: '8px' }}>Preço (R$)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a0aec0' }}>R$</span><input type="number" className="modern-input" placeholder="47,90" style={{ maxWidth: '150px' }} /></div>
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--cor-roxo-escuro)', marginBottom: '8px' }}>Arquivo PDF (Para os Alunos)</label>
                      <div style={{ padding: '1.5rem', border: '2px solid #edf2f7', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Nenhum arquivo enviado</p></div>
                        <button className="btn-hover" style={{ padding: '10px 20px', backgroundColor: 'var(--cor-lilas)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Subir PDF 📎</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #edf2f7', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setProdutoStep(prev => Math.max(1, prev - 1))} style={{ visibility: produtoStep === 1 ? 'hidden' : 'visible', padding: '12px 24px', backgroundColor: 'transparent', color: '#666', border: '2px solid #ddd', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>⬅️ Voltar</button>
              {produtoStep < 3 ? (
                <button onClick={() => setProdutoStep(prev => Math.min(3, prev + 1))} className="btn-hover" style={{ padding: '12px 32px', backgroundColor: 'var(--cor-roxo-escuro)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Próximo Passo ➡️</button>
              ) : (
                <button onClick={() => { setIsProdutoModalOpen(false); showToast("Salvo!", "success"); }} className="btn-hover" style={{ padding: '12px 32px', backgroundColor: 'var(--cor-rosa)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Publicar</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MINI-MODAL PARA DIGITAR TÍTULO E DESCRIÇÃO DO PONTO ================= */}
      {activeHotspotInput && (
        <div className="modal-overlay" style={{ zIndex: 9999999 }}>
          <div className="modal-content slide-up" style={{ maxWidth: '450px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem' }}>Detalhes do Marcador</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>A cor e o estilo já foram salvos.</p>
            
            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--cor-roxo-escuro)', marginBottom: '4px', fontSize: '0.9rem' }}>Título (Ex: Córtex, Lei 8080...)</label>
              <input autoFocus type="text" className="modern-input" placeholder="Título curto..." value={prodImages.find(img => img.id === activeHotspotInput.imageId)?.hotspots.find(hs => hs.id === activeHotspotInput.hotspotId)?.title || ''} onChange={(e) => updateHotspotData('title', e.target.value)} />
            </div>

            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--cor-roxo-escuro)', marginBottom: '4px', fontSize: '0.9rem' }}>Explicação para o Aluno</label>
              <textarea className="modern-input" rows={3} placeholder="Escreva o resumo aqui..." value={prodImages.find(img => img.id === activeHotspotInput.imageId)?.hotspots.find(hs => hs.id === activeHotspotInput.hotspotId)?.description || ''} onChange={(e) => updateHotspotData('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            
            <button onClick={() => setActiveHotspotInput(null)} className="btn-hover" style={{ padding: '14px 24px', backgroundColor: 'var(--cor-rosa)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>✅ Salvar Ponto</button>
          </div>
        </div>
      )}

      {/* ================= MODAL MODO FOCO (TEXTOS DO PERFIL) ================= */}
      {expandedField && (
        <div className="slide-up" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <div><h2 style={{ margin: 0, color: 'var(--cor-roxo-escuro)', fontSize: '1.3rem' }}>{expandedField.title}</h2><p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>{expandedField.helper}</p></div>
            <button onClick={() => setExpandedField(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#888', cursor: 'pointer', padding: '10px' }}>✖</button>
          </div>
          <textarea autoFocus value={autorData[expandedField.name] as string || ''} onChange={handleChange} name={expandedField.name} maxLength={expandedField.maxLength} placeholder="Comece a digitar aqui..." style={{ flex: 1, padding: '1.5rem', fontSize: '1.15rem', border: 'none', outline: 'none', resize: 'none', lineHeight: '1.7', color: 'var(--cor-texto-escuro)', fontFamily: 'inherit' }} />
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <span style={{ color: (autorData[expandedField.name]?.length || 0) >= expandedField.maxLength ? '#e74c3c' : '#888', fontWeight: 'bold' }}>{(autorData[expandedField.name]?.length || 0)} / {expandedField.maxLength}</span>
            <button onClick={() => setExpandedField(null)} style={{ backgroundColor: 'var(--cor-rosa)', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Concluído</button>
          </div>
        </div>
      )}

      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {autorData.logoUrl ? <img src={autorData.logoUrl} alt="Logo" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }} /> : <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>VR FARMA</h2>}
          <span style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginTop: '5px' }}>Workspace</span>
        </div>
        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === 'visao-geral' ? 'active' : ''}`} onClick={() => { setActiveTab('visao-geral'); setIsSidebarOpen(false); }}>📊 Visão Geral</button>
          <button className={`menu-item ${activeTab === 'materiais' ? 'active' : ''}`} onClick={() => { setActiveTab('materiais'); setIsSidebarOpen(false); }}>📚 Catálogo</button>
          <button className={`menu-item ${activeTab === 'sobre' ? 'active' : ''}`} onClick={() => { setActiveTab('sobre'); setIsSidebarOpen(false); }}>🎨 Perfil & Aparência</button>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="menu-item" style={{ width: '100%', color: '#ff7675', justifyContent: 'center' }}>Sair do Sistema</button>
          
          {/* Easter egg da sidebar */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
            CODIFICADO COM 🤍 PARA VOCÊ
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (VISÃO GERAL, PERFIL E CATÁLOGO) */}
      <main className="main-content">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 'bold', color: 'var(--cor-texto-escuro)', fontSize: '0.95rem' }}>Dra. {autorData.nome || 'Vitória Rocha'}</span><span style={{ fontSize: '0.75rem', color: '#888' }}>Modo Edição</span></div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--cor-lilas)' }}><img src={autorData.imagemUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          </div>
        </header>

        <div className="content-area">
          {/* ================= ABA: VISÃO GERAL ================= */}
          {activeTab === 'visao-geral' && (
             <div className="fade-in">
             <h1 className="page-title" style={{ fontSize: '2.2rem', color: 'var(--cor-roxo-escuro)', marginBottom: '0.2rem' }}>
               {getSaudacao()}, {autorData.nome ? autorData.nome.split(' ')[0] : 'Vitória'}! ✨
             </h1>
             <p style={{ color: '#666', fontSize: '1.05rem', marginBottom: '2rem' }}>
               Seu ecossistema está ganhando vida. Pronta para transformar o estudo de mais pessoas hoje? <span style={{fontSize: '0.9rem', color: '#a0aec0'}}>(Eu já sou seu fã nº 1!)</span>
             </p>

             {/* CARTÃO DE VERSÍCULO (CARROSSEL) */}
             <div className="verse-card" style={{ paddingRight: '3rem' }}>
               <div className="verse-bg-icon">📖</div>
               
               {/* A 'key' faz o React rodar a animação de deslize a cada troca */}
               <div key={verseIndex} className="swipe-slide">
                 <div className="verse-quote">"{versiculosData[verseIndex].texto}"</div>
                 <div className="verse-ref">- {versiculosData[verseIndex].ref}</div>
               </div>

               {/* Botão para passar para o lado manualmente */}
               <button onClick={nextVerse} className="carousel-nav-btn" style={{ color: 'white' }} title="Próximo Versículo">❯</button>
             </div>
             
             <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '1rem', fontSize: '1.3rem' }}>Desempenho da Plataforma</h3>
             <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
               <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
                 <div style={{ fontSize: '2.5rem' }}>👁️</div>
                 <div><h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--cor-roxo-escuro)' }}>1.248</h3><p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Visitas na Página</p></div>
               </div>
               <div className="stat-card" style={{ borderLeftColor: 'var(--cor-rosa)' }}>
                 <div style={{ fontSize: '2.5rem' }}>🛍️</div>
                 <div><h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--cor-roxo-escuro)' }}>42</h3><p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Vendas Realizadas</p></div>
               </div>
               <div className="stat-card" style={{ borderLeftColor: 'var(--cor-lilas)' }}>
                 <div style={{ fontSize: '2.5rem' }}>🔥</div>
                 <div><h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--cor-roxo-escuro)' }}>3.4%</h3><p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Taxa de Conversão</p></div>
               </div>
               <div className="stat-card" style={{ borderLeftColor: '#2ecc71' }}>
                 <div style={{ fontSize: '2.5rem' }}>💰</div>
                 <div><h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--cor-roxo-escuro)' }}>R$ 1.974</h3><p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Receita Estimada</p></div>
               </div>
             </div>

             {/* CARTÃO DE DICA DE OURO (CARROSSEL) */}
             <div className="glass-card fade-in" style={{ padding: '1.5rem 3rem 1.5rem 2rem', borderLeft: '5px solid var(--cor-rosa)', position: 'relative' }}>
               
               <div key={tipIndex} className="swipe-slide">
                 <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   {dicasData[tipIndex].icone} {dicasData[tipIndex].titulo}
                 </h3>
                 <p style={{ color: '#555', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
                   {dicasData[tipIndex].texto}
                 </p>
               </div>

               {/* Botão para passar a dica manualmente */}
               <button onClick={nextTip} className="carousel-nav-btn" style={{ background: '#f1f5f9', color: 'var(--cor-roxo-escuro)' }} title="Próxima Dica">❯</button>
             </div>
           </div>
          )}


          {/* ================= ABA: MATERIAIS / CATÁLOGO ================= */}
          {activeTab === 'materiais' && (
            <div className="fade-in">
              <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div>
                  <h2 className="page-title" style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2rem', margin: 0 }}>Catálogo de Materiais</h2>
                  <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Gerencie seus e-books, resumos e flashcards interativos.</p>
                </div>
                <button onClick={() => setIsProdutoModalOpen(true)} className="btn-hover btn-mobile-full" style={{ backgroundColor: 'var(--cor-rosa)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(200,93,161,0.3)' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 0 }}>+</span> Adicionar Produto
                </button>
              </div>
              
              <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to bottom, #ffffff, #fdfbfd)' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--cor-roxo-escuro)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                
                <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Sua estante virtual está vazia!</h3>
                <p style={{ color: '#666', fontSize: '1.05rem', maxWidth: '450px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
                  O conhecimento que você tem pode salvar a prova (e o semestre) de alguém. Cadastre seu primeiro material agora mesmo.
                </p>
                
                {/* Cartões de Tipos de Materiais */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '1.8rem' }}>📄</span>
                    <div style={{ textAlign: 'left' }}><strong style={{ color: 'var(--cor-roxo-escuro)', display: 'block' }}>E-books</strong><span style={{ fontSize: '0.8rem', color: '#888'}}>Guias e Manuais PDF</span></div>
                  </div>
                  <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '1.8rem' }}>🎯</span>
                    <div style={{ textAlign: 'left' }}><strong style={{ color: 'var(--cor-roxo-escuro)', display: 'block' }}>Flashcards</strong><span style={{ fontSize: '0.8rem', color: '#888' }}>Com imagens interativas</span></div>
                  </div>
                </div>

              </div>
            </div>
          )}
          
          {/* ================= ABA: PERFIL & APARENCIA  ================= */}

          {activeTab === 'sobre' && (
            <div className="glass-card fade-in">
              <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '2px solid #f4f6f9', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 className="page-title" style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Identidade Visual</h2>
                  <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
                    Configure como o público enxerga a sua marca. <span style={{color: 'var(--cor-rosa)', fontStyle: 'italic'}}>(A mais linda da internet, diga-se de passagem ❤️)</span>
                  </p>
                </div>
                <button onClick={handleSalvarSobreMim} disabled={isSaving || uploadLoading} className="btn-hover btn-mobile-full" style={{ padding: '14px 28px', backgroundColor: 'var(--cor-rosa)', color: 'white', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: (isSaving || uploadLoading) ? 'not-allowed' : 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(200,93,161,0.3)' }}>
                  {isSaving ? 'Salvando...' : '💾 Salvar e Publicar'}
                </button>
              </div>
              
              {/* O SEGREDO ESTÁ AQUI: flexWrap: 'wrap' ADICIONADO! */}
              <div className="profile-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
                
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

                <div className="mobile-full-width" style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="input-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '8px', fontSize: '0.95rem' }}>Nome de Exibição</label>
                      <input className="modern-input" type="text" name="nome" value={autorData.nome || ''} onChange={handleChange} placeholder="Como o público vai te chamar" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '700', color: 'var(--cor-roxo-escuro)', marginBottom: '8px', fontSize: '0.95rem' }}>
                        @ do Instagram <span style={{ fontSize: '0.8rem', color: '#a0aec0', fontWeight: 'normal' }}>(da melhor farmacêutica 💊)</span>
                      </label>
                      <input className="modern-input" type="text" name="instagramUrl" value={autorData.instagramUrl || ''} onChange={handleChange} placeholder="Ex: _umafarmaceutica" />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                      <label style={{ fontWeight: '700', color: 'var(--cor-roxo-escuro)', fontSize: '0.95rem' }}>Frase de Impacto</label>
                      <button onClick={() => setExpandedField({ name: 'textoIntro', title: 'Frase de Impacto', helper: 'A sua vitrine. Escreva uma frase curta e poderosa que mostre como você transforma a vida ou os estudos do seu público.', maxLength: 150 })} className="btn-expand">⤢ Expandir</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', lineHeight: '1.4' }}>
                      A sua vitrine. Escreva uma frase curta e poderosa que mostre como você transforma a vida ou os estudos do seu público.
                    </p>
                    <textarea 
                      className="modern-input" name="textoIntro" maxLength={150} value={autorData.textoIntro || ''} onChange={handleChange}
                      onClick={() => handleTextareaClick({ name: 'textoIntro', title: 'Frase de Impacto', helper: 'A sua vitrine. Escreva uma frase curta e poderosa que mostre como você transforma a vida ou os estudos do seu público.', maxLength: 150 })}
                      rows={3} style={{ resize: 'vertical' }} 
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoIntro?.length || 0)} / 150</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                      <label style={{ fontWeight: '700', color: 'var(--cor-roxo-escuro)', fontSize: '0.95rem' }}>Autoridade & Formação</label>
                      <button onClick={() => setExpandedField({ name: 'textoFormacao', title: 'Autoridade & Formação', helper: 'O seu crachá de credibilidade. Destaque suas especializações e conquistas para que os alunos tenham total segurança no seu domínio técnico.', maxLength: 300 })} className="btn-expand">⤢ Expandir</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', lineHeight: '1.4' }}>
                      O seu crachá de credibilidade. Destaque suas especializações e conquistas para que os alunos tenham total segurança no seu domínio técnico.
                    </p>
                    <textarea 
                      className="modern-input" name="textoFormacao" maxLength={300} value={autorData.textoFormacao || ''} onChange={handleChange} 
                      onClick={() => handleTextareaClick({ name: 'textoFormacao', title: 'Autoridade & Formação', helper: 'O seu crachá de credibilidade. Destaque suas especializações e conquistas para que os alunos tenham total segurança no seu domínio técnico.', maxLength: 300 })}
                      rows={4} style={{ resize: 'vertical' }} 
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoFormacao?.length || 0)} / 300</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                      <label style={{ fontWeight: '700', color: 'var(--cor-roxo-escuro)', fontSize: '0.95rem' }}>Propósito (Lado Humano)</label>
                      <button onClick={() => setExpandedField({ name: 'textoMissao', title: 'Propósito (Lado Humano)', helper: 'A sua essência. Compartilhe o que move o seu coração, seus valores e sua missão. É aqui que os visitantes se conectam de verdade com você.', maxLength: 350 })} className="btn-expand">⤢ Expandir</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', lineHeight: '1.4' }}>
                      A sua essência. Compartilhe o que move o seu coração, seus valores e sua missão. É aqui que os visitantes se conectam de verdade com você.
                    </p>
                    <textarea 
                      className="modern-input" name="textoMissao" maxLength={350} value={autorData.textoMissao || ''} onChange={handleChange} 
                      onClick={() => handleTextareaClick({ name: 'textoMissao', title: 'Propósito (Lado Humano)', helper: 'A sua essência. Compartilhe o que move o seu coração, seus valores e sua missão. É aqui que os visitantes se conectam de verdade com você.', maxLength: 350 })}
                      rows={4} style={{ resize: 'vertical' }} 
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '6px', color: '#a0aec0', fontWeight: '600' }}>{(autorData.textoMissao?.length || 0)} / 350</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}