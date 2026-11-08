import { Link } from 'react-router-dom';
import caoIdoso from '../../assets/img/cao-idoso.webp';
import imgRole from '../../assets/img/role-do-abrigo.webp';
import mural1 from '../../assets/img/mural-1.webp';
import mural2 from '../../assets/img/mural-2.webp';
import mural3 from '../../assets/img/mural-3.webp';
import mural4 from '../../assets/img/mural-4.webp';
import { listarAnimais, listarVideos } from '../../api/vitrine';
import TrilhoVideos from '../../components/pets/Videos';
import useCarregar from '../../hooks/useCarregar';
import CartaoAnimal, { CartaoAnimalEsqueleto } from '../../components/pets/CartaoAnimal';
import { CONTATO } from '../../utils/contato';
import './paginas.css';
import './Inicio.css';

/** Rolê do Abrigo: último sábado de cada mês. Calcula a próxima data. */
function proximoRole() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  for (let m = 0; m < 3; m++) {
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + m + 1, 0);
    const sabado = new Date(fim);
    sabado.setDate(fim.getDate() - ((fim.getDay() + 1) % 7));
    if (sabado >= hoje) return sabado;
  }
  return null;
}

const PASSOS = [
  {
    titulo: 'Encontre uma conexão',
    texto: 'Veja as fotos, a história e os cuidados de cada animal, principalmente dos idosos.',
  },
  {
    titulo: 'Diga que quer participar',
    texto: 'Preencha um formulário simples, sem precisar criar conta.',
  },
  {
    titulo: 'Construa esse vínculo',
    texto: 'A equipe conversa com você sobre visitas, passeios e contribuição. Tudo livre.',
  },
];

const MURAL = [
  { src: mural1, alt: 'Cachorra caramelo sentada num cesto' },
  { src: mural2, alt: 'Cão marrom sentado tomando sol' },
  { src: mural3, alt: 'Cão branco e preto olhando para a câmera' },
  { src: mural4, alt: 'Cão pequeno brincando com um bichinho de pelúcia' },
];

export default function Inicio() {
  const idosos = useCarregar(() => listarAnimais({ idoso: true, tamanho: 4 }));
  const videos = useCarregar(() => listarVideos());
  const role = proximoRole();

  return (
    <div className="pagina-inicio">
      {/* Capa: título editorial + retrato em arco */}
      <section className="container capa" aria-labelledby="inicio-titulo">
        <div className="capa-texto">
          <span className="sobretitulo">
            <span className="ponto-verde" aria-hidden="true" /> Abrigo Animal · Joinville, desde
            2001
          </span>
          <h1 id="inicio-titulo" className="hero-titulo">
            O focinho fica branco. <em>O amor continua.</em>
          </h1>
          <p>
            Uma vida inteira de histórias, e muitas ainda para viver. Apadrinhe um animal idoso e
            faça parte dos próximos capítulos.
          </p>
          <div className="capa-acoes">
            <Link to="/animais?idoso=true" className="botao botao-principal botao-grande">
              Encontrar meu afilhado{' '}
              <i className="fa-solid fa-arrow-right botao-bolha" aria-hidden="true" />
            </Link>
            <a href="#apadrinhamento" className="link-editorial">
              Como funciona o apadrinhamento
            </a>
          </div>
          <p className="capa-nota">
            <i className="fa-regular fa-heart" aria-hidden="true" /> Presença, carinho e cuidado. No
            tempo deles.
          </p>
        </div>
        <figure className="capa-retrato">
          <img
            src={caoIdoso}
            alt="Cão idoso descansando em uma manta verde"
            width="900"
            height="900"
            fetchPriority="high"
          />
          <figcaption className="bilhete">
            <i className="fa-solid fa-heart" aria-hidden="true" />
            <span>
              Amor não tem idade.
              <small>Nem prazo para começar.</small>
            </span>
          </figcaption>
          <span className="capa-legenda">Imagem ilustrativa</span>
        </figure>
      </section>

      {/* Idosos em destaque */}
      <section className="container secao-editorial" aria-labelledby="idosos-titulo">
        <div className="cabeca-editorial">
          <div>
            <span className="sobretitulo">Conheça nossos idosos</span>
            <h2 id="idosos-titulo" className="titulo-secao">
              Cada um tem seu jeito. <em>Todos têm muito amor.</em>
            </h2>
          </div>
          <div>
            <p>
              Um olhar tranquilo, uma caminhada sem pressa, uma companhia para a vida. Idosos quase
              nunca são adotados: um padrinho muda a rotina deles.
            </p>
            <Link to="/animais?idoso=true" className="link-editorial">
              Ver todos os idosos <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
        {idosos.erro ? (
          <div className="estado-conteudo" role="status">
            <p>Não conseguimos carregar as histórias agora.</p>
            <button type="button" className="botao botao-contorno" onClick={idosos.recarregar}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="grade-animais">
            {idosos.carregando
              ? [1, 2, 3, 4].map((i) => <CartaoAnimalEsqueleto key={i} />)
              : idosos.dados?.itens.map((a) => <CartaoAnimal key={a.slug} animal={a} />)}
          </div>
        )}
      </section>

      {/* Convite à adoção: a única faixa de cor da página */}
      <section className="container" aria-labelledby="convite-titulo">
        <div className="convite">
          <span className="sobretitulo">Adoção responsável</span>
          <h2 id="convite-titulo" className="titulo-secao">
            Uma nova história pode começar <em>com você.</em>
          </h2>
          <Link to="/animais" className="botao botao-principal botao-chamada">
            Quero adotar <i className="fa-solid fa-paw botao-bolha" aria-hidden="true" />
          </Link>
          <Link to="/animais" className="link-editorial">
            Conheça todos os animais disponíveis
          </Link>
        </div>
      </section>

      {/* Apadrinhamento: o que é + 3 passos */}
      <section
        id="apadrinhamento"
        className="container secao-editorial inicio-vinculo"
        aria-labelledby="vinculo-titulo"
      >
        <div>
          <span className="sobretitulo">O projeto de apadrinhamento</span>
          <h2 id="vinculo-titulo" className="titulo-secao">
            Você não precisa levar para casa. <em>Pode levar no coração.</em>
          </h2>
          <p>
            Seu afilhado continua acolhido no abrigo. Você se aproxima, acompanha a história dele e
            combina com a equipe como participar. Um animal pode ter vários padrinhos.
          </p>
          <Link to="/animais?idoso=true" className="botao botao-principal">
            Quero apadrinhar{' '}
            <i className="fa-solid fa-arrow-right botao-bolha" aria-hidden="true" />
          </Link>
        </div>
        <ol className="lista-vinculo">
          {PASSOS.map((p, i) => (
            <li key={p.titulo}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {videos.dados?.itens.length > 0 && (
        <section className="container secao-editorial" aria-labelledby="videos-titulo">
          <div className="cabeca-editorial">
            <div>
              <span className="sobretitulo">O dia a dia, de pertinho</span>
              <h2 id="videos-titulo" className="titulo-secao">
                Pequenos momentos. <em>Grandes personalidades.</em>
              </h2>
            </div>
            <p>
              Um passeio, uma brincadeira ou uma soneca. Dê o play e conheça o jeitinho de cada um.
            </p>
          </div>
          <TrilhoVideos videos={videos.dados.itens} />
        </section>
      )}

      <section className="container secao-editorial" aria-labelledby="mural-titulo">
        <div className="cabeca-editorial">
          <div>
            <span className="sobretitulo">Mural do abrigo</span>
            <h2 id="mural-titulo" className="titulo-secao">
              A vida que a gente cuida.
            </h2>
          </div>
          <a href={CONTATO.instagram} target="_blank" rel="noreferrer" className="link-editorial">
            Acompanhe no Instagram <i className="fa-brands fa-instagram" aria-hidden="true" />
          </a>
        </div>
        <div className="mural-polaroid">
          {MURAL.map((f) => (
            <a key={f.src} href={CONTATO.instagram} target="_blank" rel="noreferrer">
              <img src={f.src} alt={f.alt} loading="lazy" />
            </a>
          ))}
        </div>
      </section>

      <section
        className="container secao-editorial role-editorial"
        id="role-do-abrigo"
        aria-labelledby="role-titulo"
      >
        <figure className="role-foto">
          <img src={imgRole} alt="Pessoas passeando com cães em uma trilha" loading="lazy" />
          <figcaption>Imagem ilustrativa</figcaption>
        </figure>
        <div>
          <span className="sobretitulo">Rolê do Abrigo</span>
          <h2 id="role-titulo" className="titulo-secao">
            Um sábado por mês, <em>um passeio que eles esperam.</em>
          </h2>
          <p>
            No último sábado de cada mês, você vai até o abrigo, escolhe um cão e passeia com ele
            pelos campos ao redor.
          </p>
          {role && (
            <div className="role-data">
              <span className="role-dia">
                <small>
                  {role.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                </small>
                <strong>{role.getDate()}</strong>
              </span>
              <span>
                <small className="texto-suave d-block">Próximo rolê</small>
                <strong>
                  {role.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </strong>
              </span>
            </div>
          )}
          <a
            className="botao botao-contorno mt-3"
            href={CONTATO.mapa}
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-solid fa-location-dot" aria-hidden="true" /> Como chegar
          </a>
        </div>
      </section>

      <section className="container pb-5">
        <div className="faixa-alerta">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <div>
            <h2 className="h5 mb-1">Maus-tratos a animais é crime</h2>
            <p className="mb-2">
              Viu ou suspeita de abuso? Saiba como denunciar pelos canais oficiais.
            </p>
            <Link to="/denuncia" className="botao botao-perigo">
              Como denunciar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
