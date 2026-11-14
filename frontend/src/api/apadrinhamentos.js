/** Vínculos padrinho ↔ animal (N:N). Exige login. */
import { requisicao, query } from './cliente';

/** Passe animalId (padrinhos do animal) OU pessoaId (afilhados da pessoa). */
export async function listar({ animalId, pessoaId }) {
  return requisicao('/api/apadrinhamentos' + query({ animalId, pessoaId }));
}

/** { pessoaId, animalId, tipoApoio: AFETIVO|FINANCEIRO|AMBOS, dataInicio?, observacoes? } */
export async function criar(dados) {
  return requisicao('/api/apadrinhamentos', { metodo: 'POST', corpo: dados });
}

export async function encerrar(id, dataFim) {
  return requisicao(`/api/apadrinhamentos/${id}/encerrar`, {
    metodo: 'POST',
    corpo: { dataFim },
  });
}
