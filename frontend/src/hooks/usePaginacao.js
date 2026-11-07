import { useState } from 'react';
import useCarregar from './useCarregar';

/**
 * Lista paginada com "Carregar mais" (o backend devolve Pagina{itens, pagina, totalPaginas}).
 *
 * Uma página só na tela: cada "Carregar mais" acrescenta os próximos itens abaixo dos que já estão.
 * Quando os filtros (`deps`) mudam, recomeça da primeira página.
 *
 * `paginasIniciais` permite abrir já com N páginas (ex.: voltar da ficha de um animal com
 * ?ate=3 na URL): as páginas são buscadas juntas e somadas. `aoCarregarMais(n)` avisa quantas
 * páginas estão na tela, para a tela gravar isso na URL.
 *
 * @param {(p: {pagina: number, tamanho: number}) => Promise<{itens: object[], totalPaginas: number, total: number}>} buscar
 * @param {unknown[]} deps    filtros: quando mudam, recomeça
 * @param {number} tamanho    itens por página
 * @param {(item: object) => string} chaveDo  identifica o item (evita repetir se a lista mudar entre páginas)
 * @param {{paginasIniciais?: number, aoCarregarMais?: (paginasNaTela: number) => void}} [opcoes]
 */
export default function usePaginacao(buscar, deps, tamanho, chaveDo, opcoes = {}) {
  const { paginasIniciais = 1, aoCarregarMais } = opcoes;

  const inicial = useCarregar(
    () => carregarAte(buscar, tamanho, paginasIniciais),
    // paginasIniciais fica de fora de propósito: ela muda a cada "Carregar mais" (na URL)
    // e isso não pode recarregar a lista inteira. Só vale ao abrir ou ao mudar os filtros.
    deps,
  );
  const chave = JSON.stringify(deps);

  // Páginas extras guardadas junto com a chave dos filtros: filtros novos = extras descartadas,
  // sem precisar de efeito para "zerar" o estado.
  const [mais, setMais] = useState({ chave: null, paginas: 0, itens: [] });
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erroMais, setErroMais] = useState(null);
  const extras = mais.chave === chave ? mais : { paginas: 0, itens: [] };

  const base = inicial.dados;
  const paginasNaTela = base ? base.paginasCarregadas + extras.paginas : 0;
  const itens = base ? juntarSemRepetir(base.itens, extras.itens, chaveDo) : [];
  const temMais = Boolean(base) && paginasNaTela < base.totalPaginas;

  const carregarMais = async () => {
    setCarregandoMais(true);
    setErroMais(null);
    try {
      const r = await buscar({ pagina: paginasNaTela, tamanho });
      setMais({ chave, paginas: extras.paginas + 1, itens: [...extras.itens, ...r.itens] });
      aoCarregarMais?.(paginasNaTela + 1);
    } catch (e) {
      setErroMais(e);
    } finally {
      setCarregandoMais(false);
    }
  };

  return {
    carregando: inicial.carregando,
    erro: inicial.erro,
    recarregar: inicial.recarregar,
    dados: base && { ...base, itens },
    temMais,
    carregarMais,
    carregandoMais,
    erroMais,
  };
}

/** Busca as páginas 0..n-1 (sem passar do total) e devolve tudo somado. */
async function carregarAte(buscar, tamanho, n) {
  const primeira = await buscar({ pagina: 0, tamanho });
  const ate = Math.min(Math.max(1, Math.floor(n) || 1), primeira.totalPaginas);
  const resto = await Promise.all(
    Array.from({ length: ate - 1 }, (_, i) => buscar({ pagina: i + 1, tamanho })),
  );
  return {
    ...primeira,
    itens: [...primeira.itens, ...resto.flatMap((r) => r.itens)],
    paginasCarregadas: ate,
  };
}

function juntarSemRepetir(a, b, chaveDo) {
  const vistos = new Set(a.map(chaveDo));
  return [...a, ...b.filter((x) => !vistos.has(chaveDo(x)))];
}
