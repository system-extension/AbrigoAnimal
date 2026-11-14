/** Login da equipe da ONG (sessão com cookie no backend). Visitantes não têm conta. */
import { requisicao, ErroApi } from './cliente';

/** Usuário logado ou null. */
export async function usuarioAtual() {
  try {
    return await requisicao('/api/auth/me');
  } catch (e) {
    if (e.status === 401) return null;
    throw e;
  }
}

export async function entrar(email, senha) {
  const form = new URLSearchParams({ username: email, password: senha });
  try {
    await requisicao('/api/auth/login', { metodo: 'POST', formulario: form });
  } catch (e) {
    if (e.status === 401) throw new ErroApi(401, { detail: 'E-mail ou senha incorretos.' });
    throw e;
  }
  return usuarioAtual();
}

/** Troca a senha de quem está logado. Precisa da senha atual. */
export async function trocarSenha(senhaAtual, novaSenha) {
  return requisicao('/api/auth/senha', { metodo: 'POST', corpo: { senhaAtual, novaSenha } });
}

export async function sair() {
  return requisicao('/api/auth/logout', { metodo: 'POST' });
}
