import { Link } from 'react-router-dom';
import * as animais from '../../api/animais';
import { listarSolicitacoes } from '../../api/solicitacoes';
import { rotulo, TIPOS_SOLICITACAO } from '../../api/rotulos';
import useCarregar from '../../hooks/useCarregar';
import { useSessao } from '../../context/Sessao';
import { tempoRelativo } from '../../utils/formato';
import Carregando from '../../components/ui/Carregando';

async function carregarResumo() {
  const [disp, idosos, trat, novas, semFoto] = await Promise.all([
    animais.listar({ situacao: 'DISPONIVEL', tamanho: 1 }),
    animais.listar({ idoso: true, tamanho: 1 }),
    animais.listar({ situacao: 'EM_TRATAMENTO', tamanho: 1 }),
    listarSolicitacoes({ status: 'NOVA', tamanho: 5 }),
    animais.listar({ semFoto: true, tamanho: 8 }),
  ]);
  return {
    disponiveis: disp.total,
    idosos: idosos.total,
    tratamento: trat.total,
    novas,
    semFoto,
  };
}

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function PainelInicio() {
  const { usuario } = useSessao();
  const { dados: r, carregando } = useCarregar(carregarResumo);

  return (
    <div>
      <h1 className="h3 mb-1">
        {saudacao()}, {usuario?.nome?.split(' ')[0]}!
      </h1>
      <p className="texto-suave">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      <Link
        to="/painel/animais/novo"
        className="botao botao-principal botao-grande botao-bloco mb-4"
      >
        <i className="fa-solid fa-camera" aria-hidden="true" /> Cadastrar animal
      </Link>

      {carregando || !r ? (
        <Carregando />
      ) : (
        <>
          <div className="numeros">
            <Link to="/painel/animais?situacao=DISPONIVEL" className="numero">
              <strong>{r.disponiveis}</strong>
              <span>disponíveis</span>
            </Link>
            <Link to="/painel/animais?idoso=true" className="numero">
              <strong>{r.idosos}</strong>
              <span>idosos</span>
            </Link>
            <Link to="/painel/animais?situacao=EM_TRATAMENTO" className="numero">
              <strong>{r.tratamento}</strong>
              <span>em tratamento</span>
            </Link>
          </div>

          <section className="cartao cartao-corpo mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h6 mb-0">
                <i
                  className="fa-solid fa-inbox me-2"
                  style={{ color: 'var(--laranja)' }}
                  aria-hidden="true"
                />
                Pedidos novos{' '}
                {r.novas.total > 0 && (
                  <span className="selo selo-laranja ms-1">{r.novas.total}</span>
                )}
              </h2>
              <Link to="/painel/solicitacoes" className="small fw-bold">
                Ver todos
              </Link>
            </div>
            {r.novas.itens.length === 0 ? (
              <p className="texto-suave small mb-0">Nenhum pedido esperando resposta.</p>
            ) : (
              <ul className="lista-simples">
                {r.novas.itens.map((s) => (
                  <li key={s.id}>
                    <Link to="/painel/solicitacoes">
                      <strong>{s.nome}</strong> quer{' '}
                      {rotulo(TIPOS_SOLICITACAO, s.tipo).toLowerCase()}
                      {s.animalNome ? ` ${s.animalNome}` : ''}
                      <small className="d-block texto-suave">{tempoRelativo(s.recebidaEm)}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {r.semFoto.total > 0 && (
            <section className="cartao cartao-corpo mt-3">
              <h2 className="h6">
                <i
                  className="fa-solid fa-camera me-2"
                  style={{ color: 'var(--laranja)' }}
                  aria-hidden="true"
                />
                Sem foto ({r.semFoto.total})
              </h2>
              <p className="texto-suave small">
                Animais sem foto quase não recebem interesse na vitrine.
              </p>
              <div className="chips">
                {r.semFoto.itens.map((a) => (
                  <Link key={a.id} to={`/painel/animais/${a.id}#fotos`} className="chip">
                    <i
                      className={`fa-solid ${a.especie === 'GATO' ? 'fa-cat' : 'fa-dog'}`}
                      aria-hidden="true"
                    />{' '}
                    {a.nome}
                  </Link>
                ))}
              </div>
              {r.semFoto.total > r.semFoto.itens.length && (
                <Link to="/painel/animais?semFoto=true" className="botao botao-texto ps-0 mt-2">
                  Ver todos os {r.semFoto.total}
                </Link>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
