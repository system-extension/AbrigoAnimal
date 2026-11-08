/** Site público: animais visíveis na vitrine. Sem login. Liga no backend com VITE_API_REAL=vitrine. */
const REAL = apiReal('vitrine');
import { apiReal } from './config';
import { requisicao, query } from './cliente';
import * as banco from './mock/banco';

/**
 * @param {{especie?: 'CAO'|'GATO', sexo?: string, porte?: string, idoso?: boolean, pagina?: number, tamanho?: number}} filtros
 * @returns {Promise<{itens: object[], pagina: number, tamanho: number, total: number, totalPaginas: number}>}
 */
export async function listarAnimais(filtros = {}) {
  if (REAL) return requisicao('/api/public/animais' + query(filtros));
  return banco.responder(() => {
    const lista = banco
      .filtrarAnimais(banco.animais().filter(banco.naVitrine), filtros)
      // idosos primeiro: são os que mais precisam de visibilidade
      .sort((a, b) => Number(b.idoso) - Number(a.idoso))
      .map(banco.publico);
    return banco.paginar(lista, filtros.pagina, filtros.tamanho ?? 24); // backend: padrão 24, máx. 48
  });
}

/** Página de um animal, pelo slug da URL (/animais/thor-a1). */
export async function buscarAnimal(slug) {
  if (REAL) return requisicao(`/api/public/animais/${encodeURIComponent(slug)}`);
  return banco.responder(() => banco.publico(banco.animalPorSlug(slug)));
}

/**
 * Vídeos dos animais (ADR 0009: hospedados no YouTube da ONG; o sistema guarda só o ID).
 * O backend ainda não tem esta rota: no modo API real a seção simplesmente não aparece.
 */
export async function listarVideos({ tamanho = 12 } = {}) {
  if (REAL) return { itens: [] }; // TODO ADR 0009: requisicao('/api/public/videos' + query({ tamanho }))
  return banco.responder(() => ({ itens: banco.videosPublicos().slice(0, tamanho) }));
}
