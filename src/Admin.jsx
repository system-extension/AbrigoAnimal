import { useContext, useState } from "react";
import { AccountContext } from "./account";
import logo from "./assets/logo-abrigo-animal.png";
import "./Admin.css";

const money = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const statuses = ["Aguardando análise", "Em análise", "Aprovada", "Recusada"];
const modules = [["overview", "◫", "Visão geral"], ["requests", "♡", "Solicitações"],
  ["pets", "♧", "Pets do abrigo"], ["finance", "↗", "Financeiro"], ["stock", "▤", "Estoque"]];
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function Admin() {
  const { isAdmin, setIsAdmin, pets, setPets, accounts, setAccounts, transactions,
    setTransactions, stock, setStock, movements, setMovements } = useContext(AccountContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [module, setModule] = useState("overview");
  const [editor, setEditor] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const requests = accounts.flatMap((account) => account.requests.map((request) => ({
    ...request, person: account.name, email: account.email, phone: account.phone, accountId: account.id,
  })));
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const lowStock = stock.filter((item) => item.quantity <= item.minimum);
  const pending = requests.filter((item) => !item.status || item.status === statuses[0]);

  function changeModule(next) {
    setMenuOpen(false); setModule(next); setEditor(null); setSearch(""); setFilter("all"); setNotice(""); setError("");
  }
  function openEditor(value) { setEditor(value); setError(""); setNotice(""); }
  function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setError("");
    if (Object.entries(data).some(([key, value]) => key !== "senior" && !value.trim())) {
      setError("Preencha os campos sem usar apenas espaços."); return;
    }
    if (editor.kind === "pet") {
      const value = { ...data, id: editor.item?.id || crypto.randomUUID(), senior: data.senior === "on" };
      setPets((current) => editor.item ? current.map((pet) => pet.id === value.id ? value : pet) : [...current, value]);
    } else if (editor.kind === "transaction") {
      const amount = Number(data.amount);
      if (!Number.isFinite(amount) || amount <= 0) return setError("Informe um valor maior que zero.");
      setTransactions((current) => [{ ...data, amount: Math.round(amount * 100) / 100, id: crypto.randomUUID() }, ...current]);
    } else if (editor.kind === "stock") {
      setStock((current) => [...current, { ...data, quantity: Number(data.quantity), minimum: Number(data.minimum), id: crypto.randomUUID() }]);
    } else if (editor.kind === "movement") {
      const quantity = Number(data.quantity);
      const item = stock.find((entry) => entry.id === editor.item.id);
      if (!item || quantity <= 0 || !Number.isFinite(quantity) || (data.type === "out" && quantity > item.quantity)) {
        setError("A saída não pode ultrapassar o saldo disponível. Informe uma quantidade válida."); return;
      }
      setStock((current) => current.map((entry) => entry.id === item.id
        ? { ...entry, quantity: Math.round((entry.quantity + (data.type === "in" ? quantity : -quantity)) * 100) / 100 } : entry));
      setMovements((current) => [{ ...data, quantity, item: item.name, unit: item.unit, date: today(), id: crypto.randomUUID() }, ...current]);
    }
    setNotice("Alteração salva nesta prévia."); setEditor(null);
  }
  function updateRequest(request, status) {
    setAccounts((current) => current.map((account) => account.id === request.accountId
      ? { ...account, requests: account.requests.map((entry) => entry.id === request.id ? { ...entry, status } : entry) } : account));
    setNotice("Status atualizado. A alteração também aparece no perfil do solicitante.");
  }
  if (!isAdmin) return <main className="section"><h1>Acesso administrativo</h1>
    <p>Entre com a conta de administrador para acessar o painel.</p><a className="button" href="#/login">Ir para o login</a></main>;

  const visibleRequests = requests.filter((item) => (filter === "all" || (item.status || statuses[0]) === filter)
    && `${item.person} ${item.dog.name}`.toLowerCase().includes(search.toLowerCase()));
  const visiblePets = pets.filter((pet) => pet.name.toLowerCase().includes(search.toLowerCase()));
  return <div className="admin-shell">
    <aside className={`admin-sidebar ${menuOpen ? "admin-sidebar--open" : ""}`}>
      <button className="admin-mobile-toggle" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Fechar" : "Menu"}</button>
      <a href="#/inicio" className="admin-brand"><img src={logo} alt="" /><span>Abrigo Animal<small>ADMINISTRAÇÃO</small></span></a>
      <p className="admin-nav-label">ESPAÇO DE GESTÃO</p>
      <nav id="admin-navigation" aria-label="Módulos administrativos">{modules.map(([key, icon, title]) =>
        <button key={key} aria-current={module === key ? "page" : undefined} onClick={() => changeModule(key)}><span aria-hidden="true">{icon}</span>{title}</button>)}</nav>
      <div className="admin-sidebar-bottom"><a href="#/inicio">↗ Ver site público</a>
        <button onClick={() => { setIsAdmin(false); window.location.assign("#/login"); }}>Sair do painel</button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-top"><span>Abrigo Animal / {modules.find(([key]) => key === module)[2]}</span><strong>Administrador <span className="admin-avatar">A</span></strong></header>
      <div className="admin-body">
        <div className="admin-title"><div><p className="eyebrow">Cuidar também é organizar</p><h1>{module === "overview" ? "Um olhar sobre o abrigo." : modules.find(([key]) => key === module)[2]}</h1>
          <p>{module === "overview" ? "Acompanhe os cuidados, os recursos e as novas histórias." : "Tudo o que você precisa, reunido em um só lugar."}</p></div>
          <span className="admin-date">{new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</span></div>
        <p className="admin-demo">Ambiente demonstrativo · alterações em memória, descartadas ao recarregar. Valores financeiros e estoque iniciais são fictícios.</p>
        {notice && <p role="status" className="admin-notice">{notice}</p>}
        {module === "overview" && <>
          <div className="admin-stats">
            <Stat label="Pets cadastrados" value={pets.length} detail={`${pets.filter((pet) => pet.senior).length} idosos recebendo cuidado`} />
            <Stat label="Solicitações pendentes" value={pending.length} detail="Esperando o primeiro contato" />
            <Stat label="Saldo registrado" value={money(income - expenses)} detail="Entradas menos saídas · todos os lançamentos" />
            <Stat label="Itens em atenção" value={lowStock.length} detail="No estoque mínimo ou abaixo" />
          </div>
          <div className="admin-chart-grid">
            <section className="admin-card"><p className="eyebrow">Recursos do abrigo</p><h2>Entradas e saídas</h2><p>Valores acumulados dos lançamentos registrados.</p>
              <Bars values={[["Entradas", income], ["Saídas", expenses]]} currency />
              <div className="admin-card-foot">Saldo disponível <strong>{money(income - expenses)}</strong></div></section>
            <section className="admin-card"><p className="eyebrow">Novos vínculos</p><h2>Solicitações por status</h2><p>Adoção e apadrinhamento no mesmo lugar.</p>
              <Bars values={statuses.map((status) => [status, requests.filter((item) => (item.status || statuses[0]) === status).length])} />
              {!requests.length && <p>Nenhuma solicitação registrada ainda.</p>}</section>
          </div>
          <div className="admin-chart-grid"><section className="admin-card"><h2>Precisam da sua atenção</h2>
            {lowStock.length ? lowStock.map((item) => <div className="admin-alert-row" key={item.id}><span>{item.name}<small>Mínimo: {item.minimum} {item.unit}</small></span><strong>{item.quantity} {item.unit}</strong></div>) : <p>Todos os itens estão acima do mínimo.</p>}
            <button className="text-button" onClick={() => changeModule("stock")}>Gerenciar estoque →</button></section>
            <section className="admin-card admin-quick"><p className="eyebrow">Cada história importa</p><h2>Um novo pet chegou?</h2><p>Cadastre sua foto e história para ajudar a encontrar uma família.</p>
              <button className="button" onClick={() => { changeModule("pets"); openEditor({ kind: "pet" }); }}>+ Cadastrar pet</button></section></div>
        </>}
        {module === "requests" && <section className="admin-card">
          <div className="admin-toolbar"><label>Buscar solicitante ou pet<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome do solicitante ou pet" /></label>
            <label>Status<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Todos</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>
          {visibleRequests.length ? <div className="admin-request-list">{visibleRequests.map((item) => <article key={item.id} className="admin-request">
            <div><span className="eyebrow">{item.type === "adoption" ? "Adoção" : "Apadrinhamento"}</span><h3>{item.dog.name} · {item.person}</h3>
              <p>{item.email} · {item.phone}</p><p>{new Date(item.date).toLocaleDateString("pt-BR")}</p>
              {item.answers && <details><summary>Ver respostas da solicitação</summary><p>Moradia: {item.answers.home}. Outros animais: {item.answers.pets}.</p><p>Motivação: {item.answers.reason}</p></details>}</div>
            <label>Status de {item.person}<select value={item.status || statuses[0]} onChange={(event) => updateRequest(item, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          </article>)}</div> : <Empty text="Nenhuma solicitação encontrada. Os pedidos feitos no site aparecerão aqui." />}
        </section>}
        {module === "pets" && <section className="admin-card">
          <div className="admin-toolbar"><label>Buscar pet<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome do pet" /></label><button className="button" onClick={() => openEditor({ kind: "pet" })}>+ Novo pet</button></div>
          <div className="admin-pet-list">{visiblePets.map((pet) => <article className="admin-pet" key={pet.id}><img src={pet.image} alt={pet.name} /><div className="admin-pet-name"><h3>{pet.name}</h3><small>{pet.senior ? "Idoso · apadrinhamento e adoção" : "Disponível para adoção"}</small></div><p className="admin-pet-age">{pet.age}</p><p className="admin-pet-size">{pet.size}</p><button aria-label={`Editar ${pet.name}`} onClick={() => openEditor({ kind: "pet", item: pet })}>Editar pet →</button></article>)}</div>
          {!visiblePets.length && <Empty text="Nenhum pet encontrado." />}
        </section>}
        {module === "finance" && <>
          <div className="admin-stats"><Stat label="Entradas" value={money(income)} /><Stat label="Saídas" value={money(expenses)} /><Stat label="Saldo" value={money(income - expenses)} /></div>
          <section className="admin-card"><div className="admin-toolbar"><h2>Lançamentos</h2><button className="button" onClick={() => openEditor({ kind: "transaction" })}>+ Novo lançamento</button></div>
            <Table headings={["Data", "Descrição", "Categoria", "Tipo", "Valor"]} rows={transactions.map((item) => [item.date.split("-").reverse().join("/"), item.description, item.category, item.type === "income" ? "Entrada" : "Saída", money(item.amount)])} />
          </section></>}
        {module === "stock" && <section className="admin-card"><div className="admin-toolbar"><h2>Itens do abrigo</h2><button className="button" onClick={() => openEditor({ kind: "stock" })}>+ Novo item</button></div>
          <Table headings={["Item", "Categoria", "Saldo", "Mínimo", "Situação", "Ação"]} rows={stock.map((item) => [item.name, item.category, `${item.quantity} ${item.unit}`, `${item.minimum} ${item.unit}`, item.quantity <= item.minimum ? "Repor estoque" : "Regular", <button key={item.id} className="admin-small-button" onClick={() => openEditor({ kind: "movement", item })}>Movimentar</button>])} />
          <h2 className="admin-history-title">Histórico de movimentações</h2><Table headings={["Data", "Item", "Tipo", "Quantidade", "Motivo"]} rows={movements.map((item) => [item.date.split("-").reverse().join("/"), item.item, item.type === "in" ? "Entrada" : "Saída", `${item.quantity} ${item.unit}`, item.reason])} />
        </section>}
        {editor && <section ref={(node) => node?.scrollIntoView({ block: "start" })} className="admin-card admin-editor" aria-labelledby="editor-title">
          <div className="admin-toolbar"><h2 id="editor-title">{editor.kind === "pet" ? editor.item ? "Editar pet" : "Cadastrar pet" : editor.kind === "transaction" ? "Novo lançamento" : editor.kind === "stock" ? "Novo item" : `Movimentar ${editor.item.name}`}</h2><button className="text-button" onClick={() => setEditor(null)}>Cancelar</button></div>
          <form key={`${editor.kind}-${editor.item?.id || "new"}`} onSubmit={save} className="admin-form">
            {editor.kind === "pet" && <>
              <Input label="Nome do pet" name="name" defaultValue={editor.item?.name} />
              <Input label="Idade" name="age" placeholder="Ex.: 3 anos" defaultValue={editor.item?.age} />
              <Select label="Porte" name="size" values={["Pequeno", "Médio", "Grande"]} defaultValue={editor.item?.size} />
              <Input label="Personalidade" name="personality" defaultValue={editor.item?.personality} />
              <Input label="URL da foto" name="image" type="url" pattern="https?://.*" defaultValue={editor.item?.image} />
              <label className="admin-checkbox"><input type="checkbox" name="senior" defaultChecked={editor.item?.senior} />Pet idoso (habilita apadrinhamento)</label>
              <label className="admin-full">História<textarea name="story" rows="3" required defaultValue={editor.item?.story} /></label>
            </>}
            {editor.kind === "transaction" && <>
              <Input label="Descrição" name="description" /><Select label="Tipo" name="type" values={[["income", "Entrada"], ["expense", "Saída"]]} />
              <Input label="Valor (R$)" name="amount" type="number" min="0.01" step="0.01" />
              <Input label="Data" name="date" type="date" defaultValue={today()} />
              <Select label="Categoria" name="category" values={["Doações", "Apadrinhamento", "Alimentação", "Veterinário", "Limpeza", "Outros"]} />
            </>}
            {editor.kind === "stock" && <>
              <Input label="Nome do item" name="name" /><Select label="Categoria" name="category" values={["Alimentação", "Medicamentos", "Limpeza", "Outros"]} />
              <Select label="Unidade" name="unit" values={["kg", "un", "L", "pacotes"]} />
              <Input label="Quantidade inicial" name="quantity" type="number" min="0" step="0.01" />
              <Input label="Estoque mínimo" name="minimum" type="number" min="0" step="0.01" />
            </>}
            {editor.kind === "movement" && <>
              <Select label="Tipo de movimentação" name="type" values={[["in", "Entrada"], ["out", "Saída"]]} />
              <Input label={`Quantidade (${editor.item.unit})`} name="quantity" type="number" min="0.01" step="0.01" />
              <Input label="Motivo" name="reason" />
            </>}
            {error && <p className="form-error admin-full" role="alert">{error}</p>}
            <button className="button admin-full" type="submit">Salvar</button>
          </form>
        </section>}
      </div>
    </main>
  </div>;
}

function Stat({ label, value, detail }) { return <article className={`admin-stat ${typeof value === "string" ? "admin-stat--money" : ""}`}><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</article>; }
function Empty({ text }) { return <p className="admin-empty">{text}</p>; }
function Input({ label, ...props }) { return <label>{label}<input required {...props} /></label>; }
function Select({ label, values, ...props }) { return <label>{label}<select {...props}>{values.map((value) => <option key={Array.isArray(value) ? value[0] : value} value={Array.isArray(value) ? value[0] : value}>{Array.isArray(value) ? value[1] : value}</option>)}</select></label>; }
function Table({ headings, rows }) { return rows.length ? <div className="admin-table-wrap"><table><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{cell}</td>)}</tr>)}</tbody></table></div> : <Empty text="Nenhum registro por enquanto." />; }
function Bars({ values, currency = false }) {
  const maximum = Math.max(1, ...values.map(([, value]) => value));
  return <div className="admin-bars">{values.map(([label, value], index) => <div key={label}>
    <div className="admin-bar-label"><span>{label}</span><strong>{currency ? money(value) : value}</strong></div>
    <div className="admin-bar-track"><div style={{ width: `${value / maximum * 100}%`, background: index % 2 ? "var(--orange)" : "var(--green-dark)" }} /></div>
  </div>)}</div>;
}





