import { Link } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import { CONTATO } from '../../utils/contato';

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img src={logo} alt="" width="64" height="64" className="rodape-logo" />
              <strong className="fs-5 text-white">Abrigo Animal Joinville</strong>
            </div>
            <p className="mb-0">
              ONG sem fins lucrativos fundada por voluntários em 2001, dedicada à proteção e ao
              cuidado de animais em Joinville.
            </p>
          </div>
          <div className="col-6 col-lg-2">
            <h2 className="rodape-titulo">Envolva-se</h2>
            <ul className="list-unstyled d-grid gap-2">
              <li>
                <Link to="/animais">Conhecer os animais</Link>
              </li>
              <li>
                <Link to="/animais?idoso=true">Apadrinhar</Link>
              </li>
              <li>
                <Link to="/como-ajudar#doacoes">Doar itens</Link>
              </li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h2 className="rodape-titulo">Institucional</h2>
            <ul className="list-unstyled d-grid gap-2">
              <li>
                <Link to="/sobre">Sobre nós</Link>
              </li>
              <li>
                <Link to="/denuncia">Denúncia</Link>
              </li>
              <li>
                <Link to="/privacidade">Privacidade</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h2 className="rodape-titulo">Redes</h2>
            <div className="d-flex gap-2">
              <a
                className="rodape-rede"
                href={CONTATO.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram" aria-hidden="true" />
              </a>
              <a
                className="rodape-rede"
                href={CONTATO.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-3 mb-0 small">
              <i className="fa-solid fa-location-dot me-2" aria-hidden="true" />
              {CONTATO.endereco}
            </p>
          </div>
        </div>
        <div className="rodape-base">
          <span>© {new Date().getFullYear()} Abrigo Animal Joinville</span>
          <Link to="/painel">Área da equipe</Link>
        </div>
      </div>
    </footer>
  );
}
