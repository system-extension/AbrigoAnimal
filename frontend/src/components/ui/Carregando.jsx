export default function Carregando({ texto = 'Carregando…' }) {
  return (
    <div className="carregando" role="status">
      <i
        className="fa-solid fa-paw fa-bounce fa-2x"
        style={{ color: 'var(--laranja-logo)' }}
        aria-hidden="true"
      />
      <span>{texto}</span>
    </div>
  );
}
