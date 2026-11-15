import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './pets.css';

const ZOOM_MAXIMO = 4;
const ZOOM_DO_TOQUE_DUPLO = 2.5;
const SEM_ZOOM = { escala: 1, x: 0, y: 0 };

const limitar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));

/**
 * Fotos em tela cheia, com zoom.
 *
 * - Celular: arrasta de lado para trocar de foto; pinça com dois dedos ou toca duas vezes para
 *   aproximar; com zoom, arrasta com um dedo para andar pela foto.
 * - Computador: clique na foto aproxima/afasta no ponto clicado; roda do mouse ajusta o zoom;
 *   setas na tela ou do teclado trocam de foto; Esc fecha.
 * - O botão "voltar" do celular fecha a tela cheia (em vez de sair da página do animal).
 *
 * O zoom é feito aqui (transform), não pelo zoom do navegador: assim ele vale só para a foto e
 * some ao fechar, sem deixar a página inteira ampliada.
 */
export default function VisualizadorFotos({ fotos, inicial = 0, nome, aoFechar }) {
  const [atual, setAtual] = useState(inicial);
  const [zoom, setZoom] = useState(SEM_ZOOM);
  const [gesto, setGesto] = useState(false); // durante o gesto, sem animação
  const trilho = useRef(null);
  const ponteiros = useRef(new Map());
  const pinca = useRef(null);
  const ultimoToque = useRef(0);
  const clique = useRef({ mouse: false, arrastou: false });
  const comZoom = zoom.escala > 1;

  // Fechar pelo botão: se a tela cheia criou uma entrada no histórico, volta nela
  // (o "popstate" abaixo chama aoFechar); senão, fecha direto.
  const fechar = useCallback(() => {
    if (window.history.state?.visualizadorFotos) window.history.back();
    else aoFechar();
  }, [aoFechar]);

  useEffect(() => {
    // Uma entrada no histórico para o "voltar" do celular fechar só a tela cheia.
    // A checagem evita entrada duplicada (o React monta duas vezes em desenvolvimento).
    if (!window.history.state?.visualizadorFotos) {
      window.history.pushState({ ...window.history.state, visualizadorFotos: true }, '');
    }
    const aoVoltar = () => aoFechar();
    window.addEventListener('popstate', aoVoltar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('popstate', aoVoltar);
      document.body.style.overflow = overflow;
    };
  }, [aoFechar]);

  // Abre já na foto que a pessoa tocou.
  useLayoutEffect(() => {
    const t = trilho.current;
    t.scrollLeft = inicial * t.clientWidth;
  }, [inicial]);

  const irPara = useCallback(
    (indice) => {
      const t = trilho.current;
      const destino = limitar(indice, 0, fotos.length - 1);
      setZoom(SEM_ZOOM);
      t.scrollTo({ left: destino * t.clientWidth, behavior: 'smooth' });
    },
    [fotos.length],
  );

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'Escape') fechar();
      else if (e.key === 'ArrowLeft') irPara(atual - 1);
      else if (e.key === 'ArrowRight') irPara(atual + 1);
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [atual, fechar, irPara]);

  const aoRolar = () => {
    const t = trilho.current;
    const indice = Math.round(t.scrollLeft / t.clientWidth);
    if (indice !== atual) {
      setAtual(indice);
      setZoom(SEM_ZOOM);
    }
  };

  /** Mantém a foto ampliada dentro da tela (não deixa "fugir" para fora). */
  const ajustar = (escala, x, y, area) => {
    if (escala <= 1.01) return SEM_ZOOM;
    const folgaX = ((escala - 1) * area.width) / 2;
    const folgaY = ((escala - 1) * area.height) / 2;
    return { escala, x: limitar(x, -folgaX, folgaX), y: limitar(y, -folgaY, folgaY) };
  };

  /** Amplia (ou desfaz) mantendo parado o ponto tocado/clicado. */
  const alternarZoomNoPonto = (e) => {
    const area = e.currentTarget.getBoundingClientRect();
    if (comZoom) {
      setZoom(SEM_ZOOM);
      return;
    }
    const dx = e.clientX - (area.left + area.width / 2);
    const dy = e.clientY - (area.top + area.height / 2);
    const s = ZOOM_DO_TOQUE_DUPLO;
    setZoom(ajustar(s, -dx * (s - 1), -dy * (s - 1), area));
  };

  const aoPressionar = (e) => {
    clique.current = { mouse: e.pointerType === 'mouse', arrastou: false };
    if (e.pointerType === 'mouse') {
      // mouse: clique amplia/afasta (aoClicar); com zoom, arrastar anda pela foto
      if (comZoom) {
        ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      return;
    }
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ponteiros.current.size === 2) {
      const [a, b] = [...ponteiros.current.values()];
      pinca.current = { distancia: Math.hypot(a.x - b.x, a.y - b.y), escala: zoom.escala };
      setGesto(true);
    } else if (ponteiros.current.size === 1) {
      const agora = Date.now();
      if (agora - ultimoToque.current < 300) {
        alternarZoomNoPonto(e);
        ultimoToque.current = 0;
      } else {
        ultimoToque.current = agora;
      }
    }
    if (comZoom || ponteiros.current.size === 2) e.currentTarget.setPointerCapture(e.pointerId);
  };

  const aoMover = (e) => {
    const anterior = ponteiros.current.get(e.pointerId);
    if (!anterior) return;
    const atualPonto = { x: e.clientX, y: e.clientY };
    ponteiros.current.set(e.pointerId, atualPonto);
    const area = e.currentTarget.getBoundingClientRect();

    if (ponteiros.current.size === 2 && pinca.current) {
      const [a, b] = [...ponteiros.current.values()];
      const distancia = Math.hypot(a.x - b.x, a.y - b.y);
      const escala = limitar(
        (pinca.current.escala * distancia) / pinca.current.distancia,
        1,
        ZOOM_MAXIMO,
      );
      setZoom((z) => ajustar(escala, z.x, z.y, area));
    } else if (ponteiros.current.size === 1 && comZoom) {
      if (Math.abs(atualPonto.x - anterior.x) + Math.abs(atualPonto.y - anterior.y) > 1) {
        clique.current.arrastou = true;
      }
      setGesto(true);
      setZoom((z) =>
        ajustar(z.escala, z.x + atualPonto.x - anterior.x, z.y + atualPonto.y - anterior.y, area),
      );
    }
  };

  const aoSoltar = (e) => {
    ponteiros.current.delete(e.pointerId);
    if (ponteiros.current.size < 2) pinca.current = null;
    if (ponteiros.current.size === 0) setGesto(false);
  };

  const aoClicar = (e) => {
    // só o mouse usa o clique para o zoom (no toque é o toque duplo); arrastar a foto não conta
    if (clique.current.mouse && !clique.current.arrastou) alternarZoomNoPonto(e);
  };

  const aoRodar = (e) => {
    const area = e.currentTarget.getBoundingClientRect();
    const escala = limitar(zoom.escala * (e.deltaY < 0 ? 1.15 : 1 / 1.15), 1, ZOOM_MAXIMO);
    setZoom(ajustar(escala, zoom.x, zoom.y, area));
  };

  return createPortal(
    <div className="visualizador" role="dialog" aria-modal="true" aria-label={`Fotos de ${nome}`}>
      <div className="visualizador-topo">
        <span className="visualizador-contador">
          {fotos.length > 1 ? `${atual + 1} de ${fotos.length}` : ''}
        </span>
        <button
          type="button"
          className="visualizador-botao"
          onClick={fechar}
          aria-label="Fechar"
          autoFocus
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>

      <div
        className={`visualizador-trilho ${comZoom ? 'com-zoom' : ''}`}
        ref={trilho}
        onScroll={aoRolar}
      >
        {fotos.map((src, i) => (
          <div className="visualizador-item" key={src}>
            <div
              className={`visualizador-area ${comZoom && i === atual ? 'com-zoom' : ''}`}
              onPointerDown={i === atual ? aoPressionar : undefined}
              onPointerMove={i === atual ? aoMover : undefined}
              onPointerUp={aoSoltar}
              onPointerCancel={aoSoltar}
              onClick={i === atual ? aoClicar : undefined}
              onWheel={i === atual ? aoRodar : undefined}
            >
              <img
                src={src}
                alt={`Foto ${i + 1} de ${nome}`}
                draggable={false}
                className={gesto ? '' : 'animado'}
                style={
                  i === atual && comZoom
                    ? { transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.escala})` }
                    : undefined
                }
              />
            </div>
          </div>
        ))}
      </div>

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            className="visualizador-botao visualizador-seta visualizador-seta-esquerda"
            onClick={() => irPara(atual - 1)}
            disabled={atual === 0}
            aria-label="Foto anterior"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="visualizador-botao visualizador-seta visualizador-seta-direita"
            onClick={() => irPara(atual + 1)}
            disabled={atual === fotos.length - 1}
            aria-label="Próxima foto"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </>
      )}
      <p className="visualizador-dica" aria-hidden="true">
        <span className="so-toque">
          {comZoom
            ? 'Toque duas vezes para afastar'
            : 'Toque duas vezes ou use dois dedos para aproximar'}
        </span>
        <span className="so-mouse">
          {comZoom ? 'Clique para afastar · arraste para mover' : 'Clique na foto para aproximar'}
        </span>
      </p>
    </div>,
    document.body,
  );
}
