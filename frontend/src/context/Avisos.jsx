/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { novoId } from '../utils/id';

/**
 * Avisos rápidos no rodapé da tela ("Salvo!", "Sem conexão").
 * Uso: const avisar = useAvisos(); avisar.sucesso('Salvo');
 */
const Contexto = createContext(null);

export function ProvedorAvisos({ children }) {
  const [lista, setLista] = useState([]);

  const mostrar = useCallback((tipo, texto) => {
    const id = novoId();
    setLista((l) => [...l.slice(-2), { id, tipo, texto }]);
    setTimeout(() => setLista((l) => l.filter((a) => a.id !== id)), tipo === 'erro' ? 6000 : 3500);
  }, []);

  const api = useMemo(
    () => ({
      sucesso: (t) => mostrar('sucesso', t),
      erro: (t) => mostrar('erro', t),
      info: (t) => mostrar('info', t),
    }),
    [mostrar],
  );

  return (
    <Contexto.Provider value={api}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {lista.map((a) => (
          <div key={a.id} className={`aviso aviso-${a.tipo}`}>
            <i
              className={`fa-solid ${a.tipo === 'erro' ? 'fa-circle-exclamation' : a.tipo === 'sucesso' ? 'fa-circle-check' : 'fa-circle-info'} mt-1`}
              aria-hidden="true"
            />
            <span>{a.texto}</span>
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export const useAvisos = () => useContext(Contexto);
