import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import { useSessao } from '../../context/Sessao';
import { CampoTexto } from '../../components/ui/Campos';
import { USAR_API_REAL } from '../../api/config';
import { LOGIN_DEMO } from '../../api/auth';
import './painel.css';

export default function Entrar() {
  const { usuario, entrar } = useSessao();
  const navegar = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(USAR_API_REAL ? '' : LOGIN_DEMO.email);
  const [senha, setSenha] = useState(USAR_API_REAL ? '' : LOGIN_DEMO.senha);
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={state?.voltarPara || '/painel'} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
      navegar(state?.voltarPara || '/painel', { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="entrar">
      <form className="cartao cartao-corpo entrar-cartao" onSubmit={enviar}>
        <img src={logo} alt="" width="84" height="84" className="mx-auto d-block mb-2" />
        <h1 className="h4 text-center">Área da equipe</h1>
        <p className="texto-suave text-center small">Acesso para a equipe do Abrigo Animal.</p>
        {!USAR_API_REAL && (
          <p className="faixa-demo rounded-3 small">
            Demonstração: os dados de acesso já estão preenchidos.
          </p>
        )}
        <CampoTexto
          rotulo="E-mail"
          type="email"
          inputMode="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="campo-senha">
          <CampoTexto
            rotulo="Senha"
            type={ver ? 'text' : 'password'}
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button
            type="button"
            className="botao botao-texto botao-icone"
            onClick={() => setVer(!ver)}
            aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}
          >
            <i className={`fa-solid ${ver ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
          </button>
        </div>
        {erro && (
          <p className="campo-erro" role="alert">
            {erro}
          </p>
        )}
        <button
          type="submit"
          className="botao botao-principal botao-grande botao-bloco"
          disabled={enviando}
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <Link to="/" className="botao botao-texto botao-bloco mt-2">
          Voltar ao site
        </Link>
      </form>
    </div>
  );
}
