import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as api from '../../api/animais';
import { ESPECIES, rotulo, SITUACOES, textoIdade } from '../../api/rotulos';
import usePaginacao from '../../hooks/usePaginacao';
import useRolagemRestaurada from '../../hooks/useRolagemRestaurada';
import useValorAtrasado from '../../hooks/useValorAtrasado';
import FotoAnimal from '../../components/pets/FotoAnimal';
import Carregando from '../../components/ui/Carregando';
import Vazio from '../../components/ui/Vazio';
import CarregarMais from '../../components/ui/CarregarMais';
import TrilhoChips from '../../components/ui/TrilhoChips';

const FILTROS = [
  { rotulo: 'Todos', params: {} },
  { rotulo: 'Disponíveis', params: { situacao: 'DISPONIVEL' } },
  { rotulo: 'Idosos', params: { idoso: 'true' } },
  { rotulo: 'Em tratamento', params: { situacao: 'EM_TRATAMENTO' } },
  { rotulo: 'Adotados', params: { situacao: 'ADOTADO' } },
  { rotulo: 'Cães', params: { especie: 'CAO' } },
  { rotulo: 'Gatos', params: { especie: 'GATO' } },
  { rotulo: 'Sem foto', params: { semFoto: 'true' } },
  { rotulo: 'Óbitos', params: { situacao: 'OBITO' } },
];

const POR_PAGINA = 50; // máximo aceito pelo backend

const cor = (s) => SITUACOES.find((x) => x.valor === s)?.cor ?? 'cinza';

export default function PainelAnimais() {
  const [params, setParams] = useSearchParams();
  const [busca, setBusca] = useState('');
  // consulta só quando a pessoa para de digitar
  const buscaAtiva = useValorAtrasado(busca.trim());
  // ?ate=N é controle da paginação, não filtro
  const { ate, ...filtros } = Object.fromEntries(params);
  const chaveFiltros = JSON.stringify(filtros);
  const { dados, carregando, erro, temMais, carregarMais, carregandoMais, erroMais } = usePaginacao(
    (p) => api.listar({ ...filtros, busca: buscaAtiva || undefined, ...p }),
    [chaveFiltros, buscaAtiva],
    POR_PAGINA,
    (a) => a.id,
    {
      paginasIniciais: Number(ate) || 1,
      aoCarregarMais: (n) =>
        setParams(
          (atual) => {
            const novo = new URLSearchParams(atual);
            novo.set('ate', String(n));
            return novo;
          },
          { replace: true },
        ),
    },
  );
  useRolagemRestaurada('painel-animais' + chaveFiltros + buscaAtiva, !carregando && Boolean(dados));

  const ativo = (f) => JSON.stringify(f.params) === chaveFiltros;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Animais</h1>
        <Link to="/painel/animais/novo" className="botao botao-principal d-none d-md-inline-flex">
          <i className="fa-solid fa-plus" aria-hidden="true" /> Cadastrar
        </Link>
      </div>

      <div className="busca">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          type="search"
          className="entrada"
          placeholder="Buscar por nome ou chip"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            if (ate) {
              // busca nova começa da primeira página
              const novo = new URLSearchParams(params);
              novo.delete('ate');
              setParams(novo, { replace: true });
            }
          }}
          aria-label="Buscar animal"
        />
      </div>

      <TrilhoChips className="my-3" role="group" aria-label="Filtros">
        {FILTROS.map((f) => (
          <button
            key={f.rotulo}
            type="button"
            className="chip"
            aria-pressed={ativo(f)}
            onClick={() => setParams(f.params, { replace: true })}
          >
            {f.rotulo}
          </button>
        ))}
      </TrilhoChips>

      {erro ? (
        <Vazio icone="fa-wifi" titulo={erro.message} />
      ) : carregando && !dados ? (
        <Carregando />
      ) : dados.itens.length === 0 ? (
        <Vazio titulo="Nenhum animal encontrado.">
          <Link to="/painel/animais/novo" className="botao botao-principal mt-2">
            Cadastrar animal
          </Link>
        </Vazio>
      ) : (
        <>
          <p className="small texto-suave">
            {dados.total} {dados.total === 1 ? 'animal' : 'animais'}
          </p>
          <ul className="lista-animais">
            {dados.itens.map((a) => (
              <li key={a.id}>
                <Link to={`/painel/animais/${a.id}`} className="linha-animal">
                  <FotoAnimal
                    src={a.fotoPrincipal}
                    nome={a.nome}
                    especie={a.especie}
                    className="linha-animal-foto"
                  />
                  <span className="linha-animal-texto">
                    <strong>{a.nome}</strong>
                    <small>
                      {rotulo(ESPECIES, a.especie)}
                      {a.idadeAnos != null ? ` · ${textoIdade(a.idadeAnos)}` : ''}
                      {a.ala ? ` · ${a.ala}` : ''}
                      {a.canil ? ` · canil ${a.canil}` : ''}
                    </small>
                    <span className="d-flex flex-wrap gap-1 mt-1">
                      <span className={`selo selo-${cor(a.situacao)}`}>
                        {rotulo(SITUACOES, a.situacao)}
                      </span>
                      {a.idoso && <span className="selo selo-laranja">Idoso</span>}
                      {!a.visivelNaVitrine && a.situacao !== 'OBITO' && (
                        <span className="selo selo-cinza">
                          <i className="fa-solid fa-eye-slash" aria-hidden="true" /> Fora da vitrine
                        </span>
                      )}
                      {a.padrinhos > 0 && (
                        <span className="selo selo-verde">
                          <i className="fa-solid fa-hand-holding-heart" aria-hidden="true" />{' '}
                          {a.padrinhos}
                        </span>
                      )}
                      {!a.fotoPrincipal && <span className="selo selo-amarelo">Sem foto</span>}
                    </span>
                  </span>
                  <i className="fa-solid fa-chevron-right texto-suave" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <CarregarMais
            mostrando={dados.itens.length}
            total={dados.total}
            temMais={temMais}
            carregando={carregandoMais}
            erro={erroMais}
            aoCarregar={carregarMais}
          />
        </>
      )}
    </div>
  );
}
