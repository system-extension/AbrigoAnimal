import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Cabecalho from './Cabecalho';
import Rodape from './Rodape';
import './publico.css';

export default function LayoutPublico() {
  const { pathname, hash } = useLocation();

  // Ao trocar de página, volta ao topo (ou rola até a âncora #doacoes).
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  // .layout-publico: a página ocupa pelo menos a altura da tela e o conteúdo cresce, então o
  // rodapé fica sempre no fim, mesmo com pouco conteúdo (carregando, aviso de erro, 404).
  return (
    <div className="layout-publico">
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo">
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
