import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { buscarAnimal } from '../../api/vitrine';
import { enviarInteresse } from '../../api/solicitacoes';
import useCarregar from '../../hooks/useCarregar';
import { CampoTexto, GrupoChips } from '../../components/ui/Campos';
import FotoAnimal from '../../components/pets/FotoAnimal';
import { mascaraTelefone } from '../../utils/formato';
import { CONTATO, linkWhatsApp } from '../../utils/contato';
import './paginas.css';

const TIPOS = [
  { valor: 'APADRINHAR', rotulo: 'Apadrinhar', icone: 'fa-heart' },
  { valor: 'ADOTAR', rotulo: 'Adotar', icone: 'fa-house' },
];

const DICAS = {
  APADRINHAR: 'Conte como gostaria de ajudar: visitas, passeios, contribuição… (opcional)',
  ADOTAR:
    'Conte um pouco sobre sua casa e rotina: mora em casa ou apartamento, tem quintal, outros animais… (opcional)',
  OUTRO: 'Como podemos ajudar?',
};

/**
 * Formulário de interesse SEM conta (RF-21, decisão D1).
 * Envia para a caixa de solicitações da equipe, que entra em contato.
 */
export default function Interesse() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const animal = useCarregar(() => (slug ? buscarAnimal(slug) : Promise.resolve(null)), [slug]);

  const [form, setForm] = useState({
    tipo: params.get('tipo') || (slug ? 'APADRINHAR' : 'OUTRO'),
    nome: '',
    telefone: '',
    email: '',
    mensagem: '',
    consentimento: false,
    site: '', // isca para robôs: fica escondida
  });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(null);

  const mudar = (campo) => (e) => {
    const valor = campo === 'telefone' ? mascaraTelefone(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((x) => ({ ...x, [campo]: undefined }));
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe seu nome';
    if (!form.telefone.trim() && !form.email.trim())
      e.telefone = 'Informe um telefone ou e-mail para falarmos com você';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Confira o e-mail';
    if (!form.consentimento)
      e.consentimento = 'Precisamos da sua autorização para entrar em contato';
    return e;
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setEnviando(true);
    try {
      const r = await enviarInteresse({ ...form, animalSlug: slug || undefined });
      setEnviado(r.protocolo);
      window.scrollTo(0, 0);
    } catch (err) {
      setErros({ ...err.campos, geral: err.message });
    } finally {
      setEnviando(false);
    }
  };

  const a = animal.dados;
  const nomeAnimal = a?.nome;

  if (enviado)
    return (
      <div className="container secao formulario-estreito text-center">
        <div className="sucesso-icone">
          <i className="fa-solid fa-check" aria-hidden="true" />
        </div>
        <h1 className="titulo-secao">Recebemos seu interesse!</h1>
        <p className="texto-suave">
          {nomeAnimal
            ? `Obrigado por querer ajudar ${a.sexo === 'FEMEA' ? 'a' : 'o'} ${nomeAnimal}. `
            : 'Obrigado! '}
          A equipe do abrigo vai entrar em contato pelo telefone ou e-mail que você deixou.
        </p>
        <p className="small texto-suave">Protocolo: {enviado.slice(0, 8).toUpperCase()}</p>
        <div className="d-grid gap-2 mt-4">
          <Link to="/animais" className="botao botao-principal botao-grande">
            Conhecer outros animais
          </Link>
          <a
            className="botao botao-contorno"
            href={linkWhatsApp(
              `Olá! Enviei um formulário pelo site (protocolo ${enviado.slice(0, 8).toUpperCase()}).`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-whatsapp" aria-hidden="true" /> Falar pelo WhatsApp
          </a>
        </div>
      </div>
    );

  return (
    <div className="container secao pt-4 formulario-estreito">
      <Link to={slug ? `/animais/${slug}` : '/animais'} className="botao botao-texto ps-0 mb-2">
        <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar
      </Link>

      {a && (
        <div className="resumo-animal cartao">
          <FotoAnimal
            src={a.fotoPrincipal}
            nome={a.nome}
            especie={a.especie}
            className="resumo-animal-foto"
          />
          <div>
            <small className="texto-suave">Você está falando sobre</small>
            <strong className="d-block fs-5">{a.nome}</strong>
          </div>
        </div>
      )}

      <h1 className="titulo-secao">
        {form.tipo === 'ADOTAR'
          ? 'Quero adotar'
          : form.tipo === 'APADRINHAR'
            ? 'Quero apadrinhar'
            : 'Fale com o abrigo'}
      </h1>
      <p className="texto-suave">Leva menos de um minuto. Não é preciso criar conta.</p>

      <form onSubmit={enviar} noValidate>
        {slug && (
          <GrupoChips
            rotulo="Como você quer ajudar?"
            opcoes={a && !a.disponivelParaAdocao ? TIPOS.slice(0, 1) : TIPOS}
            valor={form.tipo}
            aoMudar={(v) => v && setForm((f) => ({ ...f, tipo: v }))}
          />
        )}

        <CampoTexto
          rotulo="Seu nome"
          obrigatorio
          autoComplete="name"
          value={form.nome}
          onChange={mudar('nome')}
          erro={erros.nome}
          maxLength={150}
        />
        <CampoTexto
          rotulo="WhatsApp ou telefone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(47) 99999-9999"
          value={form.telefone}
          onChange={mudar('telefone')}
          erro={erros.telefone}
        />
        <CampoTexto
          rotulo="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          dica="Telefone ou e-mail: basta um dos dois."
          value={form.email}
          onChange={mudar('email')}
          erro={erros.email}
          maxLength={200}
        />
        <CampoTexto
          rotulo="Mensagem"
          multilinha
          placeholder={DICAS[form.tipo]}
          value={form.mensagem}
          onChange={mudar('mensagem')}
          maxLength={2000}
        />

        {/* Isca para robôs: pessoas não veem este campo. */}
        <div className="visualmente-oculto" aria-hidden="true">
          <label>
            Site{' '}
            <input tabIndex={-1} autoComplete="off" value={form.site} onChange={mudar('site')} />
          </label>
        </div>

        <label className={`consentimento ${erros.consentimento ? 'com-erro' : ''}`}>
          <input
            type="checkbox"
            checked={form.consentimento}
            aria-invalid={erros.consentimento ? 'true' : undefined}
            onChange={(e) => {
              setForm((f) => ({ ...f, consentimento: e.target.checked }));
              setErros((x) => ({ ...x, consentimento: undefined }));
            }}
          />
          <span>
            Autorizo o Abrigo Animal Joinville a usar meus dados só para entrar em contato sobre
            este pedido.{' '}
            <Link to="/privacidade" target="_blank">
              Saiba mais
            </Link>
          </span>
        </label>
        {erros.consentimento && <p className="campo-erro">{erros.consentimento}</p>}
        {erros.geral && (
          <p className="campo-erro" role="alert">
            {erros.geral}
          </p>
        )}

        <button
          type="submit"
          className="botao botao-principal botao-grande botao-bloco mt-3"
          disabled={enviando}
        >
          {enviando ? 'Enviando…' : 'Enviar'}
        </button>
        <p className="small texto-suave text-center mt-3">
          Prefere conversar?{' '}
          <a
            href={linkWhatsApp('Olá! Vim pelo site do Abrigo Animal.')}
            target="_blank"
            rel="noreferrer"
          >
            Chame no WhatsApp
          </a>{' '}
          ·{' '}
          <a href={CONTATO.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </p>
      </form>
    </div>
  );
}
