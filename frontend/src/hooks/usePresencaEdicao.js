import { useEffect, useState } from 'react';
import { sair, sinalizar } from '../api/edicoes';

const INTERVALO_MS = 30_000; // o servidor esquece quem ficou 2 minutos sem sinal

/**
 * Aviso de presença (ADR 0014): enquanto `ativo`, avisa o servidor a cada 30 s que este cadastro
 * está aberto para edição e devolve quem MAIS está editando ([{ nome, desde }]).
 *
 * - Ao desativar (ex.: "só visualizar"), sair da tela ou fechar a página, avisa que saiu.
 * - Com a aba escondida não manda sinal (o celular economiza bateria); ao voltar, manda na hora.
 * - Falha de rede é ignorada: é só um aviso, quem protege os dados é a versão + 409.
 */
export default function usePresencaEdicao(recurso, id, ativo) {
  const [outros, setOutros] = useState([]);

  useEffect(() => {
    if (!ativo || !id) return;
    let vivo = true;
    const enviar = () => {
      if (document.visibilityState === 'hidden') return;
      sinalizar(recurso, id)
        .then((lista) => vivo && setOutros(lista ?? []))
        .catch(() => {});
    };
    const sairAgora = () => sair(recurso, id).catch(() => {});

    enviar();
    const relogio = setInterval(enviar, INTERVALO_MS);
    document.addEventListener('visibilitychange', enviar);
    window.addEventListener('pagehide', sairAgora);
    return () => {
      vivo = false;
      clearInterval(relogio);
      document.removeEventListener('visibilitychange', enviar);
      window.removeEventListener('pagehide', sairAgora);
      sairAgora();
    };
  }, [recurso, id, ativo]);

  // desativado (ex.: "só visualizar"), não mostra ninguém, mesmo que a última resposta tivesse
  return ativo ? outros : [];
}
