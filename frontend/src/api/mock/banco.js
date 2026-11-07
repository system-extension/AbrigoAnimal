/**
 * "Backend de mentira" do modo demonstração.
 * Imita as regras e os formatos do Spring (mesmos nomes de campos e de erros),
 * para que trocar para a API real não exija mudar nenhuma tela.
 * Os dados ficam só neste navegador (localStorage).
 */
import { ATRASO_MOCK_MS } from '../config';
import { ErroApi } from '../cliente';
import { idadePorData } from '../rotulos';
import { novoId } from '../../utils/id';
import { carregarFotos, urlDaFoto, salvarFoto, removerFoto as apagarFoto } from './fotos';
import {
  ANIMAIS_INICIAIS,
  PESSOAS_INICIAIS,
  APADRINHAMENTOS_INICIAIS,
  SOLICITACOES_INICIAIS,
  VIDEOS_INICIAIS,
} from './dados-iniciais';

const CHAVE = 'abrigo-demo-v2';
export const EVENTO_DADOS = 'abrigo:dados-alterados';

function inicial() {
  return {
    animais: ANIMAIS_INICIAIS,
    pessoas: PESSOAS_INICIAIS,
    apadrinhamentos: APADRINHAMENTOS_INICIAIS,
    solicitacoes: SOLICITACOES_INICIAIS,
  };
}

function ler() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo?.animais) return salvo;
  } catch {
    /* recomeça com os exemplos */
  }
  return inicial();
}

let estado = ler();

function gravar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* modo privado ou armazenamento cheio: segue só em memória */
  }
  window.dispatchEvent(new Event(EVENTO_DADOS));
}

/** Apaga as alterações e volta aos exemplos. */
export function restaurarDemonstracao() {
  estado = inicial();
  gravar();
}

/**
 * Espera um pouco (como a rede) e devolve uma cópia (como um JSON novo).
 * Recebe uma FUNÇÃO: ela só roda depois que as fotos salvas no navegador foram carregadas.
 * Erros lançados dentro dela viram promessa rejeitada, como numa chamada HTTP.
 */
export async function responder(gerar = () => null) {
  await carregarFotos();
  await new Promise((r) => setTimeout(r, ATRASO_MOCK_MS));
  const valor = typeof gerar === 'function' ? await gerar() : gerar;
  return valor === undefined ? null : structuredClone(valor);
}

const id = () => novoId();
const agora = () => new Date().toISOString();

const naoEncontrado = (o) => new ErroApi(404, { detail: `${o} não encontrado.` });
const regra = (detail, campos) => new ErroApi(422, { detail, campos });

function slugDe(nome) {
  const base = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base || 'animal'}-${id().slice(0, 6)}`;
}

function paginar(lista, pagina = 0, tamanho = 20) {
  const p = Number(pagina) || 0;
  const t = Number(tamanho) || 20;
  return {
    itens: lista.slice(p * t, (p + 1) * t),
    pagina: p,
    tamanho: t,
    total: lista.length,
    totalPaginas: Math.max(1, Math.ceil(lista.length / t)),
  };
}

const normal = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/* ---------------------------- ANIMAIS ---------------------------- */

const fotosVisiveis = (a) =>
  a.fotos.map((f) => ({ ...f, url: urlDaFoto(f.url) })).filter((f) => f.url);
const fotoPrincipal = (a) => fotosVisiveis(a).find((f) => f.principal)?.url ?? null;

export const naVitrine = (a) => a.visivelNaVitrine && a.situacao !== 'OBITO';

/** Formato do backend: AnimalDetalhe */
export function detalhe(a) {
  return { ...a, idadeAnos: idadePorData(a.dataNascimentoEstimada), fotos: fotosVisiveis(a) };
}

/** Formato do backend: AnimalListagem */
export function listagem(a) {
  return {
    id: a.id,
    nome: a.nome,
    especie: a.especie,
    sexo: a.sexo,
    situacao: a.situacao,
    idoso: a.idoso,
    ala: a.ala,
    canil: a.canil,
    visivelNaVitrine: a.visivelNaVitrine,
    fotoPrincipal: fotoPrincipal(a),
    idadeAnos: idadePorData(a.dataNascimentoEstimada),
    padrinhos: estado.apadrinhamentos.filter((p) => p.animalId === a.id && !p.dataFim).length,
  };
}

/** Formato do backend: AnimalPublicoResponse (nada de chip, canil, ala, id) */
export function publico(a) {
  return {
    nome: a.nome,
    slug: a.slug,
    especie: a.especie,
    sexo: a.sexo,
    cor: a.cor,
    idadeAnos: idadePorData(a.dataNascimentoEstimada),
    castrado: a.castrado,
    idoso: a.idoso,
    medicacaoContinua: a.medicacaoContinua,
    descricao: a.descricao,
    medicacoes: a.medicacoes,
    condicoesSaude: a.condicoesSaude,
    // backend: true = V8 e raiva em dia; false = alguma vencida; null = sem registro
    vacinasEmDia: a.vacinas ? true : null,
    disponivelParaAdocao: a.situacao === 'DISPONIVEL',
    fotoPrincipal: fotoPrincipal(a),
    fotos: fotosVisiveis(a).map((f) => f.url),
    porte: a.porte,
    temperamento: a.temperamento,
    videos: videosPublicos(a.id),
  };
}

/* ----------------------------- VÍDEOS ----------------------------- */

/**
 * Formato proposto para GET /api/public/videos (ADR-005, ainda não existe no backend):
 * { id, titulo, youtubeId, animalNome, animalSlug } — aqui com `arquivo` e `poster` só para a demonstração.
 */
export function videosPublicos(animalId) {
  // Vídeos de exemplo são fixos (não ficam salvos no navegador).
  return VIDEOS_INICIAIS.filter((v) => !animalId || v.animalId === animalId)
    .map((v) => ({ v, a: estado.animais.find((x) => x.id === v.animalId) }))
    .filter(({ a }) => a && naVitrine(a))
    .map(({ v, a }) => ({
      id: v.id,
      titulo: v.titulo,
      youtubeId: v.youtubeId,
      arquivo: v.arquivo,
      poster: v.poster,
      animalNome: a.nome,
      animalSlug: a.slug,
    }));
}

export function animais() {
  return estado.animais;
}

export function animalPorId(animalId) {
  const a = estado.animais.find((x) => x.id === animalId);
  if (!a) throw naoEncontrado('Animal');
  return a;
}

export function animalPorSlug(slug) {
  const a = estado.animais.find((x) => x.slug === slug && naVitrine(x));
  if (!a) throw naoEncontrado('Animal');
  return a;
}

export function filtrarAnimais(lista, { busca, especie, sexo, situacao, ala, idoso }) {
  const b = normal(busca);
  return lista.filter(
    (a) =>
      (!b || normal(a.nome).includes(b) || normal(a.chip).includes(b)) &&
      (!especie || a.especie === especie) &&
      (!sexo || a.sexo === sexo) &&
      (!situacao || a.situacao === situacao) &&
      (!ala || a.ala === ala) &&
      (idoso === undefined || idoso === null || idoso === '' || String(a.idoso) === String(idoso)),
  );
}

export { paginar };

function validarAnimal(dados) {
  const campos = {};
  if (!dados.nome?.trim()) campos.nome = 'Informe o nome';
  if (!dados.especie) campos.especie = 'Informe a espécie';
  if (dados.dataNascimentoEstimada && dados.dataNascimentoEstimada > agora().slice(0, 10))
    campos.dataNascimentoEstimada = 'A data de nascimento não pode ser futura';
  if (Object.keys(campos).length) throw new ErroApi(400, { detail: 'Confira os campos', campos });
  if (
    dados.chip?.trim() &&
    estado.animais.some((a) => a.chip === dados.chip.trim() && a.id !== dados.id)
  )
    throw regra('Já existe um animal com este chip.', { chip: 'Chip já cadastrado' });
}

const CAMPOS_ANIMAL = [
  'nome',
  'especie',
  'sexo',
  'cor',
  'dataNascimentoEstimada',
  'castrado',
  'chip',
  'canil',
  'ala',
  'idoso',
  'medicacaoContinua',
  'descricao',
  'medicacoes',
  'condicoesSaude',
  'vacinas',
  'porte',
  'temperamento',
];
const recortar = (dados) => Object.fromEntries(CAMPOS_ANIMAL.map((c) => [c, dados[c] ?? null]));

export function criarAnimal(dados) {
  validarAnimal(dados);
  const a = {
    id: id(),
    versao: 0,
    slug: slugDe(dados.nome),
    situacao: 'DISPONIVEL',
    dataObito: null,
    visivelNaVitrine: true,
    fotos: [],
    criadoEm: agora(),
    atualizadoEm: agora(),
    atualizadoPor: 'você (demonstração)',
    ...recortar(dados),
    nome: dados.nome.trim(),
    castrado: Boolean(dados.castrado),
    idoso: Boolean(dados.idoso),
    medicacaoContinua: Boolean(dados.medicacaoContinua),
    temperamento: dados.temperamento ?? [],
  };
  estado.animais = [a, ...estado.animais];
  gravar();
  return a;
}

export function editarAnimal(animalId, dados) {
  const a = animalPorId(animalId);
  if (dados.versao !== undefined && dados.versao !== a.versao)
    throw new ErroApi(409, {
      detail: 'Outra pessoa salvou este animal enquanto você editava. Recarregue para ver.',
    });
  validarAnimal({ ...dados, id: animalId });
  Object.assign(a, recortar(dados), {
    nome: dados.nome.trim(),
    castrado: Boolean(dados.castrado),
    idoso: Boolean(dados.idoso),
    medicacaoContinua: Boolean(dados.medicacaoContinua),
    temperamento: dados.temperamento ?? [],
    versao: a.versao + 1,
    atualizadoEm: agora(),
    atualizadoPor: 'você (demonstração)',
  });
  gravar();
  return a;
}

export function mudarSituacao(animalId, situacao) {
  const a = animalPorId(animalId);
  if (a.situacao === 'OBITO') throw regra('Óbito é definitivo: a situação não pode mudar.');
  a.situacao = situacao;
  a.versao += 1;
  gravar();
  return a;
}

export function registrarObito(animalId, data) {
  const a = animalPorId(animalId);
  a.situacao = 'OBITO';
  a.dataObito = data || agora().slice(0, 10);
  a.visivelNaVitrine = false;
  a.versao += 1;
  gravar();
  return a;
}

export function definirVitrine(animalId, visivel) {
  const a = animalPorId(animalId);
  if (visivel && a.situacao === 'OBITO') throw regra('Animal em óbito não volta para a vitrine.');
  a.visivelNaVitrine = visivel;
  a.versao += 1;
  gravar();
  return a;
}

export async function adicionarFoto(animalId, arquivo) {
  const a = animalPorId(animalId);
  if (a.fotos.length >= 10) throw regra('Máximo de 10 fotos por animal.');
  const fotoId = id();
  await salvarFoto(fotoId, arquivo);
  a.fotos.push({ id: fotoId, url: `idb:${fotoId}`, principal: a.fotos.length === 0 });
  a.versao += 1;
  gravar();
  return a;
}

export async function removerFoto(animalId, fotoId) {
  const a = animalPorId(animalId);
  const f = a.fotos.find((x) => x.id === fotoId);
  if (!f) throw naoEncontrado('Foto');
  a.fotos = a.fotos.filter((x) => x.id !== fotoId);
  if (f.principal && a.fotos[0]) a.fotos[0].principal = true;
  if (f.url.startsWith('idb:')) await apagarFoto(fotoId);
  a.versao += 1;
  gravar();
  return a;
}

export function fotoPrincipalDefinir(animalId, fotoId) {
  const a = animalPorId(animalId);
  a.fotos = a.fotos.map((f) => ({ ...f, principal: f.id === fotoId }));
  a.versao += 1;
  gravar();
  return a;
}

/* ---------------------------- PESSOAS ---------------------------- */

export function pessoas(busca) {
  const b = normal(busca);
  return estado.pessoas
    .filter(
      (p) =>
        !b ||
        normal(p.nome).includes(b) ||
        normal(p.email).includes(b) ||
        normal(p.telefone)
          .replace(/\D/g, '')
          .includes(b.replace(/\D/g, '') || '§'),
    )
    .sort((a, b2) => a.nome.localeCompare(b2.nome));
}

export function pessoaPorId(pessoaId) {
  const p = estado.pessoas.find((x) => x.id === pessoaId);
  if (!p) throw naoEncontrado('Pessoa');
  return p;
}

export function salvarPessoa(dados, pessoaId) {
  if (!dados.nome?.trim())
    throw new ErroApi(400, { detail: 'Confira os campos', campos: { nome: 'Informe o nome' } });
  if (!dados.telefone?.trim() && !dados.email?.trim())
    throw regra('Informe ao menos um telefone ou e-mail.', {
      telefone: 'Informe telefone ou e-mail',
    });
  if (pessoaId) {
    const p = pessoaPorId(pessoaId);
    Object.assign(p, dados, { versao: p.versao + 1 });
    gravar();
    return p;
  }
  const p = {
    id: id(),
    versao: 0,
    cpf: null,
    endereco: null,
    observacoes: '',
    criadoEm: agora(),
    atualizadoPor: 'você (demonstração)',
    ...dados,
    consentimentoEm: dados.consentimento ? agora() : null,
  };
  estado.pessoas.push(p);
  gravar();
  return p;
}

/* ------------------------- APADRINHAMENTOS ------------------------ */

export function apadrinhamentos({ animalId, pessoaId } = {}) {
  return estado.apadrinhamentos
    .filter((x) => (!animalId || x.animalId === animalId) && (!pessoaId || x.pessoaId === pessoaId))
    .map((x) => ({
      ...x,
      ativo: !x.dataFim,
      pessoaNome: estado.pessoas.find((p) => p.id === x.pessoaId)?.nome ?? '—',
      animalNome: estado.animais.find((a) => a.id === x.animalId)?.nome ?? '—',
    }));
}

export function apadrinhar({ pessoaId, animalId, tipoApoio, dataInicio, observacoes }) {
  pessoaPorId(pessoaId);
  const animal = animalPorId(animalId);
  if (animal.situacao === 'OBITO') throw regra('Não é possível apadrinhar um animal em óbito.');
  if (
    estado.apadrinhamentos.some(
      (x) => x.pessoaId === pessoaId && x.animalId === animalId && !x.dataFim,
    )
  )
    throw regra('Esta pessoa já é madrinha/padrinho deste animal.');
  const novo = {
    id: id(),
    pessoaId,
    animalId,
    tipoApoio: tipoApoio || 'AFETIVO',
    dataInicio: dataInicio || agora().slice(0, 10),
    dataFim: null,
    observacoes: observacoes || '',
  };
  estado.apadrinhamentos.push(novo);
  gravar();
  return novo;
}

export function encerrarApadrinhamento(apId, dataFim) {
  const x = estado.apadrinhamentos.find((a) => a.id === apId);
  if (!x) throw naoEncontrado('Apadrinhamento');
  x.dataFim = dataFim || agora().slice(0, 10);
  gravar();
  return x;
}

/* -------------------------- SOLICITAÇÕES -------------------------- */

export function solicitacoes(status) {
  return estado.solicitacoes
    .filter((s) => !status || s.status === status)
    .sort((a, b) => b.recebidaEm.localeCompare(a.recebidaEm))
    .map((s) => ({
      ...s,
      animalNome: estado.animais.find((a) => a.id === s.animalId)?.nome ?? null,
    }));
}

export function receberSolicitacao(form) {
  if (form.site) return { protocolo: id() }; // robô: finge que deu certo e descarta
  const campos = {};
  if (!form.nome?.trim()) campos.nome = 'Informe seu nome';
  if (!form.telefone?.trim() && !form.email?.trim()) campos.telefone = 'Informe telefone ou e-mail';
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) campos.email = 'E-mail inválido';
  if (!form.consentimento) campos.consentimento = 'É preciso autorizar o uso dos dados';
  if (Object.keys(campos).length) throw new ErroApi(400, { detail: 'Confira os campos', campos });
  const animal = form.animalSlug ? estado.animais.find((a) => a.slug === form.animalSlug) : null;
  const s = {
    id: id(),
    tipo: form.tipo,
    animalId: animal?.id ?? null,
    nome: form.nome.trim(),
    telefone: form.telefone?.trim() || '',
    email: form.email?.trim() || '',
    mensagem: form.mensagem?.trim() || '',
    status: 'NOVA',
    observacaoInterna: '',
    recebidaEm: agora(),
  };
  estado.solicitacoes.push(s);
  gravar();
  return { protocolo: s.id };
}

export function mudarStatusSolicitacao(sId, status, observacao) {
  const s = estado.solicitacoes.find((x) => x.id === sId);
  if (!s) throw naoEncontrado('Solicitação');
  s.status = status;
  if (observacao !== undefined) s.observacaoInterna = observacao;
  gravar();
  return s;
}
