import { useContext, useState } from "react";
import { AccountContext, passwordDigest, validCpf } from "./account";
import { dogs } from "./data/dogs";
import "./Account.css";

const states = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

function Field({ label, ...props }) {
  return <label>{label}<input required {...props} /></label>;
}

export function AuthPage({ register = false }) {
  const { accounts, setAccounts, setUser, finishLogin, setIsAdmin } = useContext(AccountContext);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const email = data.email.trim().toLowerCase();
    setError("");
    if (!register && email === "admin@abrigo.demo" && data.password === "AdminDemo123!") {
      setUser(null);
      setIsAdmin(true);
      window.location.assign("#/admin");
      return;
    }
    if (register) {
      if (!validCpf(data.cpf)) return setError("Confira o CPF informado. Os dígitos não são válidos.");
      if (data.name.trim().split(/\s+/).length < 2) return setError("Informe seu nome completo.");
      if (data.password !== data.confirm) return setError("As senhas precisam ser iguais.");
      if (accounts.some((item) => item.email === email || item.cpf === data.cpf.replace(/\D/g, ""))) {
        return setError("Já existe um cadastro com este e-mail ou CPF nesta prévia.");
      }
    }
    setBusy(true);
    try {
      const digest = await passwordDigest(data.password);
      let account;
      if (register) {
        const { password: _password, confirm: _confirm, ...profile } = data;
        void _password;
        void _confirm;
        account = { ...profile, email, cpf: data.cpf.replace(/\D/g, ""), digest,
          id: crypto.randomUUID(), favorites: [], requests: [] };
        setAccounts((current) => [...current, account]);
      } else {
        account = accounts.find((item) => item.email === email && item.digest === digest);
        if (!account) {
          setError("E-mail ou senha incorretos. Se recarregou a prévia, crie seu cadastro novamente.");
          return;
        }
      }
      setIsAdmin(false);
      setUser(account.id);
      finishLogin(account.id);
    } catch {
      setError("Não foi possível continuar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="account-layout">
      <aside className="account-story">
        <p className="eyebrow">Seu vínculo começa aqui</p>
        <h1>Mais perto de um <em>novo amigo.</em></h1>
        <p>Um espaço para guardar seus favoritos e acompanhar cada passo da adoção ou do apadrinhamento.</p>
        <img src={dogs[0].image} alt="Bento, um dos velhinhos do abrigo" />
        <span>Pequenos gestos. Uma vida inteira de carinho.</span>
      </aside>
      <section className="account-panel">
        <a className="account-back" href="#/inicio">← Voltar ao início</a>
        <p className="eyebrow">{register ? "Faça parte dessa história" : "Que bom ter você aqui"}</p>
        <h2>{register ? "Crie sua conta" : "Entre na sua conta"}</h2>
        <p>{register ? "Preencha seus dados para começar." : "Acompanhe os vínculos que você está construindo."}</p>
        <p className="demo-note">Prévia demonstrativa: use dados fictícios. Os cadastros duram apenas até recarregar a página.</p>
        {!register && <p className="demo-note">Acesso admin de demonstração: <strong>admin@abrigo.demo</strong><br />Senha: <strong>AdminDemo123!</strong></p>}
        <form className="application-form account-form" onSubmit={submit}>
          {register && <fieldset><legend>Seus dados</legend>
            <Field label="Nome completo" name="name" autoComplete="name" maxLength={100} />
            <div className="form-row">
              <Field label="CPF" name="cpf" inputMode="numeric" placeholder="000.000.000-00" maxLength={14} />
              <Field label="WhatsApp" name="phone" type="tel" autoComplete="tel" pattern="[0-9()+ .-]{10,20}" />
            </div>
          </fieldset>}
          <Field label="E-mail" name="email" type="email" autoComplete="email" />
          {register && <fieldset><legend>Endereço completo</legend>
            <div className="form-row">
              <Field label="CEP" name="cep" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}-?[0-9]{3}" placeholder="00000-000" />
              <Field label="Bairro" name="neighborhood" maxLength={100} />
            </div>
            <Field label="Rua / avenida" name="street" autoComplete="address-line1" maxLength={150} />
            <div className="form-row">
              <Field label="Número (ou S/N)" name="number" maxLength={15} />
              <Field label="Complemento (opcional)" name="complement" required={false} autoComplete="address-line2" maxLength={100} />
            </div>
            <div className="form-row">
              <Field label="Cidade" name="city" autoComplete="address-level2" maxLength={100} />
              <label>Estado<select name="state" autoComplete="address-level1" required defaultValue="">
                <option value="" disabled>Selecione</option>
                {states.map((state) => <option key={state}>{state}</option>)}
              </select></label>
            </div>
          </fieldset>}
          <Field label={register ? "Senha (mínimo de 8 caracteres)" : "Senha"} name="password"
            type={visible ? "text" : "password"} minLength={register ? 8 : undefined}
            autoComplete={register ? "new-password" : "current-password"} />
          {register && <Field label="Confirme sua senha" name="confirm" type={visible ? "text" : "password"} autoComplete="new-password" />}
          <button className="text-button" type="button" aria-pressed={visible} onClick={() => setVisible(!visible)}>
            {visible ? "Ocultar senha" : "Mostrar senha"}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button" disabled={busy}>{busy ? "Aguarde…" : register ? "Criar minha conta" : "Entrar"}</button>
        </form>
        <p className="account-switch">{register ? "Já tem uma conta?" : "Ainda não tem conta?"} <a href={register ? "#/login" : "#/cadastro"}>{register ? "Entrar" : "Cadastre-se"}</a></p>
      </section>
    </main>
  );
}

export function ProfilePage({ DogCard, onApply, onSponsor }) {
  const { account, setUser, pets: dogs, isAdmin } = useContext(AccountContext);
  const [tab, setTab] = useState("requests");
  const [filter, setFilter] = useState("all");
  if (isAdmin) return <main className="section"><h1>Área administrativa</h1><a className="button" href="#/admin">Abrir painel</a></main>;
  if (!account) return <main className="section profile-guard"><h1>Seu espaço no abrigo</h1>
    <p>Entre na sua conta para acompanhar solicitações e ver seus favoritos.</p>
    <a className="button" href="#/login">Entrar na minha conta</a></main>;
  const favorites = dogs.filter((dog) => account.favorites.includes(dog.id));
  const requests = account.requests.filter((request) => filter === "all" || request.type === filter);
  const tabs = [["requests", "Minhas solicitações"], ["favorites", `Favoritos (${favorites.length})`], ["data", "Meus dados"]];
  return <main className="profile-page">
    <header className="profile-heading">
      <div><p className="eyebrow">Meu perfil</p><h1>Olá, {account.name.split(" ")[0]}.</h1><p>Cada vínculo tem uma história. Acompanhe a sua por aqui.</p></div>
      <button className="button button--secondary" onClick={() => { setUser(null); window.location.hash = "#/inicio"; }}>Sair da conta</button>
    </header>
    <nav className="profile-tabs" aria-label="Seções do perfil">{tabs.map(([key, title]) =>
      <button key={key} aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)}>{title}</button>)}</nav>
    <section className="profile-content">
      {tab === "requests" && <>
        <div className="section-heading"><div><h2>Minhas solicitações</h2><p>Adoção e apadrinhamento, passo a passo.</p></div>
          <label>Filtrar por <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Todas</option><option value="adoption">Adoção</option><option value="sponsorship">Apadrinhamento</option>
          </select></label></div>
        <p className="demo-note">Nesta prévia, as solicitações são simuladas e não são enviadas ao abrigo.</p>
        {requests.length ? <div className="request-list">{requests.map((request) => <article className="request-card" key={request.id}>
          <img src={request.dog.image} alt={request.dog.name} /><div>
            <p className="eyebrow">{request.type === "adoption" ? "Adoção" : "Apadrinhamento"}</p>
            <h3>{request.dog.name}</h3><p>Registrada em {new Date(request.date).toLocaleDateString("pt-BR")}</p>
            <span className="request-status">{request.status || "Aguardando análise"} · simulação</span>
            <p>Próximos passos: conversa com a equipe e avaliação da solicitação.</p>
          </div></article>)}</div> : <Empty title="Uma nova história pode começar aqui." text="Suas solicitações aparecerão neste espaço quando você demonstrar interesse em um cão." />}
      </>}
      {tab === "favorites" && <><h2>Seus favoritos</h2><p>Aqueles que já ganharam um cantinho no seu coração.</p>
        {favorites.length ? <div className="dog-grid">{favorites.map((dog) => <DogCard key={dog.name} dog={dog} action="Adotar" onApply={onApply} onSponsor={onSponsor} />)}</div>
          : <Empty title="Quem vai conquistar seu coração?" text="Toque no coração dos cards para guardar seus cães favoritos aqui." />}</>}
      {tab === "data" && <><h2>Meus dados</h2><dl className="profile-details">
        {[["Nome completo", account.name], ["E-mail", account.email], ["WhatsApp", account.phone],
          ["CPF", `***.***.***-${account.cpf.slice(-2)}`], ["Endereço", `${account.street}, ${account.number}${account.complement ? ` — ${account.complement}` : ""}`],
          ["Bairro", account.neighborhood], ["Cidade / UF", `${account.city} / ${account.state}`], ["CEP", account.cep]].map(([label, value]) =>
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl></>}
    </section>
  </main>;
}

function Empty({ title, text }) {
  return <div className="account-empty"><span aria-hidden="true">♡</span><h3>{title}</h3><p>{text}</p><a className="button" href="#/adocao">Conhecer os cães</a></div>;
}


