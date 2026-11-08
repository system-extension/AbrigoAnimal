/**
 * Tradução dos códigos do backend (enums) para o texto que aparece na tela.
 * Um lugar só: se o backend mudar um nome, muda aqui.
 */

export const ESPECIES = [
  { valor: 'CAO', rotulo: 'Cão', plural: 'Cães', icone: 'fa-dog' },
  { valor: 'GATO', rotulo: 'Gato', plural: 'Gatos', icone: 'fa-cat' },
];

export const SEXOS = [
  { valor: 'MACHO', rotulo: 'Macho', icone: 'fa-mars' },
  { valor: 'FEMEA', rotulo: 'Fêmea', icone: 'fa-venus' },
  { valor: 'INDEFINIDO', rotulo: 'Não sei', icone: 'fa-question' },
];

export const SITUACOES = [
  { valor: 'DISPONIVEL', rotulo: 'Disponível', cor: 'verde' },
  { valor: 'EM_TRATAMENTO', rotulo: 'Em tratamento', cor: 'amarelo' },
  { valor: 'ADOTADO', rotulo: 'Adotado', cor: 'azul' },
  { valor: 'OBITO', rotulo: 'Óbito', cor: 'cinza' },
];

export const PORTES = [
  { valor: 'PEQUENO', rotulo: 'Pequeno' },
  { valor: 'MEDIO', rotulo: 'Médio' },
  { valor: 'GRANDE', rotulo: 'Grande' },
];

export const TEMPERAMENTOS = [
  'Dócil',
  'Brincalhão',
  'Calmo',
  'Tímido',
  'Agitado',
  'Carente',
  'Bom com cães',
  'Bom com gatos',
  'Bom com crianças',
];

/** Alas como nas planilhas da ONG (um arquivo por ala). O Asilo Osnilda é outro endereço. */
export const ALAS = ['Ala A', 'Ala B', 'Ala C', 'Asilo Abrigo', 'Asilo Osnilda'];

export const CORES_COMUNS = [
  'Caramelo',
  'Preto',
  'Branco',
  'Marrom',
  'Tricolor',
  'Rajado',
  'Cinza',
];

/** Vacinas registradas no cadastro (TipoVacina no backend). Só QUAIS tomou, sem gestão de doses. */
export const VACINAS = [
  { valor: 'V8_V10', rotulo: 'V8/V10' },
  { valor: 'ANTIRRABICA', rotulo: 'Antirrábica' },
  { valor: 'VERMIFUGO', rotulo: 'Vermífugo' },
  { valor: 'GRIPE_CANINA', rotulo: 'Gripe canina' },
  { valor: 'V3_V4', rotulo: 'V3/V4 (gatos)' },
];

/** Castrado: null = a ONG ainda não sabe (melhor não afirmar nada na vitrine). */
export const CASTRADO = [
  { valor: true, rotulo: 'Sim' },
  { valor: false, rotulo: 'Não' },
];

export const TIPOS_APOIO = [
  { valor: 'AFETIVO', rotulo: 'Afetivo', descricao: 'Visitas, passeios e carinho' },
  { valor: 'FINANCEIRO', rotulo: 'Financeiro', descricao: 'Contribuição livre' },
  { valor: 'AMBOS', rotulo: 'Afetivo e financeiro', descricao: 'Os dois' },
];

export const TIPOS_SOLICITACAO = [
  { valor: 'APADRINHAR', rotulo: 'Apadrinhar' },
  { valor: 'ADOTAR', rotulo: 'Adotar' },
  { valor: 'OUTRO', rotulo: 'Outro assunto' },
];

export const STATUS_SOLICITACAO = [
  { valor: 'NOVA', rotulo: 'Nova', cor: 'laranja' },
  { valor: 'EM_CONTATO', rotulo: 'Em contato', cor: 'azul' },
  { valor: 'CONCLUIDA', rotulo: 'Concluída', cor: 'verde' },
  { valor: 'DESCARTADA', rotulo: 'Descartada', cor: 'cinza' },
];

/** Busca o rótulo de um código numa das listas acima. */
export const rotulo = (lista, valor) => lista.find((i) => i.valor === valor)?.rotulo ?? valor ?? '';

/** "8 anos", "1 ano", "Filhote" */
export function textoIdade(idadeAnos) {
  if (idadeAnos === null || idadeAnos === undefined) return 'Idade não informada';
  if (idadeAnos < 1) return 'Filhote';
  return idadeAnos === 1 ? '1 ano' : `${idadeAnos} anos`;
}

/** Converte "idade aproximada em anos" na data estimada que o backend guarda. */
export function dataPorIdade(anos) {
  if (anos === '' || anos === null || anos === undefined) return null;
  const d = new Date();
  if (Number(anos) === 0) d.setMonth(d.getMonth() - 6);
  else d.setFullYear(d.getFullYear() - Number(anos));
  return d.toISOString().slice(0, 10);
}

/** Caminho inverso: data estimada → anos completos. */
export function idadePorData(data) {
  if (!data) return null;
  const nasc = new Date(data + 'T12:00:00');
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const fezAniversario =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
  if (!fezAniversario) anos -= 1;
  return Math.max(anos, 0);
}
