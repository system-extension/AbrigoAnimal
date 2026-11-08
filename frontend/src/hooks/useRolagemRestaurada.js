import { useEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';

const PREFIXO = 'rolagem:';

/**
 * Ao VOLTAR para uma lista (botão voltar do celular/navegador), devolve a rolagem para onde
 * a pessoa estava. Chegando por um link ou pelo menu, a lista abre no topo, como deve ser.
 *
 * Funciona com o BrowserRouter (o <ScrollRestoration> do React Router exige o roteador de dados).
 * A posição fica no sessionStorage: some quando a aba é fechada.
 *
 * @param {string} chave  identifica a lista (ex.: caminho + filtros)
 * @param {boolean} pronto  true quando os itens já estão na tela (antes disso não há altura para rolar)
 */
export default function useRolagemRestaurada(chave, pronto) {
  const voltando = useNavigationType() === 'POP';
  const feito = useRef(!voltando);

  // Grava a posição em dois momentos em que a tela ainda é a da lista:
  //  - no CLIQUE (fase de captura, antes da navegação): ao abrir a ficha de um animal;
  //  - no "pagehide": o navegador avisa que a página vai ser descarregada (F5, fechar a aba).
  //    Sem ele, o F5 restauraria a posição do último clique (ex.: o "Carregar mais"), não a atual.
  // Gravar ao desmontar não serve: aí o React já trocou a lista pela próxima página (mais curta)
  // e o navegador "encolheu" a rolagem; e, em desenvolvimento, o StrictMode desmonta e remonta a
  // tela, regravando a posição com 0.
  useEffect(() => {
    const gravar = () => {
      try {
        sessionStorage.setItem(PREFIXO + chave, String(window.scrollY));
      } catch {
        /* navegação privada sem armazenamento: só não restaura */
      }
    };
    document.addEventListener('click', gravar, true);
    window.addEventListener('pagehide', gravar);
    return () => {
      document.removeEventListener('click', gravar, true);
      window.removeEventListener('pagehide', gravar);
    };
  }, [chave]);

  useEffect(() => {
    if (!pronto || feito.current) return;
    feito.current = true;
    let y = 0;
    try {
      y = Number(sessionStorage.getItem(PREFIXO + chave)) || 0;
    } catch {
      /* sem armazenamento */
    }
    // 'instant': o tema usa rolagem suave, e aqui a pessoa deve reaparecer onde estava, sem animação
    if (y > 0) requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
  }, [pronto, chave]);
}
