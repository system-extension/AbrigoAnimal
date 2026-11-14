/** Cadastro de animais (painel da equipe). Exige login. */
import { requisicao, query } from './cliente';

/** Lista leve (AnimalListagem). Filtros: busca, especie, situacao, ala, idoso, semFoto, pagina, tamanho */
export async function listar(filtros = {}) {
  return requisicao('/api/animais' + query(filtros));
}

/** Cadastro completo (AnimalDetalhe), com `versao` para salvar sem atropelar ninguém. */
export async function buscar(id) {
  return requisicao(`/api/animais/${id}`);
}

export async function criar(dados) {
  return requisicao('/api/animais', { metodo: 'POST', corpo: dados });
}

/** dados.versao é obrigatório: se outra pessoa salvou antes, volta erro 409. */
export async function editar(id, dados) {
  return requisicao(`/api/animais/${id}`, { metodo: 'PUT', corpo: dados });
}

/** DISPONIVEL, EM_TRATAMENTO ou ADOTADO. Óbito tem função própria. */
export async function mudarSituacao(id, situacao) {
  return requisicao(`/api/animais/${id}/situacao`, { metodo: 'POST', corpo: { situacao } });
}

export async function registrarObito(id, data) {
  return requisicao(`/api/animais/${id}/obito`, { metodo: 'POST', corpo: { data } });
}

export async function definirVitrine(id, visivel) {
  return requisicao(`/api/animais/${id}/vitrine`, { metodo: 'POST', corpo: { visivel } });
}

/** Envia uma foto já comprimida (Blob). */
export async function enviarFoto(id, arquivo) {
  const form = new FormData();
  form.append('arquivo', arquivo, 'foto.webp');
  return requisicao(`/api/animais/${id}/fotos`, { metodo: 'POST', formulario: form });
}

export async function removerFoto(id, fotoId) {
  return requisicao(`/api/animais/${id}/fotos/${fotoId}`, { metodo: 'DELETE' });
}

export async function definirFotoPrincipal(id, fotoId) {
  return requisicao(`/api/animais/${id}/fotos/${fotoId}/principal`, { metodo: 'POST' });
}
