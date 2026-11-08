import { Component } from 'react';

/**
 * Rede de segurança: se uma tela quebrar, mostra uma mensagem com "Recarregar"
 * em vez de deixar a página em branco. O erro continua no console para investigar.
 */
export default class ErroInesperado extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('Erro na tela:', erro, info?.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div
        className="vazio"
        role="alert"
        style={{ minHeight: '60vh', display: 'grid', placeContent: 'center' }}
      >
        <i className="fa-solid fa-triangle-exclamation d-block" aria-hidden="true" />
        <p className="fw-bold mb-1" style={{ color: 'var(--tinta)' }}>
          Algo deu errado nesta tela.
        </p>
        <p className="small">{String(this.state.erro?.message ?? '')}</p>
        <button
          type="button"
          className="botao botao-principal mx-auto"
          onClick={() => window.location.reload()}
        >
          Recarregar
        </button>
      </div>
    );
  }
}
