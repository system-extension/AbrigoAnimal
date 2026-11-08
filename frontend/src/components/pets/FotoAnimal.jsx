/** Foto do animal ou, se não houver, um fundo com o ícone da espécie. */
export default function FotoAnimal({ src, nome, especie, className = '', carregamento = 'lazy' }) {
  if (src)
    return (
      <img
        src={src}
        alt={`Foto de ${nome}`}
        className={`foto-animal ${className}`}
        loading={carregamento}
      />
    );
  return (
    <div
      className={`foto-animal foto-vazia ${className}`}
      role="img"
      aria-label={`${nome} ainda sem foto`}
    >
      <i className={`fa-solid ${especie === 'GATO' ? 'fa-cat' : 'fa-dog'}`} aria-hidden="true" />
      <span>Foto em breve</span>
    </div>
  );
}
