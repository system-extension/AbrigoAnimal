import { Link, useSearchParams } from 'react-router-dom';
import { listarAnimais } from '../../api/vitrine';
import useCarregar from '../../hooks/useCarregar';
import CartaoAnimal, { CartaoAnimalEsqueleto } from '../../components/pets/CartaoAnimal';
import Vazio from '../../components/ui/Vazio';
import './paginas.css';

/** Filtros rápidos. Ficam na URL (?especie=GATO&idoso=true): dá para compartilhar o link já filtrado. */
const FILTROS = [
  { id: 'todos', rotulo: 'Todos', params: {} },
  { id: 'idosos', rotulo: 'Idosos', icone: 'fa-heart', params: { idoso: 'true' } },
  { id: 'caes', rotulo: 'Cães', icone: 'fa-dog', params: { especie: 'CAO' } },
  { id: 'gatos', rotulo: 'Gatos', icone: 'fa-cat', params: { especie: 'GATO' } },
  { id: 'machos', rotulo: 'Machos', icone: 'fa-mars', params: { sexo: 'MACHO' } },
  { id: 'femeas', rotulo: 'Fêmeas', icone: 'fa-venus', params: { sexo: 'FEMEA' } },
];

export default function Animais() {
  const [params, setParams] = useSearchParams();
  const filtros = {
    especie: params.get('especie') || undefined,
    sexo: params.get('sexo') || undefined,
    idoso: params.get('idoso') || undefined,
  };
  const chave = JSON.stringify(filtros);
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => listarAnimais(filtros),
    [chave],
  );

  const ativo = (f) =>
    Object.keys(f.params).length === 0
      ? !filtros.especie && !filtros.sexo && !filtros.idoso
      : Object.entries(f.params).every(([k, v]) => params.get(k) === v);

  const alternar = (f) => {
    const novo = new URLSearchParams(params);
    if (Object.keys(f.params).length === 0) return setParams({}, { replace: true });
    const ligado = ativo(f);
    Object.entries(f.params).forEach(([k, v]) => (ligado ? novo.delete(k) : novo.set(k, v)));
    // espécie e sexo são exclusivos entre si
    if (!ligado && f.params.especie) novo.set('especie', f.params.especie);
    if (!ligado && f.params.sexo) novo.set('sexo', f.params.sexo);
    setParams(novo, { replace: true });
  };

  return (
    <div className="container secao pt-4">
      <span className="sobretitulo">Adoção e apadrinhamento</span>
      <h1 className="titulo-secao">
        {filtros.idoso ? 'Amor com tempo de sobra.' : 'Encontre uma nova conexão.'}
      </h1>
      <p className="texto-suave">
        {filtros.idoso
          ? 'Eles estão há mais tempo no abrigo. Um passeio tranquilo, um cuidado especial e alguém por perto transformam o dia deles.'
          : 'Cada animal tem uma história. Toque para conhecer o jeito, os cuidados e como fazer parte da vida dele.'}
      </p>

      <div className="chips chips-rolagem filtros-fixos" role="group" aria-label="Filtrar animais">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="chip"
            aria-pressed={ativo(f)}
            onClick={() => alternar(f)}
          >
            {f.icone && <i className={`fa-solid ${f.icone}`} aria-hidden="true" />}
            {f.rotulo}
          </button>
        ))}
      </div>

      {!carregando && dados && (
        <p className="texto-suave small mt-3 mb-2" aria-live="polite">
          {dados.total === 1 ? '1 animal encontrado' : `${dados.total} animais encontrados`}
        </p>
      )}

      {erro ? (
        <Vazio icone="fa-wifi" titulo="Não conseguimos carregar os animais.">
          <button type="button" className="botao botao-contorno mt-2" onClick={recarregar}>
            Tentar de novo
          </button>
        </Vazio>
      ) : carregando ? (
        <div className="grade-animais mt-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CartaoAnimalEsqueleto key={i} />
          ))}
        </div>
      ) : dados.itens.length === 0 ? (
        <Vazio titulo="Nenhum animal com esses filtros.">
          <button type="button" className="botao botao-contorno mt-2" onClick={() => setParams({})}>
            Ver todos
          </button>
        </Vazio>
      ) : (
        <div className="grade-animais">
          {dados.itens.map((a) => (
            <CartaoAnimal key={a.slug} animal={a} />
          ))}
        </div>
      )}
      {!filtros.idoso && (
        <aside className="nota-apadrinhar">
          <i className="fa-regular fa-heart" aria-hidden="true" />
          <p>
            Não pode adotar agora? Apadrinhe um idoso e acompanhe de perto.{' '}
            <Link to="/animais?idoso=true">Conhecer os idosos</Link>
          </p>
        </aside>
      )}
    </div>
  );
}
