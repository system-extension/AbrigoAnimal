/** Cadastro único de pessoas (padrinhos hoje, adotantes na Fase 2). Exige login. */
import { requisicao, query } from './cliente';

export async function listar({ busca, pagina = 0, tamanho = 100 } = {}) {
  return requisicao('/api/pessoas' + query({ busca, pagina, tamanho }));
}

export async function buscar(id) {
  return requisicao(`/api/pessoas/${id}`);
}

/** dados: { nome, telefone?, email?, cpf?, endereco?, observacoes?, consentiu } */
export async function salvar(dados, id) {
  return requisicao(id ? `/api/pessoas/${id}` : '/api/pessoas', {
    metodo: id ? 'PUT' : 'POST',
    corpo: dados,
  });
}
