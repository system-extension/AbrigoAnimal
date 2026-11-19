import { useCallback, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { buscarAnimal } from '../../api/vitrine';
import { PORTES, rotulo, SEXOS, textoIdade, VACINAS } from '../../api/rotulos';
import useCarregar from '../../hooks/useCarregar';
import FotoAnimal from '../../components/pets/FotoAnimal';
import EstadoErro from '../../components/ui/EstadoErro';
import { MENSAGENS } from '../../textos/mensagens';
import { useAvisos } from '../../context/Avisos';
import TrilhoVideos from '../../components/pets/Videos';
import VisualizadorFotos from '../../components/pets/VisualizadorFotos';
import './paginas.css';

/**
 * Fotos do animal.
 * - Celular: arrasta de lado; os pontinhos mostram em qual foto está.
 * - Computador: setas nas laterais e miniaturas clicáveis embaixo.
 * - Tocar/clicar na foto abre a tela cheia com zoom (VisualizadorFotos).
 * Cada lugar usa o menor tamanho que serve (ADR 0015): na foto principal o navegador escolhe
 * entre média e original pela tela; mini nas miniaturas; original na tela cheia.
 */
function Galeria({ animal }) {
  const [atual, setAtual] = useState(0);
  const [telaCheia, setTelaCheia] = useState(null); // índice da foto aberta em tela cheia
  const trilho = useRef(null);
  const temFotos = animal.fotos?.length > 0;
  const fotos = temFotos ? animal.fotos : [null];
  const fecharTelaCheia = useCallback(() => setTelaCheia(null), []);

  const aoRolar = () => {
    const t = trilho.current;
    if (t) setAtual(Math.round(t.scrollLeft / t.clientWidth));
  };

  const irPara = (indice) => {
    const t = trilho.current;
    const destino = Math.min(fotos.length - 1, Math.max(0, indice));
    t.scrollTo({ left: destino * t.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="galeria">
      <div className="galeria-principal">
        <div className="galeria-trilho" ref={trilho} onScroll={aoRolar}>
          {fotos.map((foto, i) => (
            <div className="galeria-item" key={foto?.grande ?? i}>
              {foto ? (
                <button
                  type="button"
                  className="galeria-abrir"
                  onClick={() => setTelaCheia(i)}
                  aria-label={`Ver foto ${i + 1} de ${animal.nome} em tela cheia`}
                >
                  <FotoAnimal
                    fontes={foto}
                    tamanhos="(min-width: 992px) 50vw, 100vw"
                    nome={animal.nome}
                    especie={animal.especie}
                    carregamento={i === 0 ? 'eager' : 'lazy'}
                  />
                </button>
              ) : (
                <FotoAnimal src={null} nome={animal.nome} especie={animal.especie} />
              )}
            </div>
          ))}
        </div>
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              className="galeria-seta galeria-seta-esquerda"
              onClick={() => irPara(atual - 1)}
              disabled={atual === 0}
              aria-label="Foto anterior"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="galeria-seta galeria-seta-direita"
              onClick={() => irPara(atual + 1)}
              disabled={atual === fotos.length - 1}
              aria-label="Próxima foto"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
            <div className="galeria-pontos" aria-hidden="true">
              {fotos.map((_, i) => (
                <span key={i} className={i === atual ? 'ativo' : ''} />
              ))}
            </div>
          </>
        )}
        {temFotos && (
          <span className="galeria-ampliar" aria-hidden="true">
            <i className="fa-solid fa-expand" />
          </span>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="galeria-miniaturas">
          {fotos.map((foto, i) => (
            <button
              type="button"
              key={foto.grande}
              className={i === atual ? 'ativa' : ''}
              onClick={() => irPara(i)}
              aria-label={`Mostrar foto ${i + 1}`}
              aria-current={i === atual ? 'true' : undefined}
            >
              <img src={foto.mini} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {telaCheia !== null && (
        <VisualizadorFotos
          fotos={animal.fotos.map((f) => f.grande)}
          inicial={telaCheia}
          nome={animal.nome}
          aoFechar={fecharTelaCheia}
        />
      )}
    </div>
  );
}

/**
 * Esqueleto da página do animal: o mesmo desenho (foto, nome, quadros de informação, texto) em
 * cinza pulsando enquanto os dados chegam. A página já nasce com a altura certa, então o rodapé
 * não aparece lá em cima nem "pula" quando os dados chegam.
 */
function AnimalEsqueleto() {
  return (
    <div className="pagina-animal" aria-busy="true" aria-label="Carregando o animal">
      <div className="container pagina-animal-grade">
        <div>
          <div className="esq-barra py-3">
            <span className="esqueleto esq-texto" style={{ width: '9rem' }} />
            <span className="esqueleto esq-circulo" />
          </div>
          <div className="esqueleto esq-foto" />
        </div>
        <div className="pagina-animal-texto">
          <span className="esqueleto esq-selo" />
          <span className="esqueleto esq-titulo" />
          <div className="infos">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} className="esqueleto esq-info" />
            ))}
          </div>
          {[100, 95, 80].map((largura) => (
            <span
              key={largura}
              className="esqueleto esq-texto mt-3"
              style={{ width: `${largura}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ icone, rotulo: r, valor }) {
  return (
    <div className="info">
      <i className={`fa-solid ${icone}`} aria-hidden="true" />
      <span>
        <small>{r}</small>
        <strong>{valor}</strong>
      </span>
    </div>
  );
}

export default function Animal() {
  const { slug } = useParams();
  const avisar = useAvisos();
  const {
    dados: a,
    carregando,
    erro,
    recarregar,
    recarregarEmSilencio,
  } = useCarregar(() => buscarAnimal(slug), [slug]);
  const location = useLocation();
  const navegar = useNavigate();

  // Veio da lista? "Todos os animais" volta no histórico (como o botão voltar do celular):
  // a lista reabre com as páginas já carregadas e na mesma posição. Veio de um link
  // compartilhado? Segue o link normal para /animais (voltar levaria para fora do site).
  const voltarParaLista = (e) => {
    if (location.state?.veioDaLista) {
      e.preventDefault();
      navegar(-1);
    }
  };

  if (carregando) return <AnimalEsqueleto />;
  if (erro)
    return (
      <div className="container secao">
        <EstadoErro
          erro={erro}
          naoEncontrado={MENSAGENS.animalForaDaVitrine}
          aoTentarDeNovo={recarregar}
          aoTentarEmSilencio={recarregarEmSilencio}
        >
          <Link to="/animais" className="botao botao-principal">
            {MENSAGENS.botaoVerOutrosAnimais}
          </Link>
        </EstadoErro>
      </div>
    );

  const ele = a.sexo === 'FEMEA' ? 'ela' : 'ele';
  const dele = a.sexo === 'FEMEA' ? 'dela' : 'dele';
  const temSaude = a.medicacoes || a.condicoesSaude || a.vacinas?.length > 0;
  const adotarEmDestaque = a.disponivelParaAdocao && !a.idoso;

  const compartilhar = async () => {
    const dadosLink = { title: `${a.nome} | Abrigo Animal Joinville`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(dadosLink);
      else {
        await navigator.clipboard.writeText(dadosLink.url);
        avisar.sucesso('Link copiado. É só colar no WhatsApp!');
      }
    } catch {
      /* a pessoa cancelou o compartilhamento */
    }
  };

  return (
    <article className="pagina-animal">
      <div className="container pagina-animal-grade">
        <div>
          <div className="d-flex justify-content-between align-items-center py-3">
            <Link to="/animais" className="botao botao-texto ps-0" onClick={voltarParaLista}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Todos os animais
            </Link>
            <button
              type="button"
              className="botao botao-contorno botao-icone"
              onClick={compartilhar}
              aria-label="Compartilhar"
            >
              <i className="fa-solid fa-share-nodes" aria-hidden="true" />
            </button>
          </div>
          <Galeria animal={a} />
        </div>

        <div className="pagina-animal-texto">
          <div className="d-flex flex-wrap gap-2 mb-2">
            {a.idoso && (
              <span className="selo selo-verde">
                <i className="fa-solid fa-heart" aria-hidden="true" /> Idos
                {a.sexo === 'FEMEA' ? 'a' : 'o'}
              </span>
            )}
            {!a.disponivelParaAdocao && (
              <span className="selo selo-amarelo">Disponível só para apadrinhamento</span>
            )}
          </div>
          <h1 className="pagina-animal-nome">{a.nome}</h1>

          <div className="infos">
            <Info
              icone={a.especie === 'GATO' ? 'fa-cat' : 'fa-dog'}
              rotulo="Espécie"
              valor={a.especie === 'GATO' ? 'Gato' : 'Cão'}
            />
            <Info
              icone="fa-venus-mars"
              rotulo="Sexo"
              valor={rotulo(SEXOS, a.sexo) === 'Não sei' ? 'Não informado' : rotulo(SEXOS, a.sexo)}
            />
            <Info icone="fa-cake-candles" rotulo="Idade" valor={textoIdade(a.idadeAnos)} />
            {a.porte && <Info icone="fa-ruler" rotulo="Porte" valor={rotulo(PORTES, a.porte)} />}
            {/* null = a ONG ainda não informou: melhor não dizer nada que dizer "não" */}
            {typeof a.castrado === 'boolean' && (
              <Info
                icone="fa-scissors"
                rotulo={a.sexo === 'FEMEA' ? 'Castrada' : 'Castrado'}
                valor={a.castrado ? 'Sim' : 'Ainda não'}
              />
            )}
            {a.cor && <Info icone="fa-palette" rotulo="Cor" valor={a.cor} />}
          </div>

          {a.idoso && (
            <div className="destaque-idoso">
              <i className="fa-solid fa-hand-holding-heart" aria-hidden="true" />
              <p className="mb-0">
                Animais idosos quase nunca são adotados. Como padrinho ou madrinha, você pode
                visitar, passear e acompanhar {ele} de perto.
              </p>
            </div>
          )}

          {a.descricao && (
            <section className="mt-4">
              <h2 className="h5">Sobre {ele}</h2>
              <p className="texto-longo">{a.descricao}</p>
            </section>
          )}

          {a.videos?.length > 0 && (
            <section className="mt-4">
              <h2 className="h5">
                <i
                  className="fa-solid fa-circle-play me-2"
                  style={{ color: 'var(--laranja)' }}
                  aria-hidden="true"
                />
                Vídeos
              </h2>
              <TrilhoVideos videos={a.videos} mostrarAnimal={false} />
            </section>
          )}

          {a.temperamento?.length > 0 && (
            <section className="mt-4">
              <h2 className="h5">Jeito {dele}</h2>
              <div className="chips">
                {a.temperamento.map((t) => (
                  <span key={t} className="chip chip-pequeno">
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(temSaude || a.medicacaoContinua) && (
            <section className="mt-4 cartao cartao-corpo">
              <h2 className="h5">
                <i
                  className="fa-solid fa-stethoscope me-2"
                  style={{ color: 'var(--verde)' }}
                  aria-hidden="true"
                />
                Saúde
              </h2>
              {a.medicacaoContinua && (
                <p className="mb-2">
                  <span className="selo selo-verde">Usa medicação contínua</span>
                </p>
              )}
              {a.medicacoes && (
                <p className="mb-2">
                  <strong>Medicações:</strong> {a.medicacoes}
                </p>
              )}
              {a.condicoesSaude && (
                <p className="mb-2">
                  <strong>Cuidados:</strong> {a.condicoesSaude}
                </p>
              )}
              {a.vacinas?.length > 0 && (
                <div className="mb-0">
                  <strong>Vacinas:</strong>{' '}
                  <span className="d-inline-flex flex-wrap gap-1 align-middle">
                    {a.vacinas.map((v) => (
                      <span key={v} className="selo selo-verde">
                        <i className="fa-solid fa-syringe" aria-hidden="true" />{' '}
                        {rotulo(VACINAS, v)}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Uma ação principal só (docs/DESIGN.md): idoso → apadrinhar; demais → adotar. */}
          <div className="acoes-animal">
            <Link
              to={`/animais/${a.slug}/interesse?tipo=APADRINHAR`}
              className={`botao botao-grande ${adotarEmDestaque ? 'botao-contorno' : 'botao-principal'}`}
            >
              <i className="fa-solid fa-heart" aria-hidden="true" /> Apadrinhar
            </Link>
            {a.disponivelParaAdocao && (
              <Link
                to={`/animais/${a.slug}/interesse?tipo=ADOTAR`}
                className={`botao botao-grande ${adotarEmDestaque ? 'botao-principal' : 'botao-contorno'}`}
              >
                <i className="fa-solid fa-house" aria-hidden="true" /> Adotar
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
