/**
 * Cliente HTTP único. Toda chamada ao backend passa por aqui (só no modo API real).
 *
 * Cuida de 4 coisas que todas as chamadas precisam:
 *  1. cookie de sessão  → credentials: 'include' (o navegador envia o cookie de login sozinho)
 *  2. proteção CSRF     → em POST/PUT/DELETE, copia o cookie XSRF-TOKEN para o header X-XSRF-TOKEN
 *  3. erros padronizados → o backend responde { title, detail, campos } (Problem Details)
 *  4. aviso de alteração → depois de gravar com sucesso, avisa as telas abertas (EVENTO_DADOS)
 *     para recarregarem suas listas sem piscar (ver hooks/useCarregar.js)
 */

import { MENSAGENS } from '../textos/mensagens';

/** Disparado em window depois de qualquer gravação bem-sucedida no backend. */
export const EVENTO_DADOS = 'abrigo:dados-alterados';
/** Disparado quando o login venceu no meio do uso (401): o contexto Sessao leva para o login. */
export const EVENTO_SESSAO_TERMINOU = 'abrigo:sessao-terminou';
const NAO_AVISA = ['/api/auth/', '/api/edicoes/'];

/**
 * Tipo do erro, que escolhe o aviso em textos/mensagens.js.
 * "semConexao": a requisição nem chegou (status 0), o proxy da hospedagem respondeu que o sistema
 * está fora (502/503/504) ou veio um 500 sem corpo (o proxy do Vite, em desenvolvimento, quando o
 * backend está desligado). Um 500 de verdade do Spring sempre traz corpo.
 */
export function tipoDoErro(status, corpo) {
  if (status === 0 || status === 502 || status === 503 || status === 504) return 'semConexao';
  if (status === 500 && !corpo) return 'semConexao';
  if (status === 401) return 'sessaoTerminou';
  if (status === 403) return 'semPermissao';
  if (status === 404) return 'naoEncontrado';
  if (status === 409) return 'conflito';
  if (status === 429) return 'muitasTentativas';
  return 'generico';
}

export class ErroApi extends Error {
  constructor(status, corpo) {
    const tipo = tipoDoErro(status, corpo);
    const padrao = MENSAGENS[tipo];
    // Regras de negócio (400/409/422...) vêm com uma frase pronta do backend, em português.
    // Falhas internas (5xx) nunca: o texto técnico (em inglês) não vai para a tela.
    const doBackend = status >= 400 && status < 500 ? corpo?.detail : null;
    super(doBackend || `${padrao.titulo}. ${padrao.texto}`);
    this.status = status;
    this.tipo = tipo;
    /** Erros por campo do formulário: { nome: 'Informe o nome' } */
    this.campos = corpo?.campos || {};
  }
}

function lerCookie(nome) {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith(nome + '='))
    ?.split('=')[1];
}

/** Garante que o cookie XSRF-TOKEN existe antes do primeiro POST. */
async function garantirCsrf() {
  if (!lerCookie('XSRF-TOKEN')) await fetch('/api/auth/csrf', { credentials: 'include' });
}

/**
 * @param {string} caminho  ex.: '/api/animais'
 * @param {{metodo?: string, corpo?: object, formulario?: FormData|URLSearchParams, keepalive?: boolean}} opcoes
 *   keepalive: a requisição sobrevive ao fechamento da página (usado para "saí da edição").
 */
export async function requisicao(caminho, { metodo = 'GET', corpo, formulario, keepalive } = {}) {
  const headers = { Accept: 'application/json' };
  if (corpo !== undefined) headers['Content-Type'] = 'application/json';
  if (metodo !== 'GET') {
    await garantirCsrf();
    const token = lerCookie('XSRF-TOKEN');
    if (token) headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }

  let resposta;
  try {
    resposta = await fetch(caminho, {
      method: metodo,
      headers,
      credentials: 'include',
      keepalive,
      body: formulario ?? (corpo !== undefined ? JSON.stringify(corpo) : undefined),
    });
  } catch {
    throw new ErroApi(0, null);
  }

  if (resposta.ok && metodo !== 'GET' && !NAO_AVISA.some((p) => caminho.startsWith(p))) {
    // login/logout: quem cuida da sessão é o contexto Sessao. Aviso de presença: é um sinal a
    // cada 30 s que não muda dado nenhum; avisar faria todas as listas recarregarem à toa.
    window.dispatchEvent(new Event(EVENTO_DADOS));
  }
  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (resposta.status === 401 && !caminho.startsWith('/api/auth/')) {
    window.dispatchEvent(new Event(EVENTO_SESSAO_TERMINOU));
  }
  if (!resposta.ok) throw new ErroApi(resposta.status, dados);
  return dados;
}

/** Monta a query string ignorando filtros vazios: { especie: 'CAO', idoso: null } → '?especie=CAO' */
export function query(params = {}) {
  const pares = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return pares.length ? '?' + new URLSearchParams(pares).toString() : '';
}
