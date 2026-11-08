import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

/**
 * "Folha" que sobe do rodapé (bottom sheet): padrão de celular para menus e confirmações.
 * Fecha com o botão, tocando fora ou com Esc.
 *
 * É desenhada direto no <body> (portal): se ficasse dentro do cabeçalho, que usa
 * backdrop-filter, o "position: fixed" passaria a valer só dentro do cabeçalho
 * e a folha apareceria cortada no topo da tela.
 */
export default function Folha({ aberta, aoFechar, titulo, children }) {
  const idTitulo = useId();

  useEffect(() => {
    if (!aberta) return;
    const tecla = (e) => e.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = overflow;
    };
  }, [aberta, aoFechar]);

  if (!aberta) return null;
  return createPortal(
    <div className="folha-fundo" onClick={aoFechar}>
      <div
        className="folha"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <h2 id={idTitulo} className="h5 mb-0">
            {titulo}
          </h2>
          <button
            type="button"
            className="botao botao-texto botao-icone"
            onClick={aoFechar}
            aria-label="Fechar"
          >
            <i className="fa-solid fa-xmark fa-lg" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
