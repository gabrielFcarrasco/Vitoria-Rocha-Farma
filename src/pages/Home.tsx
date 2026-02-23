import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ backgroundColor: 'var(--cor-creme)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. HEADER & NAVEGAÇÃO */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1rem 5%', backgroundColor: 'var(--cor-branco)',
        boxShadow: '0 2px 15px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ color: 'var(--cor-roxo-escuro)', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
          Vitória Rocha Farma
        </h2>

        {/* Menu Desktop */}
        <nav className="desktop-menu">
          <a href="#beneficios" style={{ color: 'var(--cor-texto-escuro)', textDecoration: 'none', fontWeight: '500' }}>Método</a>
          <a href="#gratuitos" style={{ color: 'var(--cor-texto-escuro)', textDecoration: 'none', fontWeight: '500' }}>Materiais Gratuitos</a>
          <a href="#premium" style={{ color: 'var(--cor-texto-escuro)', textDecoration: 'none', fontWeight: '500' }}>Premium</a>
          <Link to="/login" style={{ color: 'var(--cor-lilas)', textDecoration: 'none', fontWeight: 'bold' }}>Acesso Restrito</Link>
        </nav>

        {/* Botão Hamburguer (Aparece só no Mobile) */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✖' : '☰'}
        </button>

        {/* Menu Mobile (Dropdown) */}
        <nav className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <a href="#beneficios" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--cor-texto-escuro)', textDecoration: 'none' }}>Método</a>
          <a href="#gratuitos" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--cor-texto-escuro)', textDecoration: 'none' }}>Materiais Gratuitos</a>
          <a href="#premium" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--cor-texto-escuro)', textDecoration: 'none' }}>Premium</a>
          <Link to="/login" style={{ color: 'var(--cor-rosa)', textDecoration: 'none', fontWeight: 'bold' }}>Área do Admin</Link>
        </nav>
      </header>

      {/* 2. HERO SECTION (A Promessa) */}
      <section className="animate-fade-up" style={{ 
        textAlign: 'center', padding: '6rem 2rem', 
        backgroundColor: 'var(--cor-roxo-escuro)', color: 'var(--cor-branco)',
        borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px'
      }}>
        <span style={{ backgroundColor: 'var(--cor-rosa)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>
          ATUALIZADO PARA 2026
        </span>
        <h1 style={{ fontSize: '3rem', margin: '1.5rem auto 1rem', maxWidth: '800px', lineHeight: '1.2' }}>
          Domine a Farmacologia sem perder horas lendo textos densos.
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', color: '#e0d4e5', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
          Mapas mentais, E-books e Psicocards ilustrados e esquematizados para estudantes e farmacêuticos que buscam resultados rápidos.
        </p>
        <a href="#premium" className="btn-hover" style={{ 
          display: 'inline-block', backgroundColor: 'var(--cor-rosa)', color: 'var(--cor-branco)', 
          padding: '18px 40px', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '1.2rem'
        }}>
          VER MATERIAIS COMPLETOS
        </a>
      </section>

      {/* 3. BENEFÍCIOS (Por que escolher?) */}
      <section id="beneficios" className="animate-fade-up delay-1" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2.2rem', marginBottom: '3rem' }}>O fim da decoreba exaustiva.</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div className="card-hover" style={{ flex: '1', minWidth: '250px', backgroundColor: 'var(--cor-branco)', padding: '2rem', borderRadius: '12px', borderTop: '4px solid var(--cor-rosa)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--cor-roxo-escuro)' }}>🧠 + Memorização</h3>
            <p style={{ color: 'var(--cor-texto-escuro)' }}>Cores e esquemas visuais que ativam a memória fotográfica durante as provas e plantões.</p>
          </div>
          
          <div className="card-hover" style={{ flex: '1', minWidth: '250px', backgroundColor: 'var(--cor-branco)', padding: '2rem', borderRadius: '12px', borderTop: '4px solid var(--cor-lilas)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--cor-roxo-escuro)' }}>⏱️ + Tempo Livre</h3>
            <p style={{ color: 'var(--cor-texto-escuro)' }}>Revisões que demoravam horas agora são feitas em minutos com nosso formato direto ao ponto.</p>
          </div>

          <div className="card-hover" style={{ flex: '1', minWidth: '250px', backgroundColor: 'var(--cor-branco)', padding: '2rem', borderRadius: '12px', borderTop: '4px solid var(--cor-roxo-escuro)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--cor-roxo-escuro)' }}>📱 100% Digital</h3>
            <p style={{ color: 'var(--cor-texto-escuro)' }}>Acesse pelo celular, tablet ou imprima no conforto de casa em formato A4.</p>
          </div>
        </div>
      </section>

      {/* 4. ISCA DIGITAL (Gratuitos) */}
      <section id="gratuitos" style={{ padding: '4rem 5%', backgroundColor: 'var(--cor-lilas)', color: 'var(--cor-branco)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Experimente a nossa Didática</h2>
        <p style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>Baixe materiais gratuitos agora e veja como é fácil aprender com nosso método.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="card-hover" style={{ backgroundColor: 'var(--cor-branco)', padding: '2rem', borderRadius: '12px', width: '320px', color: 'var(--cor-texto-escuro)' }}>
            <h3 style={{ color: 'var(--cor-roxo-escuro)', marginBottom: '0.5rem' }}>PDF Transtornos Mentais</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#666' }}>Resumo essencial e esquematizado.</p>
            <button className="btn-hover" style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: 'var(--cor-roxo-escuro)', border: '2px solid var(--cor-roxo-escuro)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Baixar Grátis</button>
          </div>
        </div>
      </section>

      {/* 5. VITRINE PREMIUM (Produtos principais) */}
      <section id="premium" style={{ padding: '5rem 5%', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Catálogo Premium</h2>
        <p style={{ color: 'var(--cor-texto-escuro)', marginBottom: '4rem', fontSize: '1.1rem' }}>Os materiais mais desejados pelos estudantes de farmácia.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Card Produto 1 */}
          <div className="card-hover" style={{ backgroundColor: 'var(--cor-branco)', padding: '1.5rem', borderRadius: '16px', width: '340px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-12px', right: '20px', backgroundColor: 'var(--cor-rosa)', color: 'var(--cor-branco)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(200,93,161,0.3)' }}>
              MAIS VENDIDO
            </span>
            <div style={{ height: '200px', backgroundColor: 'var(--cor-creme)', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--cor-lilas)' }}>
              <span style={{ color: 'var(--cor-lilas)', fontWeight: 'bold' }}>[Capa do E-book]</span>
            </div>
            <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>E-book Sistema Nervoso</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem', height: '45px' }}>O guia definitivo para entender a farmacologia do SNC sem sofrimento.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through' }}>R$ 67,90</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--cor-roxo-escuro)' }}>R$ 47,90</span>
            </div>
            <button className="btn-hover" style={{ width: '100%', padding: '15px', backgroundColor: 'var(--cor-roxo-escuro)', color: 'var(--cor-branco)', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}>
              COMPRAR AGORA
            </button>
          </div>

          {/* Card Produto 2 */}
          <div className="card-hover" style={{ backgroundColor: 'var(--cor-branco)', padding: '1.5rem', borderRadius: '16px', width: '340px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ height: '200px', backgroundColor: 'var(--cor-creme)', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--cor-lilas)' }}>
              <span style={{ color: 'var(--cor-lilas)', fontWeight: 'bold' }}>[Capa Psicocards]</span>
            </div>
            <h3 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Psicocards (Flashcards)</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem', height: '45px' }}>Estudo ativo! Teste seus conhecimentos sobre psicofármacos.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--cor-roxo-escuro)' }}>R$ 29,90</span>
            </div>
            <button className="btn-hover" style={{ width: '100%', padding: '15px', backgroundColor: 'var(--cor-roxo-escuro)', color: 'var(--cor-branco)', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}>
              COMPRAR AGORA
            </button>
          </div>

        </div>
      </section>

            {/* 6. SOBRE A AUTORA */}
      <section className="animate-fade-up" style={{ padding: '5rem 5%', backgroundColor: 'var(--cor-branco)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '4rem' }}>
        
        {/* Foto com detalhe visual */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', backgroundColor: 'var(--cor-rosa)', color: 'var(--cor-branco)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 2, boxShadow: '0 4px 10px rgba(200,93,161,0.3)' }}>
            @_umafarmaceutica
          </div>
          <div style={{ width: '280px', height: '280px', borderRadius: '50%', backgroundColor: 'var(--cor-lilas)', border: '8px solid var(--cor-creme)', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
            {/* Coloque a tag <img> com a foto dela aqui no futuro */}
          </div>
        </div>

        {/* Textos da Bio */}
        <div style={{ maxWidth: '550px', textAlign: 'left' }}>
          <h2 style={{ color: 'var(--cor-roxo-escuro)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Quem cria os materiais?</h2>
          
          <p style={{ color: 'var(--cor-texto-escuro)', fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Olá! Eu sou a <b>Vitória Rocha</b>, Farmacêutica apaixonada por facilitar o aprendizado. Acredito que a educação na área da saúde não precisa ser maçante.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
            <span style={{ backgroundColor: 'var(--cor-creme)', color: 'var(--cor-roxo-escuro)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>Farmácia Clínica</span>
            <span style={{ backgroundColor: 'var(--cor-creme)', color: 'var(--cor-roxo-escuro)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>Prescrição</span>
            <span style={{ backgroundColor: 'var(--cor-creme)', color: 'var(--cor-roxo-escuro)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>Saúde Mental & Pública</span>
          </div>

          <p style={{ color: '#555', lineHeight: '1.7', marginBottom: '1rem', fontSize: '1rem' }}>
            Tenho 24 anos, sou cristã e atuo ativamente em projetos sociais na OSC Celeiro de Paz. Sou pós-graduada em Farmácia Clínica e Prescrição Farmacêutica, e atualmente especializanda em Saúde Pública e APS (com foco em ESF). 
          </p>

          <p style={{ color: '#555', lineHeight: '1.7', fontSize: '1rem', borderLeft: '4px solid var(--cor-lilas)', paddingLeft: '15px' }}>
            Compartilho conteúdos 100% confiáveis sobre medicamentos, psicotrópicos e substâncias psicoativas. <b>Crio resumos, mapas mentais e e-books com um único objetivo:</b> fazer você aprender mais rápido e reter o conteúdo para a sua prática clínica!
          </p>
        </div>
      </section>

            {/* 7. FOOTER */}
      <footer style={{ backgroundColor: 'var(--cor-texto-escuro)', color: 'var(--cor-creme)', textAlign: 'center', padding: '3rem 2rem' }}>
        <h3 style={{ marginBottom: '0.2rem', color: 'var(--cor-lilas)' }}>Farmacêutica Vitória Rocha</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--cor-creme)', opacity: 0.8, marginBottom: '1rem', fontWeight: '500' }}>
          CRF: 1-114126-7
        </p>
        <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '2rem' }}>Transformando a forma como você estuda Farmacologia.</p>
        <div style={{ borderTop: '1px solid #503459', paddingTop: '1.5rem', fontSize: '0.8rem', color: '#888' }}>
          © 2026 Todos os direitos reservados. Feito com cuidado para estudantes brilhantes.
        </div>
      </footer>
    </div>
  );
}