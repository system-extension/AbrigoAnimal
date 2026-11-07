/** Cadastro de animais (painel da equipe). Exige login. */
import { USAR_API_REAL } from './config';
import { requisicao, query } from './cliente';
import * as banco from './mock/banco';

const espera = (fn) => banco.responder(fn);

/** Lista leve (AnimalListagem). Filtros: busca, especie, situacao, ala, idoso, semFoto, pagina, tamanho */
export async function listar(filtros = {}) {
  if (USAR_API_REAL) return requisicao('/api/animais' + query(filtros));
  return banco.responder(() => {
    const lista = banco
      .filtrarAnimais(banco.animais(), filtros)
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(banco.listagem);
    return banco.paginar(lista, filtros.pagina, filtros.tamanho ?? 20); // backend: padrão 20, máx. 50
  });
}

/** Cadastro completo (AnimalDetalhe), com `versao` para salvar sem atropelar ninguém. */
export async function buscar(id) {
  if (USAR_API_REAL) return requisicao(`/api/animais/${id}`);
  return espera(() => banco.detalhe(banco.animalPorId(id)));
}

export async function criar(dados) {
  if (USAR_API_REAL) return requisicao('/api/animais', { metodo: 'POST', corpo: dados });
  return espera(() => banco.detalhe(banco.criarAnimal(dados)));
}

/** dados.versao é obrigatório: se outra pessoa salvou antes, volta erro 409. */
export async function editar(id, dados) {
  if (USAR_API_REAL) return requisicao(`/api/animais/${id}`, { metodo: 'PUT', corpo: dados });
  return espera(() => banco.detalhe(banco.editarAnimal(id, dados)));
}

/** DISPONIVEL, EM_TRATAMENTO ou ADOTADO. Óbito tem função própria. */
export async function mudarSituacao(id, situacao) {
  if (USAR_API_REAL)
    return requisicao(`/api/animais/${id}/situacao`, { metodo: 'POST', corpo: { situacao } });
  return espera(() => banco.detalhe(banco.mudarSituacao(id, situacao)));
}

export async function registrarObito(id, data) {
  if (USAR_API_REAL)
    return requisicao(`/api/animais/${id}/obito`, { metodo: 'POST', corpo: { data } });
  return espera(() => banco.detalhe(banco.registrarObito(id, data)));
}

export async function definirVitrine(id, visivel) {
  if (USAR_API_REAL)
    return requisicao(`/api/animais/${id}/vitrine`, { metodo: 'POST', corpo: { visivel } });
  return espera(() => banco.detalhe(banco.definirVitrine(id, visivel)));
}

/** Envia uma foto já comprimida (Blob). */
export async function enviarFoto(id, arquivo) {
  if (USAR_API_REAL) {
    const form = new FormData();
    form.append('arquivo', arquivo, 'foto.webp');
    return requisicao(`/api/animais/${id}/fotos`, { metodo: 'POST', formulario: form });
  }
  const a = await banco.adicionarFoto(id, arquivo);
  return banco.responder(() => banco.detalhe(a));
}

export async function removerFoto(id, fotoId) {
  if (USAR_API_REAL) return requisicao(`/api/animais/${id}/fotos/${fotoId}`, { metodo: 'DELETE' });
  const a = await banco.removerFoto(id, fotoId);
  return banco.responder(() => banco.detalhe(a));
}

export async function definirFotoPrincipal(id, fotoId) {
  if (USAR_API_REAL)
    return requisicao(`/api/animais/${id}/fotos/${fotoId}/principal`, { metodo: 'POST' });
  return espera(() => banco.detalhe(banco.fotoPrincipalDefinir(id, fotoId)));
}
