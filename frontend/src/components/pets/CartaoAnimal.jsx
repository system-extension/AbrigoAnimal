import { Link } from 'react-router-dom';
import FotoAnimal from './FotoAnimal';
import { rotulo, SEXOS, textoIdade } from '../../api/rotulos';
import './pets.css';

/**
 * Cartão da vitrine. Recebe o formato público do backend (AnimalPublicoResponse).
 * `veioDaLista`: marca a navegação para a ficha saber que pode "voltar" para a lista
 * (e assim a lista reabre com as mesmas páginas e na mesma posição).
 */
export default function CartaoAnimal({ animal, veioDaLista = false }) {
  const artigo = animal.sexo === 'FEMEA' ? 'a' : 'o';
  return (
    <article className="cartao-animal">
      <Link
        to={`/animais/${animal.slug}`}
        state={veioDaLista ? { veioDaLista: true } : undefined}
        className="cartao-animal-link"
        aria-label={`Conhecer ${animal.nome}`}
      >
        <div className="cartao-animal-foto">
          <FotoAnimal src={animal.fotoPrincipal} nome={animal.nome} especie={animal.especie} />
          {animal.idoso && (
            <span className="selo selo-verde cartao-animal-selo">
              <i className="fa-solid fa-heart" aria-hidden="true" /> Idos{artigo}
            </span>
          )}
        </div>
        <div className="cartao-animal-corpo">
          <h3 className="cartao-animal-nome">{animal.nome}</h3>
          <p className="cartao-animal-info">
            <i
              className={`fa-solid ${animal.especie === 'GATO' ? 'fa-cat' : 'fa-dog'}`}
              aria-hidden="true"
            />
            {rotulo(SEXOS, animal.sexo) === 'Não sei' ? '' : rotulo(SEXOS, animal.sexo) + ' · '}
            {textoIdade(animal.idadeAnos)}
          </p>
          <span className="cartao-animal-acao">
            Conhecer <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function CartaoAnimalEsqueleto() {
  return (
    <div className="cartao-animal" aria-hidden="true">
      <div className="esqueleto" style={{ aspectRatio: '4 / 5' }} />
      <div className="p-3">
        <div className="esqueleto mb-2" style={{ height: 22, width: '60%' }} />
        <div className="esqueleto" style={{ height: 16, width: '80%' }} />
      </div>
    </div>
  );
}
