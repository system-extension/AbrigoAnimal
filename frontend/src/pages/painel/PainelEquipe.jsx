import { useState } from 'react';
import * as usuarios from '../../api/usuarios';
import { trocarSenha } from '../../api/auth';
import useCarregar from '../../hooks/useCarregar';
import { useSessao } from '../../context/Sessao';
import { useAvisos } from '../../context/Avisos';
import Carregando from '../../components/ui/Carregando';
import Folha from '../../components/ui/Folha';
import { CampoTexto } from '../../components/ui/Campos';

const MINIMO = 8;
const NOVO_USUARIO = { nome: '', email: '', senha: '' };
const NOVA_SENHA = { atual: '', nova: '', confirmacao: '' };

/** Erro de senha que dá para avisar antes de ir ao backend (ele confere de novo). */
function conferirSenha(nova, confirmacao) {
  if (nova.length < MINIMO) return `A senha precisa ter pelo menos ${MINIMO} caracteres.`;
  if (confirmacao !== undefined && nova !== confirmacao) return 'As duas senhas não são iguais.';
  return null;
}

/**
 * Minha conta + Equipe (ADR 0012).
 * - Todo mundo: troca a própria senha, confirmando a atual.
 * - Só o administrador vê e gerencia a equipe: adicionar, senha provisória para quem esqueceu
 *   (não há e-mail de recuperação), desativar e reativar. O backend também barra (403):
 *   esconder na tela é conforto, quem garante é o SegurancaConfig.
 * - Quem sai da ONG é desativado (não apagado: o nome continua no histórico de alterações).
 */
export default function PainelEquipe() {
  const { usuario } = useSessao();
  const avisar = useAvisos();
  const admin = Boolean(usuario?.administrador);
  // quem não é administrador nem pede a lista (o backend responderia 403)
  const lista = useCarregar(() => (admin ? usuarios.listar() : Promise.resolve([])), [admin]);

  const [minhaSenha, setMinhaSenha] = useState(null);
  const [novo, setNovo] = useState(null);
  const [aberto, setAberto] = useState(null);
  const [provisoria, setProvisoria] = useState('');
  const [confirmarDesativar, setConfirmarDesativar] = useState(false);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  const souEu = (u) => u.email === usuario?.email;

  /** Roda a ação, mostra o aviso e devolve true se deu certo. */
  const executar = async (acao, sucesso) => {
    setEnviando(true);
    try {
      await acao();
      avisar.sucesso(sucesso);
      setErros({});
      return true;
    } catch (e) {
      setErros(e.campos || {});
      avisar.erro(e.message);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const fecharFicha = () => {
    setAberto(null);
    setProvisoria('');
    setConfirmarDesativar(false);
    setErros({});
  };

  const salvarMinhaSenha = async (e) => {
    e.preventDefault();
    const erro = conferirSenha(minhaSenha.nova, minhaSenha.confirmacao);
    if (erro) return setErros({ novaSenha: erro });
    const ok = await executar(
      () => trocarSenha(minhaSenha.atual, minhaSenha.nova),
      'Senha alterada. Use a nova no próximo acesso.',
    );
    if (ok) setMinhaSenha(null);
  };

  const salvarNovo = async (e) => {
    e.preventDefault();
    const erro = conferirSenha(novo.senha);
    if (erro) return setErros({ senha: erro });
    const ok = await executar(
      () => usuarios.criar(novo),
      `${novo.nome.split(' ')[0]} já pode entrar no painel`,
    );
    if (ok) setNovo(null);
  };

  const salvarProvisoria = async (e) => {
    e.preventDefault();
    const erro = conferirSenha(provisoria);
    if (erro) return setErros({ novaSenha: erro });
    const ok = await executar(
      () => usuarios.redefinirSenha(aberto.id, provisoria),
      `Senha provisória definida. Passe para ${aberto.nome.split(' ')[0]} pessoalmente.`,
    );
    if (ok) fecharFicha();
  };

  const alternarAtivo = async () => {
    const ok = await executar(
      () => (aberto.ativo ? usuarios.desativar(aberto.id) : usuarios.reativar(aberto.id)),
      aberto.ativo ? `${aberto.nome} não entra mais no painel` : `${aberto.nome} foi reativado(a)`,
    );
    if (ok) fecharFicha();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h1 className="h3 mb-0">{admin ? 'Equipe' : 'Minha conta'}</h1>
        {admin && (
          <button
            type="button"
            className="botao botao-principal"
            onClick={() => setNovo(NOVO_USUARIO)}
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" /> Adicionar
          </button>
        )}
      </div>
      <p className="texto-suave small">
        {admin
          ? 'Quem pode entrar no painel. Só você, como administrador(a), gerencia a equipe.'
          : `${usuario?.nome} · ${usuario?.email}`}
      </p>

      <button
        type="button"
        className="botao botao-contorno botao-bloco mb-3"
        onClick={() => setMinhaSenha(NOVA_SENHA)}
      >
        <i className="fa-solid fa-key" aria-hidden="true" /> Trocar minha senha
      </button>

      {!admin && (
        <p className="texto-suave small">
          Esqueceu a senha ou precisa liberar o acesso de alguém? Fale com o administrador da
          equipe.
        </p>
      )}

      {!admin ? null : lista.carregando && !lista.dados ? (
        <Carregando />
      ) : (
        <ul className="lista-pedidos">
          {(lista.dados ?? []).map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className="pedido"
                onClick={() => (souEu(u) ? setMinhaSenha(NOVA_SENHA) : setAberto(u))}
              >
                <span className="d-flex justify-content-between gap-2">
                  <strong>{u.nome}</strong>
                  <span className="d-flex gap-1">
                    {u.administrador && <span className="selo selo-laranja">Administrador</span>}
                    {souEu(u) && <span className="selo selo-azul">Você</span>}
                    {!u.ativo && <span className="selo selo-cinza">Desativado</span>}
                  </span>
                </span>
                <small className="texto-suave">{u.email}</small>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ------------------------------------------------------------ minha senha */}
      <Folha
        aberta={Boolean(minhaSenha)}
        aoFechar={() => setMinhaSenha(null)}
        titulo="Trocar minha senha"
      >
        {minhaSenha && (
          <form onSubmit={salvarMinhaSenha} noValidate>
            <CampoTexto
              rotulo="Senha atual"
              type="password"
              autoComplete="current-password"
              obrigatorio
              value={minhaSenha.atual}
              onChange={(e) => setMinhaSenha({ ...minhaSenha, atual: e.target.value })}
              erro={erros.senhaAtual}
            />
            <CampoTexto
              rotulo="Nova senha"
              dica={`Pelo menos ${MINIMO} caracteres. Uma frase curta é fácil de lembrar e difícil de adivinhar.`}
              type="password"
              autoComplete="new-password"
              obrigatorio
              value={minhaSenha.nova}
              onChange={(e) => setMinhaSenha({ ...minhaSenha, nova: e.target.value })}
              erro={erros.novaSenha}
            />
            <CampoTexto
              rotulo="Repita a nova senha"
              type="password"
              autoComplete="new-password"
              obrigatorio
              value={minhaSenha.confirmacao}
              onChange={(e) => setMinhaSenha({ ...minhaSenha, confirmacao: e.target.value })}
            />
            <button
              type="submit"
              className="botao botao-principal botao-grande botao-bloco"
              disabled={enviando}
            >
              Salvar nova senha
            </button>
          </form>
        )}
      </Folha>

      {/* ------------------------------------------------------------ adicionar */}
      <Folha aberta={Boolean(novo)} aoFechar={() => setNovo(null)} titulo="Adicionar à equipe">
        {novo && (
          <form onSubmit={salvarNovo} noValidate>
            <CampoTexto
              rotulo="Nome"
              obrigatorio
              autoCapitalize="words"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              erro={erros.nome}
            />
            <CampoTexto
              rotulo="E-mail"
              dica="É com ele que a pessoa entra no painel."
              type="email"
              inputMode="email"
              autoComplete="off"
              obrigatorio
              value={novo.email}
              onChange={(e) => setNovo({ ...novo, email: e.target.value })}
              erro={erros.email}
            />
            <CampoTexto
              rotulo="Senha inicial"
              dica="Combine pessoalmente. No primeiro acesso, ela troca em Minha conta (ícone no topo) → Trocar minha senha."
              type="text"
              autoComplete="off"
              obrigatorio
              value={novo.senha}
              onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
              erro={erros.senha}
            />
            <button
              type="submit"
              className="botao botao-principal botao-grande botao-bloco"
              disabled={enviando}
            >
              Adicionar
            </button>
          </form>
        )}
      </Folha>

      {/* ------------------------------------------------------------ colega */}
      <Folha aberta={Boolean(aberto)} aoFechar={fecharFicha} titulo={aberto?.nome ?? ''}>
        {aberto && (
          <>
            <p className="texto-suave mb-3">
              {aberto.email}
              {!aberto.ativo && ' · desativado'}
            </p>

            {aberto.ativo && (
              <form onSubmit={salvarProvisoria} noValidate className="mb-4">
                <CampoTexto
                  rotulo="Esqueceu a senha? Defina uma provisória"
                  dica="Passe pessoalmente e peça para trocar no primeiro acesso."
                  type="text"
                  autoComplete="off"
                  value={provisoria}
                  onChange={(e) => setProvisoria(e.target.value)}
                  erro={erros.novaSenha}
                />
                <button
                  type="submit"
                  className="botao botao-contorno botao-bloco"
                  disabled={enviando}
                >
                  <i className="fa-solid fa-key" aria-hidden="true" /> Definir senha provisória
                </button>
              </form>
            )}

            {aberto.ativo && !confirmarDesativar && (
              <button
                type="button"
                className="botao botao-perigo botao-bloco"
                onClick={() => setConfirmarDesativar(true)}
              >
                <i className="fa-solid fa-user-slash" aria-hidden="true" /> Desativar acesso
              </button>
            )}
            {aberto.ativo && confirmarDesativar && (
              <div className="d-grid gap-2">
                <p className="small mb-0">
                  {aberto.nome} não vai mais conseguir entrar. O nome continua no histórico de quem
                  alterou cada cadastro. Dá para reativar depois.
                </p>
                <button
                  type="button"
                  className="botao botao-perigo"
                  onClick={alternarAtivo}
                  disabled={enviando}
                >
                  Sim, desativar
                </button>
                <button
                  type="button"
                  className="botao botao-texto"
                  onClick={() => setConfirmarDesativar(false)}
                >
                  Cancelar
                </button>
              </div>
            )}
            {!aberto.ativo && (
              <button
                type="button"
                className="botao botao-principal botao-bloco"
                onClick={alternarAtivo}
                disabled={enviando}
              >
                <i className="fa-solid fa-user-check" aria-hidden="true" /> Reativar acesso
              </button>
            )}
          </>
        )}
      </Folha>
    </div>
  );
}
