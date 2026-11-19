/**
 * Foto do animal ou, se não houver, um fundo com o ícone da espécie.
 *
 * Com `fontes` ({ mini, media, grande }, ADR 0015) o navegador escolhe o tamanho pelo espaço na
 * tela e pela densidade da tela (srcset): cartão pequeno num computador baixa a mini ou a média;
 * celular com tela de alta densidade baixa a maior. `tamanhos` diz quanto da tela a foto ocupa.
 * Os "w" são o LADO MENOR de cada versão, que é o que enche a moldura recortada.
 */
export default function FotoAnimal({
  src,
  fontes,
  tamanhos = '100vw',
  nome,
  especie,
  className = '',
  carregamento = 'lazy',
}) {
  const principal = fontes?.media ?? src;
  if (principal)
    return (
      <img
        src={principal}
        srcSet={
          fontes ? `${fontes.mini} 240w, ${fontes.media} 600w, ${fontes.grande} 1200w` : undefined
        }
        sizes={fontes ? tamanhos : undefined}
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
