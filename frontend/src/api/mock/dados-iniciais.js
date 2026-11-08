/**
 * Dados de exemplo do modo demonstração. Fotos reais do mural do abrigo.
 * Gatos ficam sem foto de propósito: mostram como a tela se comporta sem foto.
 */
import mural1 from '../../assets/img/mural-1.webp';
import mural2 from '../../assets/img/mural-2.webp';
import mural3 from '../../assets/img/mural-3.webp';
import mural4 from '../../assets/img/mural-4.webp';
import gravata from '../../assets/img/hero-cao-gravata.webp';
import video1 from '../../assets/videos-demo/video-1.mp4';
import video2 from '../../assets/videos-demo/video-2.mp4';
import video3 from '../../assets/videos-demo/video-3.mp4';
import video4 from '../../assets/videos-demo/video-4.mp4';
import video5 from '../../assets/videos-demo/video-5.mp4';
import poster1 from '../../assets/videos-demo/poster-1.webp';
import poster2 from '../../assets/videos-demo/poster-2.webp';
import poster3 from '../../assets/videos-demo/poster-3.webp';
import poster4 from '../../assets/videos-demo/poster-4.webp';
import poster5 from '../../assets/videos-demo/poster-5.webp';

const anosAtras = (anos) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - anos);
  return d.toISOString().slice(0, 10);
};

const base = (id, campos) => ({
  id,
  versao: 0,
  especie: 'CAO',
  sexo: 'MACHO',
  cor: '',
  dataNascimentoEstimada: null,
  castrado: true,
  chip: '',
  canil: '',
  ala: '',
  idoso: false,
  medicacaoContinua: false,
  descricao: '',
  medicacoes: '',
  condicoesSaude: '',
  vacinas: [
    { tipo: 'ANTIRRABICA', ultimaDose: null },
    { tipo: 'V8_V10', ultimaDose: null },
  ],
  porte: null,
  temperamento: [],
  situacao: 'DISPONIVEL',
  dataObito: null,
  visivelNaVitrine: true,
  fotos: [],
  criadoEm: '2026-09-28T12:00:00Z',
  atualizadoEm: '2026-09-28T12:00:00Z',
  atualizadoPor: 'demonstracao',
  ...campos,
});

/**
 * As fotos de exemplo são guardadas como 'demo:<nome>' e só viram URL na hora de exibir.
 * Assim, uma nova versão do site (com nomes de arquivo novos) não quebra os dados salvos no navegador.
 */
export const FOTOS_DEMO = { mural1, mural2, mural3, mural4, gravata };
const foto = (id, nome) => ({ id, url: `demo:${nome}`, principal: false });

export const ANIMAIS_INICIAIS = [
  base('a-thor', {
    nome: 'Thor',
    slug: 'thor-a1',
    cor: 'Marrom',
    dataNascimentoEstimada: anosAtras(11),
    idoso: true,
    medicacaoContinua: true,
    medicacoes: 'Anti-inflamatório para as articulações, 1x ao dia',
    condicoesSaude: 'Artrose leve: prefere caminhadas curtas',
    descricao:
      'Thor é um senhor tranquilo que adora um cantinho ao sol. Caminha devagar, mas não dispensa um passeio e um carinho atrás da orelha.',
    porte: 'GRANDE',
    temperamento: ['Calmo', 'Dócil', 'Carente'],
    ala: 'Ala B',
    canil: '14',
    fotos: [foto('f-thor', 'mural2')],
  }),
  base('a-mel', {
    nome: 'Mel',
    slug: 'mel-b2',
    sexo: 'FEMEA',
    cor: 'Caramelo',
    dataNascimentoEstimada: anosAtras(3),
    descricao:
      'Mel é curiosa e muito sociável. Adora brincar com bolinhas e se dá bem com outros cães.',
    porte: 'MEDIO',
    temperamento: ['Brincalhão', 'Bom com cães'],
    ala: 'Ala A',
    canil: '3',
    fotos: [foto('f-mel', 'mural1')],
  }),
  base('a-bento', {
    nome: 'Bento',
    slug: 'bento-c3',
    cor: 'Caramelo',
    dataNascimentoEstimada: anosAtras(9),
    idoso: true,
    medicacaoContinua: true,
    medicacoes: 'Remédio para o coração, 2x ao dia',
    descricao:
      'Bento é carinhoso e gosta de companhia. Está há anos no abrigo esperando alguém que queira passar tempo com ele.',
    porte: 'MEDIO',
    temperamento: ['Dócil', 'Carente'],
    ala: 'Ala C',
    canil: '21',
    fotos: [foto('f-bento', 'mural4')],
  }),
  base('a-nina', {
    nome: 'Nina',
    slug: 'nina-d4',
    sexo: 'FEMEA',
    cor: 'Caramelo',
    dataNascimentoEstimada: anosAtras(2),
    descricao: 'Nina é esperta, atenta e muito companheira. Aprende rápido e ama um petisco.',
    porte: 'PEQUENO',
    temperamento: ['Brincalhão', 'Bom com crianças'],
    ala: 'Ala A',
    canil: '6',
    fotos: [foto('f-nina', 'mural3')],
  }),
  base('a-gravata', {
    nome: 'Pingo',
    slug: 'pingo-e5',
    cor: 'Branco e preto',
    dataNascimentoEstimada: anosAtras(8),
    idoso: true,
    descricao: 'Pingo é o rei das fotos: sempre sorrindo. Ótimo para quem quer um amigo leal.',
    porte: 'MEDIO',
    temperamento: ['Dócil', 'Bom com crianças'],
    ala: 'Ala B',
    canil: '9',
    fotos: [foto('f-pingo', 'gravata')],
  }),
  base('a-mingau', {
    nome: 'Mingau',
    slug: 'mingau-f6',
    especie: 'GATO',
    cor: 'Branco',
    dataNascimentoEstimada: anosAtras(12),
    idoso: true,
    medicacaoContinua: true,
    medicacoes: 'Ração renal e suplemento',
    condicoesSaude: 'Doença renal crônica controlada',
    descricao: 'Mingau é um gato idoso e calmo, que gosta de colo e de dormir perto da janela.',
    temperamento: ['Calmo', 'Carente'],
    ala: 'Ala C',
  }),
  base('a-pipoca', {
    nome: 'Pipoca',
    slug: 'pipoca-g7',
    especie: 'GATO',
    sexo: 'FEMEA',
    cor: 'Rajado',
    dataNascimentoEstimada: anosAtras(1),
    descricao: 'Pipoca é ativa e brincalhona. Corre atrás de tudo que se mexe.',
    temperamento: ['Brincalhão', 'Bom com gatos'],
    ala: 'Ala C',
  }),
  base('a-luna', {
    nome: 'Luna',
    slug: 'luna-h8',
    sexo: 'FEMEA',
    cor: 'Preto',
    dataNascimentoEstimada: anosAtras(6),
    situacao: 'EM_TRATAMENTO',
    visivelNaVitrine: false,
    condicoesSaude: 'Recuperação de cirurgia',
    descricao: 'Luna está se recuperando de uma cirurgia e logo volta para a vitrine.',
    porte: 'MEDIO',
    ala: 'Asilo Osnilda',
    canil: '2',
  }),
].map((a) => ({
  ...a,
  fotos: a.fotos.map((f, i) => ({ ...f, principal: i === 0 })),
}));

export const PESSOAS_INICIAIS = [
  {
    id: 'p-ana',
    versao: 0,
    nome: 'Ana Souza',
    telefone: '(47) 99999-1001',
    email: 'ana@exemplo.com',
    cpf: null,
    endereco: null,
    observacoes: 'Visita aos sábados',
    consentimentoEm: '2026-09-26T12:00:00Z',
    criadoEm: '2026-09-26T12:00:00Z',
    atualizadoPor: 'demonstracao',
  },
];

export const APADRINHAMENTOS_INICIAIS = [
  {
    id: 'ap-1',
    pessoaId: 'p-ana',
    animalId: 'a-thor',
    tipoApoio: 'AMBOS',
    dataInicio: '2026-09-26',
    dataFim: null,
    observacoes: '',
  },
];

export const SOLICITACOES_INICIAIS = [
  {
    id: 's-1',
    tipo: 'APADRINHAR',
    animalId: 'a-bento',
    nome: 'Carlos Lima',
    telefone: '(47) 98888-2002',
    email: 'carlos@exemplo.com',
    mensagem: 'Gostaria de apadrinhar o Bento e visitar aos fins de semana.',
    status: 'NOVA',
    observacaoInterna: '',
    recebidaEm: new Date(Date.now() - 2 * 3600e3).toISOString(),
  },
  {
    id: 's-2',
    tipo: 'ADOTAR',
    animalId: 'a-nina',
    nome: 'Juliana Prado',
    telefone: '(47) 97777-3003',
    email: '',
    mensagem: 'Moro em casa com quintal murado.',
    status: 'EM_CONTATO',
    observacaoInterna: 'Liguei dia 14, volta a falar na sexta.',
    recebidaEm: new Date(Date.now() - 3 * 86400e3).toISOString(),
  },
];

/**
 * Vídeos de exemplo (ADR 0009). Na versão real, o vídeo fica no canal do YouTube da ONG
 * e o sistema guarda só o ID (youtubeId). Aqui, para a demonstração funcionar sem internet
 * e sem canal, usamos clipes curtos gerados a partir das fotos reais do mural.
 */
export const VIDEOS_INICIAIS = [
  {
    id: 'v-thor',
    animalId: 'a-thor',
    titulo: 'Thor curtindo o sol da tarde',
    youtubeId: null,
    arquivo: video2,
    poster: poster2,
  },
  {
    id: 'v-bento',
    animalId: 'a-bento',
    titulo: 'Bento e o brinquedo favorito',
    youtubeId: null,
    arquivo: video4,
    poster: poster4,
  },
  {
    id: 'v-pingo',
    animalId: 'a-gravata',
    titulo: 'Pingo pronto para a foto',
    youtubeId: null,
    arquivo: video5,
    poster: poster5,
  },
  {
    id: 'v-mel',
    animalId: 'a-mel',
    titulo: 'Mel descansando no cesto',
    youtubeId: null,
    arquivo: video1,
    poster: poster1,
  },
  {
    id: 'v-nina',
    animalId: 'a-nina',
    titulo: 'Nina esperando o passeio',
    youtubeId: null,
    arquivo: video3,
    poster: poster3,
  },
];
