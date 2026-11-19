/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as auth from '../api/auth';
import { EVENTO_SESSAO_TERMINOU } from '../api/cliente';
import Carregando from '../components/ui/Carregando';

/** Sessão da equipe da ONG. O site público não usa login. */
const Contexto = createContext(null);

export function ProvedorSessao({ children }) {
  const [usuario, setUsuario] = useState(undefined); // undefined = ainda verificando
  const [sessaoTerminou, setSessaoTerminou] = useState(false);

  // Login venceu no meio do uso (8 h, ou o sistema reiniciou): volta para o login, com aviso,
  // em vez de cada tela mostrar um erro.
  useEffect(() => {
    const aoTerminar = () => {
      setSessaoTerminou(true);
      setUsuario(null);
    };
    window.addEventListener(EVENTO_SESSAO_TERMINOU, aoTerminar);
    return () => window.removeEventListener(EVENTO_SESSAO_TERMINOU, aoTerminar);
  }, []);

  useEffect(() => {
    auth
      .usuarioAtual()
      .then(setUsuario)
      .catch(() => setUsuario(null));
  }, []);

  const entrar = useCallback(async (email, senha) => {
    const u = await auth.entrar(email, senha);
    setUsuario(u);
    setSessaoTerminou(false);
    return u;
  }, []);

  const sair = useCallback(async () => {
    await auth.sair().catch(() => {});
    setUsuario(null);
  }, []);

  return (
    <Contexto.Provider
      value={{ usuario, verificando: usuario === undefined, sessaoTerminou, entrar, sair }}
    >
      {children}
    </Contexto.Provider>
  );
}

export const useSessao = () => useContext(Contexto);

/** Envolve as rotas do painel: sem login, vai para /painel/entrar e depois volta. */
export function RequerLogin({ children }) {
  const { usuario, verificando } = useSessao();
  const local = useLocation();
  if (verificando) return <Carregando texto="Verificando acesso…" />;
  if (!usuario)
    return <Navigate to="/painel/entrar" replace state={{ voltarPara: local.pathname }} />;
  return children;
}
