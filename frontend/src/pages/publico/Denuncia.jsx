import './paginas.css';

const PASSOS = [
  {
    titulo: 'Documente',
    texto:
      'Fotos, vídeos e o endereço exato com ponto de referência são fundamentais para a polícia agir.',
  },
  {
    titulo: 'Detalhe',
    texto:
      'Há falta de comida ou água? O animal está acorrentado, sem abrigo do sol e da chuva, ferido?',
  },
  {
    titulo: 'Formalize',
    texto:
      'Registre pela Delegacia Virtual ou numa delegacia. Redes sociais não substituem os canais oficiais.',
  },
];

const CANAIS = [
  {
    icone: 'fa-phone',
    titulo: 'Disque Denúncia 181',
    texto: 'Canal anônimo da Polícia Civil.',
    acao: 'Ligar 181',
    href: 'tel:181',
  },
  {
    icone: 'fa-scale-balanced',
    titulo: 'Ministério Público (MPSC)',
    texto: 'Descaso continuado, crimes ambientais graves ou omissão de órgãos públicos.',
    acao: 'Ouvidoria',
    href: 'https://www.mpsc.mp.br/ouvidoria',
  },
  {
    icone: 'fa-leaf',
    titulo: 'Ibama · Linha Verde',
    texto: '0800 061 8080 para infrações ambientais e fauna silvestre.',
    acao: 'Canais do Ibama',
    href: 'https://www.gov.br/ibama/pt-br/assuntos/fiscalizacao-e-protecao-ambiental/fiscalizacao-ambiental/denuncias',
  },
];

export default function Denuncia() {
  return (
    <div className="container secao pt-4 formulario-largo">
      <span className="sobretitulo">Maus-tratos é crime</span>
      <h1 className="titulo-secao">Como denunciar</h1>
      <p className="texto-suave">
        Maus-tratos a animais é crime (Lei 9.605/98, com pena maior para cães e gatos pela Lei
        14.064/2020). O abrigo não recebe denúncias: elas devem ir para os canais oficiais abaixo.
      </p>

      <div className="faixa-alerta my-4">
        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
        <div>
          <h2 className="h5 mb-1">Está acontecendo agora?</h2>
          <p className="mb-2">Em flagrante de violência, ligue para a Polícia Militar.</p>
          <a href="tel:190" className="botao botao-perigo">
            <i className="fa-solid fa-phone" aria-hidden="true" /> Ligar 190
          </a>
        </div>
      </div>

      <ol className="passos passos-numerados">
        {PASSOS.map((p) => (
          <li key={p.titulo} className="passo">
            <div>
              <strong>{p.titulo}</strong>
              <p>{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="cartao cartao-corpo canal-oficial">
        <h2 className="h4">Delegacia Virtual de Santa Catarina</h2>
        <p>
          Canal oficial da Polícia Civil para registrar maus-tratos ou fazer denúncia anônima.
          Guarde o protocolo.
        </p>
        <a
          className="botao botao-principal"
          href="https://delegaciavirtual.sc.gov.br/"
          target="_blank"
          rel="noreferrer"
        >
          Registrar denúncia{' '}
          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </a>
      </div>

      <h2 className="h5 mt-4">Outros canais</h2>
      <div className="d-grid gap-3">
        {CANAIS.map((c) => (
          <div key={c.titulo} className="cartao cartao-corpo d-flex gap-3">
            <span className="forma-ajuda-icone">
              <i className={`fa-solid ${c.icone}`} aria-hidden="true" />
            </span>
            <div>
              <strong>{c.titulo}</strong>
              <p className="texto-suave small mb-2">{c.texto}</p>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {c.acao}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
