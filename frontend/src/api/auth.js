/** Login da equipe da ONG (sessão com cookie no backend). Visitantes não têm conta. */
import { USAR_API_REAL } from './config';
import { requisicao, ErroApi } from './cliente';
import { responder } from './mock/banco';

const SESSAO_DEMO = 'abrigo-demo-sessao';
export const LOGIN_DEMO = { email: 'equipe@abrigo.local', senha: 'abrigo123' };

/** Usuário logado ou null. */
export async function usuarioAtual() {
  if (USAR_API_REAL) {
    try {
      return await requisicao('/api/auth/me');
    } catch (e) {
      if (e.status === 401) return null;
      throw e;
    }
  }
  try {
    return await responder(JSON.parse(sessionStorage.getItem(SESSAO_DEMO)));
  } catch {
    return null;
  }
}

export async function entrar(email, senha) {
  if (USAR_API_REAL) {
    const form = new URLSearchParams({ username: email, password: senha });
    try {
      await requisicao('/api/auth/login', { metodo: 'POST', formulario: form });
    } catch (e) {
      if (e.status === 401) throw new ErroApi(401, { detail: 'E-mail ou senha incorretos.' });
      throw e;
    }
    return usuarioAtual();
  }
  if (email.trim().toLowerCase() !== LOGIN_DEMO.email || senha !== LOGIN_DEMO.senha) {
    await responder();
    throw new ErroApi(401, { detail: 'E-mail ou senha incorretos.' });
  }
  const usuario = { id: 'demo', nome: 'Equipe do Abrigo', email: LOGIN_DEMO.email, ativo: true };
  try {
    sessionStorage.setItem(SESSAO_DEMO, JSON.stringify(usuario));
  } catch {
    /* sem armazenamento: a sessão dura até recarregar */
  }
  return responder(usuario);
}

export async function sair() {
  if (USAR_API_REAL) return requisicao('/api/auth/logout', { metodo: 'POST' });
  try {
    sessionStorage.removeItem(SESSAO_DEMO);
  } catch {
    /* nada a fazer */
  }
  return responder();
}
