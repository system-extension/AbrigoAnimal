import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import { useSessao } from '../../context/Sessao';
import { USAR_API_REAL } from '../../api/config';
import { restaurarDemonstracao } from '../../api/mock/banco';
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

      {!USAR_API_REAL && (
        <div className="faixa-demo">
          <span>
            <i className="fa-solid fa-flask" aria-hidden="true" /> Demonstração: os dados ficam só
            neste navegador.
          </span>
          <button
            type="button"
            className="botao-link"
            onClick={() =>
              window.confirm('Apagar as alterações e voltar aos exemplos?') &&
              restaurarDemonstracao()
            }
          >
            Restaurar exemplos
          </button>
        </div>
      )}

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
