import { Link } from 'react-router-dom';
import { CONTATO } from '../../utils/contato';
import './paginas.css';

const FORMAS = [
  {
    icone: 'fa-heart',
    titulo: 'Apadrinhe um idoso',
    texto:
      'Visite, passeie e acompanhe um animal que dificilmente será adotado. A contribuição é livre.',
    acao: 'Escolher afilhado',
    para: '/animais?idoso=true',
  },
  {
    icone: 'fa-house',
    titulo: 'Adote',
    texto:
      'Dê um lar para quem espera. A equipe orienta todo o processo e acompanha depois da adoção.',
    acao: 'Conhecer os animais',
    para: '/animais',
  },
  {
    icone: 'fa-person-walking',
    titulo: 'Rolê do Abrigo',
    texto: 'No último sábado do mês, venha passear com um dos nossos cães. Não precisa agendar.',
    acao: 'Ver próximo rolê',
    para: '/#role-do-abrigo',
  },
  {
    icone: 'fa-hands-holding-circle',
    titulo: 'Cuide dos animais',
    texto: 'Ajude a alimentar, dar banho, brincar e socializar os animais acolhidos.',
    acao: 'Falar com o abrigo',
    para: '/quero-ajudar',
  },
  {
    icone: 'fa-camera',
    titulo: 'Divulgue',
    texto: 'Fotografia, vídeo, design ou só compartilhar: cada post ajuda um animal a ser visto.',
    acao: 'Seguir no Instagram',
    href: CONTATO.instagram,
  },
];

const ITENS = [
  { icone: 'fa-bowl-food', texto: 'Ração para cães e gatos' },
  { icone: 'fa-capsules', texto: 'Medicamentos' },
  { icone: 'fa-pump-soap', texto: 'Produtos de higiene e limpeza' },
  { icone: 'fa-bed', texto: 'Cobertores e toalhas' },
  { icone: 'fa-box-open', texto: 'Outros itens para os animais' },
];

export default function ComoAjudar() {
  return (
    <div className="container secao pt-4">
      <span className="sobretitulo">Envolva-se</span>
      <h1 className="titulo-secao">Como ajudar</h1>
      <p className="texto-suave">
        O abrigo é mantido por doações, voluntários e pessoas que se importam. Escolha o seu jeito.
      </p>

      <div className="formas-ajuda">
        {FORMAS.map((f) => (
          <div key={f.titulo} className="cartao cartao-corpo forma-ajuda">
            <span className="forma-ajuda-icone">
              <i className={`fa-solid ${f.icone}`} aria-hidden="true" />
            </span>
            <h2 className="h5 mt-3">{f.titulo}</h2>
            <p className="texto-suave">{f.texto}</p>
            {f.href ? (
              <a
                className="botao botao-contorno mt-auto"
                href={f.href}
                target="_blank"
                rel="noreferrer"
              >
                {f.acao}
              </a>
            ) : (
              <Link className="botao botao-contorno mt-auto" to={f.para}>
                {f.acao}
              </Link>
            )}
          </div>
        ))}
      </div>

      <section id="doacoes" className="secao">
        <div className="cartao cartao-corpo doacoes">
          <span className="sobretitulo">Doação de itens</span>
          <h2 className="titulo-secao">O que você pode doar</h2>
          <ul className="itens-doacao">
            {ITENS.map((i) => (
              <li key={i.texto}>
                <i className={`fa-solid ${i.icone}`} aria-hidden="true" /> {i.texto}
              </li>
            ))}
          </ul>
          <div className="endereco">
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            <div>
              <strong>Entregue no abrigo</strong>
              <p className="mb-2 texto-suave">{CONTATO.endereco}</p>
              <a
                className="botao botao-principal"
                href={CONTATO.mapa}
                target="_blank"
                rel="noreferrer"
              >
                Abrir no mapa
              </a>
            </div>
          </div>
          <p className="small texto-suave mt-3 mb-0">
            Doações em dinheiro: Pix ou depósito na conta da instituição. Peça os dados pelos canais
            oficiais.
          </p>
        </div>
      </section>
    </div>
  );
}
