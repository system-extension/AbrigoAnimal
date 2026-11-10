/** Site público: animais visíveis na vitrine. Sem login. */
import { requisicao, query } from './cliente';

/**
 * @param {{especie?: 'CAO'|'GATO', sexo?: string, porte?: string, idoso?: boolean, pagina?: number, tamanho?: number}} filtros
 * @returns {Promise<{itens: object[], pagina: number, tamanho: number, total: number, totalPaginas: number}>}
 */
export async function listarAnimais(filtros = {}) {
  return requisicao('/api/public/animais' + query(filtros));
}

/** Página de um animal, pelo slug da URL (/animais/thor-a1). */
export async function buscarAnimal(slug) {
  return requisicao(`/api/public/animais/${encodeURIComponent(slug)}`);
}

/**
 * Vídeos dos animais (ADR 0009: hospedados no YouTube da ONG; o sistema guarda só o ID).
 * O backend ainda não tem esta rota: enquanto isso a lista vem vazia e a seção não aparece.
 */
export async function listarVideos() {
  return { itens: [] }; // TODO ADR 0009: requisicao('/api/public/videos' + query({ tamanho }))
}
