import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import Folha from '../ui/Folha';

const LINKS = [
  { para: '/animais', texto: 'Animais', icone: 'fa-paw' },
  { para: '/como-ajudar', texto: 'Como ajudar', icone: 'fa-hand-holding-heart' },
  { para: '/sobre', texto: 'Sobre', icone: 'fa-circle-info' },
  { para: '/denuncia', texto: 'Denúncia', icone: 'fa-bullhorn' },
];

export default function Cabecalho() {
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="cabecalho">
      <div className="container cabecalho-conteudo">
        <Link to="/" className="marca" aria-label="Abrigo Animal Joinville, página inicial">
          <img src={logo} alt="" width="48" height="48" />
          <span className="marca-texto">
            <strong>Abrigo Animal</strong>
            <small>Joinville</small>
          </span>
        </Link>

        <nav className="menu-desktop" aria-label="Principal">
          {LINKS.map((l) => (
            <NavLink key={l.para} to={l.para} className="menu-link">
              {l.texto}
            </NavLink>
          ))}
          <Link to="/animais?idoso=true" className="botao botao-principal ms-2">
            <i className="fa-solid fa-heart" aria-hidden="true" /> Apadrinhe
          </Link>
        </nav>

        <div className="cabecalho-acoes-movel">
          <Link to="/animais?idoso=true" className="botao botao-principal atalho-apadrinhar">
            Apadrinhar
          </Link>
          <button
            type="button"
            className="botao botao-contorno botao-icone menu-botao"
            onClick={() => setMenu(true)}
            aria-label="Abrir menu"
            aria-expanded={menu}
          >
            <i className="fa-solid fa-bars" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Folha aberta={menu} aoFechar={() => setMenu(false)} titulo="Menu">
        <nav className="menu-movel" aria-label="Principal">
          <NavLink to="/" end className="menu-movel-link" onClick={() => setMenu(false)}>
            <i className="fa-solid fa-house" aria-hidden="true" /> Início
          </NavLink>
          {LINKS.map((l) => (
            <NavLink
              key={l.para}
              to={l.para}
              className="menu-movel-link"
              onClick={() => setMenu(false)}
              aria-current={pathname.startsWith(l.para) ? 'page' : undefined}
            >
              <i className={`fa-solid ${l.icone}`} aria-hidden="true" /> {l.texto}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/animais?idoso=true"
          className="botao botao-principal botao-bloco botao-grande mt-3"
          onClick={() => setMenu(false)}
        >
          <i className="fa-solid fa-heart" aria-hidden="true" /> Apadrinhe um idoso
        </Link>
      </Folha>
    </header>
  );
}
