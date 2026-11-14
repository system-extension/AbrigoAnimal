/** Formulário público de interesse + caixa de solicitações da equipe. */
import { requisicao, query } from './cliente';

/**
 * Envia o formulário "quero apadrinhar / quero adotar". Não exige conta.
 * @param {{tipo: 'APADRINHAR'|'ADOTAR'|'OUTRO', animalSlug?: string, nome: string,
 *          telefone?: string, email?: string, mensagem?: string, consentimento: boolean, site: string}} form
 * `site` é a isca para robôs: precisa ir vazio.
 */
export async function enviarInteresse(form) {
  return requisicao('/api/public/solicitacoes', { metodo: 'POST', corpo: form });
}

/** Caixa de solicitações (painel). status opcional: NOVA, EM_CONTATO, CONCLUIDA, DESCARTADA */
export async function listarSolicitacoes({ status, pagina = 0, tamanho = 50 } = {}) {
  return requisicao('/api/solicitacoes' + query({ status, pagina, tamanho }));
}

export async function mudarStatus(id, status, observacao) {
  return requisicao(`/api/solicitacoes/${id}/status`, {
    metodo: 'POST',
    corpo: { status, observacao },
  });
}
