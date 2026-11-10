import { useEffect, useRef, useState } from 'react';

/**
 * Fileira de chips que rola de lado (filtros, abas, atalhos).
 *
 * No celular a pessoa arrasta com o dedo; no computador, sem touchpad, nem todo mundo sabe que dá
 * para rolar de lado. Por isso:
 * - quando há chips escondidos, a borda daquele lado ganha um esmaecido (dica visual, em qualquer tela);
 * - em telas com mouse aparecem setas nas laterais, que rolam a fileira.
 *
 * `className` vai no invólucro (margens, `filtros-fixos`, `form-atalhos`: o que é sticky fica por
 * fora, senão o sticky ficaria preso dentro do invólucro). O resto (role, aria-label) vai na fileira.
 */
export default function TrilhoChips({ as: Tag = 'div', className = '', children, ...props }) {
  const fileira = useRef(null);
  const [lados, setLados] = useState({ esquerda: false, direita: false });

  useEffect(() => {
    const el = fileira.current;
    const medir = () =>
      setLados({
        esquerda: el.scrollLeft > 4,
        direita: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    // o ResizeObserver já mede na primeira vez; depois, a cada mudança de tamanho
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    el.addEventListener('scroll', medir, { passive: true });
    return () => {
      observador.disconnect();
      el.removeEventListener('scroll', medir);
    };
  }, []);

  const rolar = (sentido) =>
    fileira.current.scrollBy({
      left: sentido * fileira.current.clientWidth * 0.7,
      behavior: 'smooth',
    });

  return (
    <div
      className={`trilho ${lados.esquerda ? 'trilho-mais-esquerda' : ''} ${lados.direita ? 'trilho-mais-direita' : ''} ${className}`}
    >
      <Tag ref={fileira} className="chips chips-rolagem" {...props}>
        {children}
      </Tag>
      {lados.esquerda && (
        <button
          type="button"
          className="trilho-seta trilho-seta-esquerda"
          aria-label="Ver opções anteriores"
          tabIndex={-1}
          onClick={() => rolar(-1)}
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>
      )}
      {lados.direita && (
        <button
          type="button"
          className="trilho-seta trilho-seta-direita"
          aria-label="Ver mais opções"
          tabIndex={-1}
          onClick={() => rolar(1)}
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
