import { Link } from 'react-router-dom';
import imgAbrigo from '../../assets/img/sobre-abrigo.webp';
import imgResgate from '../../assets/img/sobre-resgate.webp';
import imgCuidado from '../../assets/img/sobre-cuidado.webp';
import './paginas.css';

const FATOS = [
  { valor: '2001', texto: 'fundado por voluntários' },
  { valor: '~250', texto: 'cães e gatos acolhidos' },
  { valor: '~120', texto: 'são idosos' },
];

export default function Sobre() {
  return (
    <>
      <section className="sobre-topo">
        <img src={imgAbrigo} alt="Vista da sede do Abrigo Animal Joinville" />
        <div className="container">
          <span className="sobretitulo">ONG · Joinville/SC</span>
          <h1 className="titulo-secao">Proteção, cuidado e uma nova chance desde 2001.</h1>
          <p className="texto-suave">
            A Associação Abrigo Animal atua sem fins lucrativos para acolher e proteger animais
            domésticos abandonados ou vítimas de maus-tratos.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="fatos">
          {FATOS.map((f) => (
            <div key={f.texto} className="fato">
              <strong>{f.valor}</strong>
              <span>{f.texto}</span>
            </div>
          ))}
        </div>

        <section className="historia">
          <figure>
            <img src={imgResgate} alt="" loading="lazy" />
            <figcaption>Imagem ilustrativa</figcaption>
          </figure>
          <div>
            <span className="sobretitulo">Nossa história</span>
            <h2 className="titulo-secao">Uma iniciativa que nasceu do voluntariado</h2>
            <p>
              O Abrigo Animal foi fundado por voluntários em julho de 2001 com um propósito claro:
              proteger animais domésticos abandonados e maltratados.
            </p>
            <p>
              Desde então, o trabalho reúne abrigo, alimentação, vacinação, castração e atendimento
              veterinário para que cada animal possa se recuperar com dignidade.
            </p>
          </div>
        </section>

        <section className="historia historia-invertida">
          <figure>
            <img src={imgCuidado} alt="" loading="lazy" />
            <figcaption>Imagem ilustrativa</figcaption>
          </figure>
          <div>
            <span className="sobretitulo">Como trabalhamos</span>
            <h2 className="titulo-secao">Cuidado responsável, dentro dos nossos limites</h2>
            <p>
              Muitos animais chegam debilitados e precisam de acompanhamento contínuo. Somos uma
              organização independente, não um órgão público: cada doação e cada voluntário fazem
              diferença.
            </p>
            <p>
              Não fazemos feiras de adoção. Preferimos que cada adoção seja pensada com calma, e
              acompanhamos o animal depois que ele vai para casa.
            </p>
          </div>
        </section>

        <section className="cartao cartao-corpo text-center my-4">
          <h2 className="titulo-secao">A comunidade mantém esta história viva</h2>
          <p className="texto-suave">
            O abrigo é mantido por doações, pelo brechó anexo e pelo tempo de voluntários. Esse
            apoio cobre alimentação, medicamentos, castrações e cuidados diários.
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Link className="botao botao-principal" to="/como-ajudar">
              Como ajudar
            </Link>
            <Link className="botao botao-contorno" to="/animais">
              Conhecer os animais
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
