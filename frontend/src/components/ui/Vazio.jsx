export default function Vazio({ icone = 'fa-paw', titulo, children }) {
  return (
    <div className="vazio">
      <i className={`fa-solid ${icone} d-block`} aria-hidden="true" />
      {titulo && (
        <p className="fw-bold mb-1" style={{ color: 'var(--tinta)' }}>
          {titulo}
        </p>
      )}
      {children}
    </div>
  );
}
