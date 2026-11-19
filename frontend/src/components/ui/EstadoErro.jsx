import { useEffect } from 'react';
import { MENSAGENS } from '../../textos/mensagens';

const NOVA_TENTATIVA_MS = 10_000;

/**
 * "Não deu para carregar", com o aviso certo para cada caso (textos em textos/mensagens.js).
 *
 * - Sem conexão: tenta de novo sozinho a cada 10 s (e quando a internet volta), sem a tela
 *   piscar; a pessoa também pode tocar em "Tentar de novo".
 * - `naoEncontrado`: troca o aviso de "não encontrado" (ex.: animal fora da vitrine).
 * - `children`: ações extras (ex.: "Ver outros animais").
 *
 * aoTentarDeNovo: ação do botão (mostra "carregando"). aoTentarEmSilencio: novas tentativas
 * automáticas (se não vier, usa aoTentarDeNovo).
 */
export default function EstadoErro({
  erro,
  aoTentarDeNovo,
  aoTentarEmSilencio,
  naoEncontrado,
  children,
}) {
  const tipo = erro?.tipo ?? 'generico';
  const aviso =
    (tipo === 'naoEncontrado' && naoEncontrado) || MENSAGENS[tipo] || MENSAGENS.generico;
  const automatico = aoTentarEmSilencio ?? aoTentarDeNovo;

  useEffect(() => {
    if (tipo !== 'semConexao' || !automatico) return;
    const tentar = () => document.visibilityState !== 'hidden' && automatico();
    const relogio = setInterval(tentar, NOVA_TENTATIVA_MS);
    window.addEventListener('online', tentar);
    return () => {
      clearInterval(relogio);
      window.removeEventListener('online', tentar);
    };
  }, [tipo, automatico]);

  return (
    <div className={`estado-erro estado-erro-${tipo}`} role="alert">
      <span className="estado-erro-icone">
        <i className={`fa-solid ${aviso.icone}`} aria-hidden="true" />
      </span>
      <p className="estado-erro-titulo">{aviso.titulo}</p>
      <p className="estado-erro-texto">{aviso.texto}</p>
      <div className="estado-erro-acoes">
        {aoTentarDeNovo && tipo !== 'naoEncontrado' && tipo !== 'sessaoTerminou' && (
          <button type="button" className="botao botao-contorno" onClick={aoTentarDeNovo}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />{' '}
            {MENSAGENS.botaoTentarDeNovo}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
