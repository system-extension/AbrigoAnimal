/** Usuários da equipe (quem entra no painel). Exige login. Todos têm o mesmo acesso. */
import { requisicao } from './cliente';

/** Lista completa, por nome: [{ id, nome, email, ativo }] */
export async function listar() {
  return requisicao('/api/usuarios');
}

/** { nome, email, senha } — a senha inicial é combinada com a pessoa. */
export async function criar(dados) {
  return requisicao('/api/usuarios', { metodo: 'POST', corpo: dados });
}

export async function desativar(id) {
  return requisicao(`/api/usuarios/${id}/desativar`, { metodo: 'POST' });
}

export async function reativar(id) {
  return requisicao(`/api/usuarios/${id}/reativar`, { metodo: 'POST' });
}

/** Libera um colega barrado por senhas erradas (não vale para o administrador). */
export async function desbloquear(id) {
  return requisicao(`/api/usuarios/${id}/desbloquear`, { metodo: 'POST' });
}

/** Senha provisória para um colega que esqueceu a dele. A própria senha usa auth.trocarSenha. */
export async function redefinirSenha(id, novaSenha) {
  return requisicao(`/api/usuarios/${id}/senha`, { metodo: 'POST', corpo: { novaSenha } });
}
