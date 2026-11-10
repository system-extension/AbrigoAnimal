import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import { useSessao } from '../../context/Sessao';
import '../../pages/painel/painel.css';

const ABAS = [
  { para: '/painel', texto: 'Início', icone: 'fa-house', fim: true },
  { para: '/painel/animais', texto: 'Animais', icone: 'fa-paw' },
  { para: '/painel/animais/novo', texto: 'Cadastrar', icone: 'fa-plus', destaque: true },
  { para: '/painel/solicitacoes', texto: 'Pedidos', icone: 'fa-inbox' },
  { para: '/painel/padrinhos', texto: 'Padrinhos', icone: 'fa-hand-holding-heart' },
];

/**
 * Painel da equipe pensado para o celular:
 * barra de abas no rodapé (alcance do polegar) e botão central para cadastrar.
 * No computador, as abas viram uma barra lateral.
 */
export default function LayoutPainel() {
  const { usuario, sair } = useSessao();
  const { pathname } = useLocation();
  const noFormulario = /\/animais\/(novo|[^/]+)$/.test(pathname) && pathname !== '/painel/animais';

  // Chaves {} de propósito: um useEffect só pode devolver uma função de limpeza.
  // Escrito "() => window.scrollTo(0, 0)", ele devolveria o retorno de scrollTo,
  // que em alguns navegadores é uma Promise → erro "destroy is not a function".
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`painel ${noFormulario ? 'painel-formulario' : ''}`}>
      <header className="painel-topo">
        <Link to="/painel" className="marca">
          <img src={logo} alt="" width="36" height="36" />
          <strong>Painel</strong>
        </Link>
        <div className="d-flex align-items-center gap-1">
          <Link
            to="/painel/equipe"
            className="botao botao-texto"
            title={usuario?.administrador ? 'Equipe e minha senha' : 'Minha conta'}
          >
            <i
              className={`fa-solid ${usuario?.administrador ? 'fa-users-gear' : 'fa-user-gear'}`}
              aria-hidden="true"
            />
            <span className="d-none d-sm-inline">
              {usuario?.administrador ? 'Equipe' : 'Minha conta'}
            </span>
          </Link>
          <Link to="/" className="botao botao-texto" target="_blank" title="Abrir o site público">
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
            <span className="d-none d-sm-inline">Ver site</span>
          </Link>
          <button
            type="button"
            className="botao botao-texto"
            onClick={sair}
            title={`Sair (${usuario?.email})`}
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            <span className="d-none d-sm-inline">Sair</span>
          </button>
        </div>
      </header>

      <nav className="painel-abas" aria-label="Painel">
        {ABAS.map((a) => (
          <NavLink
            key={a.para}
            to={a.para}
            end={a.fim || a.destaque}
            className={`painel-aba ${a.destaque ? 'painel-aba-destaque' : ''}`}
          >
            <i className={`fa-solid ${a.icone}`} aria-hidden="true" />
            <span>{a.texto}</span>
          </NavLink>
        ))}
      </nav>

      <main className="painel-conteudo">
        <Outlet />
      </main>
    </div>
  );
}
