/** Aviso de presença: quem está com um cadastro aberto para edição (ADR 0014). Exige login. */
import { requisicao } from './cliente';

/** "Continuo editando". Devolve quem MAIS está editando: [{ nome, desde }]. */
export async function sinalizar(recurso, id) {
  return requisicao(`/api/edicoes/${recurso}/${id}`, { metodo: 'POST' });
}

/** Saí da edição. keepalive: chega ao servidor mesmo se a página estiver fechando. */
export async function sair(recurso, id) {
  return requisicao(`/api/edicoes/${recurso}/${id}`, { metodo: 'DELETE', keepalive: true });
}
