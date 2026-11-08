/** Formulário público de interesse + caixa de solicitações da equipe. */
import { USAR_API_REAL, apiReal } from './config';
import { requisicao, query } from './cliente';
import * as banco from './mock/banco';

/**
 * Envia o formulário "quero apadrinhar / quero adotar". Não exige conta.
 * @param {{tipo: 'APADRINHAR'|'ADOTAR'|'OUTRO', animalSlug?: string, nome: string,
 *          telefone?: string, email?: string, mensagem?: string, consentimento: boolean, site: string}} form
 * `site` é a isca para robôs: precisa ir vazio.
 */
export async function enviarInteresse(form) {
  // o formulário de interesse é do site público: segue a vitrine
  if (apiReal('vitrine'))
    return requisicao('/api/public/solicitacoes', { metodo: 'POST', corpo: form });
  return banco.responder(() => banco.receberSolicitacao(form));
}

/** Caixa de solicitações (painel). status opcional: NOVA, EM_CONTATO, CONCLUIDA, DESCARTADA */
export async function listarSolicitacoes({ status, pagina = 0, tamanho = 50 } = {}) {
  if (USAR_API_REAL) return requisicao('/api/solicitacoes' + query({ status, pagina, tamanho }));
  return banco.responder(() => banco.paginar(banco.solicitacoes(status), pagina, tamanho));
}

export async function mudarStatus(id, status, observacao) {
  if (USAR_API_REAL)
    return requisicao(`/api/solicitacoes/${id}/status`, {
      metodo: 'POST',
      corpo: { status, observacao },
    });
  return banco.responder(() => banco.mudarStatusSolicitacao(id, status, observacao));
}
