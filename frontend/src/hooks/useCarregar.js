import { useCallback, useEffect, useRef, useState } from 'react';
import { EVENTO_DADOS } from '../api/mock/banco';

/**
 * Carrega dados de uma função assíncrona e controla os 3 estados de toda tela:
 * carregando → dados | erro.
 *
 * `deps`: quando muda (ex.: filtros), carrega de novo.
 * `recarregar()`: força nova busca.
 * No modo demonstração, atualiza sozinho (sem piscar a tela) quando outra tela altera os dados.
 */
export default function useCarregar(funcao, deps = []) {
  const ultimaFuncao = useRef(funcao);
  useEffect(() => {
    ultimaFuncao.current = funcao;
  });

  const [versao, setVersao] = useState(0);
  const [silencioso, setSilencioso] = useState(0);
  const chave = JSON.stringify(deps) + '|' + versao;
  const [estado, setEstado] = useState({ chave: null, dados: null, erro: null });

  useEffect(() => {
    let ativo = true;
    ultimaFuncao
      .current()
      .then((dados) => ativo && setEstado({ chave, dados, erro: null }))
      .catch((erro) => ativo && setEstado((e) => ({ chave, dados: e.dados, erro })));
    return () => {
      ativo = false;
    };
  }, [chave, silencioso]);

  useEffect(() => {
    const aoAlterar = () => setSilencioso((n) => n + 1);
    window.addEventListener(EVENTO_DADOS, aoAlterar);
    return () => window.removeEventListener(EVENTO_DADOS, aoAlterar);
  }, []);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return {
    carregando: estado.chave !== chave,
    dados: estado.dados,
    erro: estado.chave === chave ? estado.erro : null,
    recarregar,
  };
}
