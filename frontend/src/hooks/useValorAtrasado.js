import { useEffect, useState } from 'react';

/**
 * Devolve `valor` só depois que ele parou de mudar por `ms` milissegundos.
 * Uso: busca enquanto digita. Sem isto, "Thor" virava 4 consultas ao backend (T, Th, Tho, Thor),
 * e uma resposta antiga podia chegar depois da nova.
 */
export default function useValorAtrasado(valor, ms = 350) {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}
