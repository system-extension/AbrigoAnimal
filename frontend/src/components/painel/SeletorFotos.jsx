import { useRef, useState } from 'react';
import { comprimirFoto } from '../../utils/imagem';
import { useAvisos } from '../../context/Avisos';

export const MAX_FOTOS = 10;

/**
 * Fotos do animal no cadastro.
 * - "Tirar foto" abre direto a câmera traseira; "Galeria" permite escolher várias.
 * - Cada foto é comprimida no celular antes de qualquer envio.
 * - A primeira foto é a principal (a que aparece no cartão da vitrine).
 *
 * fotos: [{ chave, url, principal, fotoId?, blob?, enviando? }]
 * aoAdicionar(blobs[]) / aoRemover(foto) / aoTornarPrincipal(foto): quem usa decide se envia já ou depois.
 */
export default function SeletorFotos({
  fotos,
  aoAdicionar,
  aoRemover,
  aoTornarPrincipal,
  ocupado,
}) {
  const camera = useRef(null);
  const galeria = useRef(null);
  const [preparando, setPreparando] = useState(0);
  const avisar = useAvisos();
  const restantes = MAX_FOTOS - fotos.length;

  const escolher = async (e) => {
    const arquivos = [...e.target.files].slice(0, restantes);
    e.target.value = '';
    if (!arquivos.length) return;
    if (e.target.files.length > restantes)
      avisar.info(`Limite de ${MAX_FOTOS} fotos: usamos as primeiras.`);
    setPreparando(arquivos.length);
    const blobs = [];
    for (const arq of arquivos) {
      try {
        blobs.push(await comprimirFoto(arq));
      } catch (err) {
        avisar.erro(err.message);
      }
      setPreparando((n) => n - 1);
    }
    if (blobs.length) aoAdicionar(blobs);
  };

  return (
    <div>
      {fotos.length === 0 && !preparando ? (
        <div className="fotos-vazio">
          <i className="fa-solid fa-camera" aria-hidden="true" />
          <p className="mb-0">
            Uma boa foto é o que mais ajuda na adoção. <br />
            Fotografe com luz natural, na altura dos olhos do animal.
          </p>
        </div>
      ) : (
        <ul className="fotos-grade" aria-label="Fotos do animal">
          {fotos.map((f) => (
            <li key={f.chave} className={`foto-item ${f.principal ? 'principal' : ''}`}>
              <img src={f.url} alt="" />
              {f.enviando && (
                <span className="foto-enviando">
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                </span>
              )}
              {f.principal ? (
                <span className="foto-selo">
                  <i className="fa-solid fa-star" aria-hidden="true" /> Principal
                </span>
              ) : (
                <button
                  type="button"
                  className="foto-acao foto-acao-principal"
                  onClick={() => aoTornarPrincipal(f)}
                  disabled={ocupado}
                  aria-label="Tornar principal"
                >
                  <i className="fa-regular fa-star" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="foto-acao foto-acao-remover"
                onClick={() => aoRemover(f)}
                disabled={ocupado}
                aria-label="Remover foto"
              >
                <i className="fa-solid fa-trash" aria-hidden="true" />
              </button>
            </li>
          ))}
          {Array.from({ length: preparando }).map((_, i) => (
            <li key={'p' + i} className="foto-item esqueleto" aria-label="Preparando foto" />
          ))}
        </ul>
      )}

      {restantes > 0 && (
        <div className="fotos-botoes">
          <button
            type="button"
            className="botao botao-principal"
            onClick={() => camera.current.click()}
            disabled={ocupado}
          >
            <i className="fa-solid fa-camera" aria-hidden="true" /> Tirar foto
          </button>
          <button
            type="button"
            className="botao botao-contorno"
            onClick={() => galeria.current.click()}
            disabled={ocupado}
          >
            <i className="fa-solid fa-images" aria-hidden="true" /> Galeria
          </button>
        </div>
      )}
      <p className="campo-dica mt-2 mb-0">
        {fotos.length}/{MAX_FOTOS} fotos · toque na{' '}
        <i className="fa-regular fa-star" aria-hidden="true" /> para escolher a principal
      </p>

      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={escolher}
      />
      <input ref={galeria} type="file" accept="image/*" multiple hidden onChange={escolher} />
    </div>
  );
}
