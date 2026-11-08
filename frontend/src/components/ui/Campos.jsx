import { useId } from 'react';

/** Campo de texto com rótulo, dica e erro já ligados por acessibilidade. */
export function CampoTexto({ rotulo, dica, erro, multilinha, obrigatorio, ...props }) {
  const id = useId();
  const Tag = multilinha ? 'textarea' : 'input';
  return (
    <div className="campo">
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="text-danger"> *</span>}
      </label>
      {dica && (
        <span className="campo-dica" id={id + '-dica'}>
          {dica}
        </span>
      )}
      <Tag
        id={id}
        className="entrada"
        aria-invalid={erro ? 'true' : undefined}
        aria-describedby={
          [dica && id + '-dica', erro && id + '-erro'].filter(Boolean).join(' ') || undefined
        }
        required={obrigatorio}
        {...props}
      />
      {erro && (
        <span className="campo-erro" id={id + '-erro'}>
          {erro}
        </span>
      )}
    </div>
  );
}

/**
 * Escolha por "chips" (botões grandes) em vez de <select>: um toque só no celular.
 * multipla=true permite marcar vários (valor vira array).
 */
export function GrupoChips({ rotulo, opcoes, valor, aoMudar, multipla, erro, rolagem, dica }) {
  const id = useId();
  const marcado = (v) => (multipla ? (valor ?? []).includes(v) : valor === v);
  const alternar = (v) => {
    if (!multipla) return aoMudar(valor === v ? null : v);
    const atual = valor ?? [];
    aoMudar(atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v]);
  };
  return (
    <div className="campo" role="group" aria-labelledby={id}>
      <span className="campo-rotulo" id={id}>
        {rotulo}
      </span>
      {dica && <span className="campo-dica">{dica}</span>}
      <div className={`chips ${rolagem ? 'chips-rolagem' : ''}`}>
        {opcoes.map((o) => {
          const v = typeof o === 'string' ? o : o.valor;
          const r = typeof o === 'string' ? o : o.rotulo;
          return (
            <button
              key={v}
              type="button"
              className="chip"
              aria-pressed={marcado(v)}
              onClick={() => alternar(v)}
            >
              {o.icone && <i className={`fa-solid ${o.icone}`} aria-hidden="true" />}
              {r}
            </button>
          );
        })}
      </div>
      {erro && <span className="campo-erro">{erro}</span>}
    </div>
  );
}

/** Liga/desliga grande, com texto de apoio. */
export function Interruptor({ titulo, descricao, marcado, aoMudar }) {
  return (
    <label className="interruptor">
      <span className="interruptor-texto">
        <strong>{titulo}</strong>
        {descricao && <small>{descricao}</small>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={Boolean(marcado)}
        onChange={(e) => aoMudar(e.target.checked)}
      />
    </label>
  );
}
