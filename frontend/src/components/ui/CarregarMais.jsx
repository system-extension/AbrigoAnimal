/** Rodapé de lista paginada: "Mostrando X de Y" + botão para a próxima página. */
export default function CarregarMais({ mostrando, total, temMais, carregando, erro, aoCarregar }) {
  if (!total) return null;
  return (
    <div className="carregar-mais">
      <p className="small texto-suave mb-2" aria-live="polite">
        Mostrando {mostrando} de {total}
      </p>
      {erro && <p className="small texto-perigo mb-2">{erro.message}</p>}
      {temMais && (
        <button
          type="button"
          className="botao botao-contorno"
          onClick={aoCarregar}
          disabled={carregando}
          aria-busy={carregando}
        >
          {carregando ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Carregando…
            </>
          ) : (
            'Carregar mais'
          )}
        </button>
      )}
    </div>
  );
}
