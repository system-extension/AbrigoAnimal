/** Cadastro único de pessoas (padrinhos hoje, adotantes na Fase 2). Exige login. */
import { USAR_API_REAL } from './config';
import { requisicao, query } from './cliente';
import * as banco from './mock/banco';

export async function listar({ busca, pagina = 0, tamanho = 100 } = {}) {
  if (USAR_API_REAL) return requisicao('/api/pessoas' + query({ busca, pagina, tamanho }));
  return banco.responder(() => banco.paginar(banco.pessoas(busca), pagina, tamanho));
}

export async function buscar(id) {
  if (USAR_API_REAL) return requisicao(`/api/pessoas/${id}`);
  return banco.responder(() => banco.pessoaPorId(id));
}

/** dados: { nome, telefone?, email?, cpf?, endereco?, observacoes?, consentimento } */
export async function salvar(dados, id) {
  if (USAR_API_REAL)
    return requisicao(id ? `/api/pessoas/${id}` : '/api/pessoas', {
      metodo: id ? 'PUT' : 'POST',
      corpo: dados,
    });
  return banco.responder(() => banco.salvarPessoa(dados, id));
}
