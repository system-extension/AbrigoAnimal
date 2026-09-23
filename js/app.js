const slidesDestaque = [...document.querySelectorAll('.slide-destaque')];
const pontosDestaque = [...document.querySelectorAll('[data-destaque]')];
let indiceDestaque = 0;

function mostrarDestaque(indice) {
  indiceDestaque = (indice + slidesDestaque.length) % slidesDestaque.length;
  slidesDestaque.forEach((slide, i) => slide.classList.toggle('ativo', i === indiceDestaque));
  pontosDestaque.forEach((ponto, i) => ponto.setAttribute('aria-current', String(i === indiceDestaque)));
}

pontosDestaque.forEach(ponto => ponto.addEventListener('click', () => mostrarDestaque(Number(ponto.dataset.destaque))));
document.querySelector('[data-destaque-anterior]').addEventListener('click', () => mostrarDestaque(indiceDestaque - 1));
document.querySelector('[data-destaque-proximo]').addEventListener('click', () => mostrarDestaque(indiceDestaque + 1));
setInterval(() => mostrarDestaque(indiceDestaque + 1), 7000);

const trilho = document.querySelector('.trilho-animais');
const janela = document.querySelector('.janela-animais');
const cartoes = [...trilho.children];
const contador = document.querySelector('[data-contador-animais]');
let indiceAnimal = 0;

function animaisVisiveis() { return matchMedia('(max-width: 700px)').matches ? 1 : 3; }

function atualizarAnimais() {
  const visiveis = animaisVisiveis();
  const indiceMaximo = Math.ceil(cartoes.length / visiveis) - 1;
  indiceAnimal = Math.max(0, Math.min(indiceAnimal, indiceMaximo));
  trilho.style.transform = `translateX(-${indiceAnimal * janela.clientWidth}px)`;
  const primeiro = indiceAnimal * visiveis + 1;
  const ultimo = Math.min(primeiro + visiveis - 1, cartoes.length);
  contador.textContent = `${primeiro}${visiveis > 1 ? `–${ultimo}` : ''} de ${cartoes.length}`;
}

document.querySelector('[data-animais-anterior]').addEventListener('click', () => { indiceAnimal--; atualizarAnimais(); });
document.querySelector('[data-animais-proximo]').addEventListener('click', () => { indiceAnimal++; atualizarAnimais(); });
addEventListener('resize', atualizarAnimais);
atualizarAnimais();

const botaoMenu = document.querySelector('.menu-mobile');
const navegacao = document.querySelector('nav');
botaoMenu.addEventListener('click', () => {
  const aberto = navegacao.classList.toggle('aberto');
  botaoMenu.setAttribute('aria-expanded', String(aberto));
});

const dialogo = document.querySelector('dialog');
const mensagens = {
  apadrinhamento: ['Apadrinhamento de cães idosos', 'Apadrinhar é estar presente na vida de um cão idoso e apoiar seu cuidado.'],
  role: ['Vamos dar um rolê?', 'A equipe orienta o passeio para você aproveitar esse momento com os cães.'],
  adocao: ['Conheça todos os nossos amigos', 'Converse com a equipe para receber a lista atualizada e conhecer cada perfil.'],
  doacao: ['Faça uma Doação via PIX', 'Sua contribuição garante alimento, vacinas e tratamento de saúde aos animais resgatados. Chave PIX: 12.345.678/0001-99']
};

document.querySelectorAll('[data-dialogo]').forEach(botao => botao.addEventListener('click', () => {
  const [titulo, texto] = mensagens[botao.dataset.dialogo];
  document.querySelector('[data-titulo-dialogo]').textContent = titulo;
  document.querySelector('[data-texto-dialogo]').textContent = texto;
  dialogo.showModal();
}));

document.querySelectorAll('.fechar').forEach(botao => botao.addEventListener('click', () => dialogo.close()));

const botaoCopiarPix = document.getElementById('botao-copiar-pix');
if (botaoCopiarPix) {
  botaoCopiarPix.addEventListener('click', () => {
    const chavePix = document.getElementById('chave-pix')?.textContent;
    if (chavePix) {
      navigator.clipboard.writeText(chavePix).then(() => {
        const textoSpan = botaoCopiarPix.querySelector('span');
        const textoAntigo = textoSpan.textContent;
        textoSpan.textContent = 'Copiado!';
        botaoCopiarPix.classList.add('copiado');
        setTimeout(() => {
          textoSpan.textContent = textoAntigo;
          botaoCopiarPix.classList.remove('copiado');
        }, 2000);
      });
    }
  });
}
