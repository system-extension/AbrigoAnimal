/** Vínculos padrinho ↔ animal (N:N). Exige login. */
import { USAR_API_REAL } from './config';
import { requisicao, query } from './cliente';
import * as banco from './mock/banco';

/** Passe animalId (padrinhos do animal) OU pessoaId (afilhados da pessoa). */
export async function listar({ animalId, pessoaId }) {
  if (USAR_API_REAL) return requisicao('/api/apadrinhamentos' + query({ animalId, pessoaId }));
  return banco.responder(() => banco.apadrinhamentos({ animalId, pessoaId }));
}

/** { pessoaId, animalId, tipoApoio: AFETIVO|FINANCEIRO|AMBOS, dataInicio?, observacoes? } */
export async function criar(dados) {
  if (USAR_API_REAL) return requisicao('/api/apadrinhamentos', { metodo: 'POST', corpo: dados });
  return banco.responder(() => banco.apadrinhar(dados));
}

export async function encerrar(id, dataFim) {
  if (USAR_API_REAL)
    return requisicao(`/api/apadrinhamentos/${id}/encerrar`, {
      metodo: 'POST',
      corpo: { dataFim },
    });
  return banco.responder(() => banco.encerrarApadrinhamento(id, dataFim));
}
