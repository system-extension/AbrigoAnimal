/**
 * TEXTOS DE AVISO DO SISTEMA, num lugar só.
 *
 * Pode editar à vontade: título, texto e ícone de cada situação. Só não mude os NOMES à esquerda
 * (semConexao, sessaoTerminou...), porque o código procura por eles.
 *
 * Ícones: nomes do Font Awesome 6 (versão gratuita, estilo "solid"), em
 * https://fontawesome.com/search?o=r&m=free&s=solid — use o nome com "fa-" na frente.
 *
 * Regra de ouro: quem usa o sistema não é técnico. Diga o que aconteceu e o que a pessoa pode
 * fazer, sem códigos nem palavras como "servidor", "erro 500" ou "requisição".
 */
export const MENSAGENS = {
  /** O sistema não respondeu: internet caiu, ou o sistema está fora do ar/reiniciando. */
  semConexao: {
    icone: 'fa-plug-circle-exclamation',
    titulo: 'Estamos sem conexão com o sistema',
    texto:
      'Pode ser a sua internet ou o sistema passando por manutenção. Vamos tentar de novo sozinhos em alguns segundos.',
  },

  /** Login venceu (8 horas) ou o sistema reiniciou: a pessoa precisa entrar de novo. */
  sessaoTerminou: {
    icone: 'fa-door-open',
    titulo: 'Sua sessão terminou',
    texto: 'Por segurança, entre de novo para continuar de onde parou.',
  },

  semPermissao: {
    icone: 'fa-lock',
    titulo: 'Você não tem permissão para isso',
    texto: 'Se precisar, fale com o administrador da equipe.',
  },

  naoEncontrado: {
    icone: 'fa-magnifying-glass',
    titulo: 'Não encontramos o que você procurou',
    texto: 'O endereço pode estar errado ou o cadastro foi removido.',
  },

  /** Página pública de um animal que saiu da vitrine (adotado, escondido) ou link errado. */
  animalForaDaVitrine: {
    icone: 'fa-house-chimney',
    titulo: 'Este animal não está mais na vitrine',
    texto: 'Talvez ele já tenha encontrado um lar! Conheça os outros que esperam por uma família.',
  },

  conflito: {
    icone: 'fa-user-pen',
    titulo: 'Outra pessoa alterou este cadastro',
    texto: 'Recarregue a página para ver a versão mais recente.',
  },

  muitasTentativas: {
    icone: 'fa-hourglass-half',
    titulo: 'Muitas tentativas seguidas',
    texto: 'Aguarde alguns minutos e tente de novo.',
  },

  /** Qualquer outra falha inesperada. */
  generico: {
    icone: 'fa-circle-exclamation',
    titulo: 'Algo não saiu como esperado',
    texto: 'Tente de novo. Se continuar acontecendo, avise o responsável pelo sistema.',
  },

  /** Botões e textos curtos usados junto dos avisos. */
  botaoTentarDeNovo: 'Tentar de novo',
  tentandoDeNovo: 'Tentando de novo…',
  botaoEntrar: 'Entrar de novo',
  botaoVerOutrosAnimais: 'Ver outros animais',
};
