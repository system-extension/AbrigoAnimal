import { useContext, useEffect, useMemo, useState } from "react";
import logo from "./assets/logo-abrigo-animal.png";
import walkVolunteers from "./assets/voluntarios-passeando-caes.webp";
import { dogs, seniorDogsForSponsorship } from "./data/dogs";
import "./App.css";
import { AccountContext } from "./account";
import { AuthPage, ProfilePage } from "./Account.jsx";

const routes = {
  "#/login": "login", "#/cadastro": "register", "#/perfil": "profile",
  "#/inicio": "home",
  "#/adocao": "adoption",
  "#/apadrinhamento": "sponsorship",
  "#/doacoes": "donations",
  "#/role": "walk",
};

const pageMetadata = {
  home: {
    title: "Abrigo Animal Joinville",
    description:
      "Conheça cães para adoção, apadrinhe um cão idoso ou participe dos passeios do abrigo.",
  },
  adoption: {
    title: "Cães para adoção | Abrigo Animal Joinville",
    description:
      "Conheça os cães disponíveis e envie uma solicitação de adoção responsável.",
  },
  sponsorship: {
    title: "Apadrinhe um cão idoso | Abrigo Animal Joinville",
    description:
      "Conheça os cães idosos do abrigo e envie sua solicitação de apadrinhamento.",
  },
  donations: {
    title: "Doações | Abrigo Animal Joinville",
    description:
      "Veja como doar alimentos, medicamentos, produtos de limpeza ou contribuir via Pix.",
  },
  walk: {
    title: "Agende um passeio | Abrigo Animal Joinville",
    description:
      "Agende passeios aos sábados ou visitas durante a semana para escolas e lares de idosos.",
  },
};

function updateMetadata(page) {
  const metadata = pageMetadata[page] || { title: `${page === "login" ? "Entrar" : page === "register" ? "Criar conta" : "Meu perfil"} | Abrigo Animal Joinville`, description: "Sua conta no Abrigo Animal Joinville." };
  document.title = metadata.title;

  const description = document.querySelector('meta[name="description"]');
  const openGraphTitle = document.querySelector('meta[property="og:title"]');
  const openGraphDescription = document.querySelector(
    'meta[property="og:description"]',
  );

  description?.setAttribute("content", metadata.description);
  openGraphTitle?.setAttribute("content", metadata.title);
  openGraphDescription?.setAttribute("content", metadata.description);
}

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    heart: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    ),
    calendar: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    paw: (
      <>
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="7" r="2" />
        <circle cx="5" cy="13" r="2" />
        <circle cx="19" cy="13" r="2" />
        <path d="M12 11c-3.1 0-5.5 2.5-5.5 5.3 0 2.2 1.7 3.7 3.8 2.8a4.2 4.2 0 0 1 3.4 0c2.1.9 3.8-.6 3.8-2.8C17.5 13.5 15.1 11 12 11Z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13M3 12h18M7.5 8C5 8 4 6.8 4 5.5S5 3 6.5 3C9 3 12 8 12 8M16.5 8C19 8 20 6.8 20 5.5S19 3 17.5 3C15 3 12 8 12 8" />
      </>
    ),
  };
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ButtonLink({ to, children, secondary = false }) {
  return (
    <a className={`button ${secondary ? "button--secondary" : ""}`} href={to}>
      {children}
    </a>
  );
}

function Header({ page }) {
  const { account } = useContext(AccountContext);
  const [open, setOpen] = useState(false);
  const links = [
    ["home", "#/inicio", "Início"],
    ["adoption", "#/adocao", "Adoção"],
    ["sponsorship", "#/apadrinhamento", "Apadrinhamento"],
    ["donations", "#/doacoes", "Doações"],
    ["walk", "#/role", "Rolê de sábado"],
  ];
  return (
    <header className="site-header">
      <a
        className="brand"
        href="#/inicio"
        aria-label="Abrigo Animal Joinville — início"
      >
        <img src={logo} alt="" />
        <span>
          <strong>Abrigo Animal</strong>
          <small>Joinville</small>
        </span>
      </a>
      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
      <nav
        className={open ? "nav nav--open" : "nav"}
        aria-label="Navegação principal"
      >

        {links.map(([key, href, label]) => (
          <a
            key={key}
            className={page === key ? "active" : ""}
            href={href}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
        <a
          className="nav-donate"
          href={account ? "#/perfil" : "#/login"}
          onClick={() => setOpen(false)}
        >
          {account ? "Meu perfil" : "Entrar na conta"} <Icon name="user" size={17} />
        </a>
      </nav>
    </header>
  );
}

function DogCard({ dog, action = "Conhecer", onApply, onSponsor }) {
  const { account, toggleFavorite } = useContext(AccountContext);
  const favorite = account?.favorites.includes(dog.name) || false;

  return (
    <article className="dog-card">
      <div className="dog-photo">
        <img src={dog.image} alt={`${dog.name}, cão disponível para adoção`} />
        {dog.senior && <span className="priority-badge">Idoso</span>}
        <button
          className="favorite-button"
          type="button"
          aria-label={`${favorite ? "Remover" : "Adicionar"} ${dog.name} dos favoritos`}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(dog)}
        >
          <Icon name="heart" size={20} />
        </button>
      </div>
      <div className="dog-content">
        <div className="dog-title">
          <h3>{dog.name}</h3>
          <span>{dog.age}</span>
        </div>
        <div className="dog-tags">
          <span>{dog.size}</span>
          <span>{dog.personality}</span>
        </div>
        <p>{dog.story}</p>
      </div>
      <div className="dog-card-footer">
        <div>
          <small>Conheça</small>
          <strong>{dog.name}</strong>
        </div>
        <div className="card-actions">
          {dog.senior && onSponsor && (
            <button
              className="card-action card-action--secondary"
              type="button"
              onClick={() => onSponsor(dog)}
            >
              Apadrinhar
            </button>
          )}
          {onApply ? (
            <button
              className="card-action"
              type="button"
              onClick={() => onApply(dog)}
            >
              {action} <Icon name="arrow" size={17} />
            </button>
          ) : (
            <a className="card-action" href="#/adocao">
              {action} <Icon name="arrow" size={17} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ApplicationForm({ request, onClose }) {
  const { account, addRequest } = useContext(AccountContext);
  const [sent, setSent] = useState(false);
  const isSponsorship = request.type === "sponsorship";
  const title = isSponsorship
    ? `Apadrinhar ${request.dog.name}`
    : `Adotar ${request.dog.name}`;

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="form-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="application-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar formulário"
        >
          <Icon name="close" />
        </button>

        {sent ? (
          <div className="application-success" role="status">
            <span>
              <Icon name="check" size={30} />
            </span>
            <h2 id="application-title">Solicitação registrada na prévia</h2>
            <p>
              Acompanhe esta simulação no seu perfil. Nenhum dado foi enviado ao abrigo. O envio do
              formulário não garante a aprovação.
            </p>
            <button className="button" type="button" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">
              {isSponsorship
                ? "Solicitação de apadrinhamento"
                : "Adoção responsável"}
            </p>
            <h2 id="application-title">{title}</h2>
            <p className="dialog-intro">
              Conte um pouco sobre você. Essas informações ajudam a equipe a
              avaliar se este é o melhor vínculo para todos.
            </p>
            <form
              className="application-form"
              onSubmit={(event) => {
                event.preventDefault();
                addRequest(request);
                setSent(true);
              }}
            >
              <div className="form-row">
                <label>
                  Nome completo
                  <input name="name" required defaultValue={account?.name} />
                </label>
                <label>
                  WhatsApp
                  <input name="phone" type="tel" required defaultValue={account?.phone} />
                </label>
              </div>
              <label>
                E-mail
                <input name="email" type="email" required defaultValue={account?.email} />
              </label>
              <div className="form-row">
                <label>
                  Tipo de moradia
                  <select name="home" required defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option>Casa</option>
                    <option>Apartamento</option>
                    <option>Outro</option>
                  </select>
                </label>
                <label>
                  Há outros animais?
                  <select name="pets" required defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option>Sim</option>
                    <option>Não</option>
                  </select>
                </label>
              </div>
              <label>
                Por que você quer {isSponsorship ? "apadrinhar" : "adotar"}{" "}
                {request.dog.name}?
                <textarea name="reason" rows="4" required />
              </label>
              <label className="consent-field">
                <input name="consent" type="checkbox" required />
                Autorizo o contato do abrigo para conversar sobre esta
                solicitação.
              </label>
              <button className="button" type="submit">
                Enviar solicitação <Icon name="arrow" size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function HomePage() {
  const slides = [
    {
      eyebrow: "Adoção responsável",
      title: (
        <>
          Um lar muda
          <br />
          <em>uma vida.</em>
        </>
      ),
      text: "Conheça cães de diferentes idades que esperam uma família para chamar de sua.",
      href: "#/adocao",
      action: "Conheça os cães",
      image: dogs[14].image,
      imageAlt: "Cão disponível para adoção",
      note: "20 cães esperam por uma família",
    },
    {
      eyebrow: "Apadrinhamento de idosos",
      title: (
        <>
          Amor não
          <br />
          tem <em>idade.</em>
        </>
      ),
      text: "Esteja presente na vida de um cão idoso e acompanhe de perto o cuidado que ele recebe.",
      href: "#/apadrinhamento",
      action: "Apadrinhe um velhinho",
      image: dogs[0].image,
      imageAlt: "Bento, um cão idoso do abrigo",
      note: "10 idosos precisam de apoio",
    },
    {
      eyebrow: "Passeios e visitas",
      title: (
        <>
          Um passeio.
          <br />
          Rabos <em>felizes.</em>
        </>
      ),
      text: "Participe do Rolê aos sábados ou agende uma visita durante a semana com sua instituição.",
      href: "#/role",
      action: "Agende seu rolê",
      image: dogs[2].image,
      imageAlt: "Cão do abrigo durante um passeio",
      note: "Sábados, das 8h às 16h",
    },
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (paused || prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const showSlide = (index) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  return (
    <main>
      <section
        className="home-carousel"
        aria-roledescription="carrossel"
        aria-label="Principais formas de participar"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setPaused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") showSlide(activeSlide - 1);
          if (event.key === "ArrowRight") showSlide(activeSlide + 1);
        }}
      >
        {slides.map((slide, index) => (
          <div
            className={`hero-section carousel-slide ${
              index === activeSlide ? "carousel-slide--active" : ""
            }`}
            aria-hidden={index !== activeSlide}
            inert={index !== activeSlide}
            key={slide.eyebrow}
          >
            <div className="hero-copy">
              <p className="eyebrow">
                <Icon name="paw" size={17} /> {slide.eyebrow}
              </p>
              <h1>{slide.title}</h1>
              <p className="hero-text">{slide.text}</p>
              <div className="hero-actions">
                <ButtonLink to={slide.href}>
                  {slide.action} <Icon name="arrow" size={18} />
                </ButtonLink>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap">
                <img src={slide.image} alt={slide.imageAlt} />
              </div>
              <div className="hero-note">
                <span>{slide.eyebrow}</span>
                <strong>{slide.note}</strong>
              </div>
              <div className="sun-mark" aria-hidden="true">
                ✦
              </div>
            </div>
          </div>
        ))}
        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => showSlide(activeSlide - 1)}
            aria-label="Slide anterior"
          >
            ←
          </button>
          <div className="carousel-dots" aria-label="Escolher slide">
            {slides.map((slide, index) => (
              <button
                className={index === activeSlide ? "active" : ""}
                type="button"
                onClick={() => showSlide(index)}
                aria-label={`Mostrar ${slide.eyebrow}`}
                aria-current={index === activeSlide ? "true" : undefined}
                key={slide.eyebrow}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => showSlide(activeSlide + 1)}
            aria-label="Próximo slide"
          >
            →
          </button>
        </div>
      </section>
      <section className="split-callout">
        <div className="callout-mark">
          <Icon name="heart" size={52} />
        </div>
        <div>
          <p className="eyebrow">Ajuda que acompanha</p>
          <h2>
            Não pode adotar agora?
            <br />
            Você ainda pode mudar uma vida.
          </h2>
        </div>
        <div>
          <p>
            Ao apadrinhar, você ajuda com alimentação, consultas, remédios e
            todo o cuidado que um cão idoso precisa.
          </p>
          <ButtonLink to="#/apadrinhamento">Entenda como funciona</ButtonLink>
        </div>
      </section>
      <section className="section featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Eles estão esperando</p>
            <h2>Velhinhos em destaque</h2>
          </div>
          <ButtonLink to="#/adocao" secondary>
            Ver todos <Icon name="arrow" size={17} />
          </ButtonLink>
        </div>
        <div className="dog-grid">
          {dogs.slice(0, 3).map((dog) => (
            <DogCard key={dog.name} dog={dog} />
          ))}
        </div>
      </section>
      <section className="home-walk-section">
        <div className="home-walk-card">
          <p className="eyebrow">
            <Icon name="calendar" size={17} /> Rolê do Abrigo
          </p>
          <h2>Um passeio faz bem para todo mundo.</h2>
          <p>
            Aos sábados, das 8h às 16h, você pode passear com um dos cães.
            Escolas e lares de idosos também podem solicitar visitas durante a
            semana.
          </p>
          <ButtonLink to="#/role">
            Agendar um rolê <Icon name="arrow" size={18} />
          </ButtonLink>
        </div>
        <div className="home-walk-visual">
          <img
            src={walkVolunteers}
            alt="Voluntários passeando com cães em um parque"
          />
          <div className="home-walk-time">
            <span>Todo sábado</span>
            <strong>8h — 16h</strong>
            <small>Visitas institucionais de segunda a sexta</small>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdoptionPage({ onApply, onSponsor }) {
  const steps = [
    [
      "01",
      "Conversa",
      "Conte um pouco sobre sua rotina e o lar que receberá o cão.",
    ],
    [
      "02",
      "Encontro",
      "Venha ao abrigo conhecer o animal e criar esse primeiro vínculo.",
    ],
    [
      "03",
      "Novo começo",
      "Com tudo alinhado, acompanhamos a adaptação na nova casa.",
    ],
  ];
  return (
    <main>
      <section className="page-intro">
        <p className="eyebrow">Encontre seu novo amigo</p>
        <h1>
          Uma casa muda
          <br />
          uma vida inteira.
        </h1>
        <p>
          Conheça os cães que estão prontos para fazer parte da sua família. A
          adoção é responsável e acompanhada pela nossa equipe.
        </p>
      </section>
      <section className="section adoption-list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Disponíveis para adoção</p>
            <h2>Conheça cada história</h2>
          </div>
          <span className="result-count">20 cães esperando</span>
        </div>
        <div className="dog-grid">
          {dogs.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              action="Adotar"
              onApply={onApply}
              onSponsor={onSponsor}
            />
          ))}
        </div>
      </section>
      <section className="steps-section">
        <p className="eyebrow">Adoção responsável</p>
        <h2>Como funciona?</h2>
        <div className="steps-grid">
          {steps.map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SponsorshipPage({ onApply }) {
  return (
    <main>
      <section className="sponsor-hero">
        <div>
          <p className="eyebrow">Apadrinhamento</p>
          <h1>
            Esteja presente,
            <br />
            mesmo de longe.
          </h1>
          <p>
            Seu apoio recorrente garante dignidade, saúde e conforto aos cães
            que precisam de cuidados especiais.
          </p>
        </div>
        <div className="sponsor-portrait">
          <img src={dogs[1].image} alt="Amora, uma cadela idosa do abrigo" />
          <span>
            <Icon name="heart" /> Cuidado todo mês
          </span>
        </div>
      </section>
      <section className="sponsor-dogs section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Escolha seu afilhado</p>
            <h2>Quem precisa de você</h2>
          </div>
        </div>
        <div className="dog-grid">
          {seniorDogsForSponsorship.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              action="Apadrinhar"
              onApply={onApply}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function DonationsPage() {
  const categories = [
    {
      title: "Alimentos",
      text: "Ajude a manter uma alimentação adequada para os animais acolhidos.",
      items: [
        "Ração seca para cães adultos e idosos",
        "Ração úmida em sachês ou latas",
        "Petiscos apropriados para cães",
      ],
    },
    {
      title: "Medicamentos",
      text: "Medicamentos precisam estar lacrados, dentro da validade e identificados.",
      items: [
        "Antipulgas e vermífugos",
        "Materiais para curativos",
        "Medicamentos veterinários prescritos",
      ],
    },
    {
      title: "Produtos de limpeza",
      text: "Itens de uso diário ajudam a manter os espaços limpos e seguros.",
      items: [
        "Desinfetante de uso veterinário",
        "Sabão, detergente e água sanitária",
        "Sacos de lixo, luvas e papel-toalha",
      ],
    },
  ];

  return (
    <main>
      <section className="donation-hero">
        <div>
          <p className="eyebrow">
            <Icon name="gift" size={18} /> Doações
          </p>
          <h1>
            Todo cuidado
            <br />
            chega até <em>eles.</em>
          </h1>
          <p>
            Sua doação ajuda o abrigo a alimentar, medicar e manter um espaço
            seguro para cada animal acolhido.
          </p>
        </div>
        <div className="donation-stamp">
          <Icon name="heart" size={42} />
          <strong>Ajuda que vira cuidado</strong>
        </div>
      </section>

      <section className="section donation-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">O que estamos recebendo</p>
            <h2>Escolha como contribuir</h2>
          </div>
        </div>
        <div className="donation-grid">
          {categories.map((category, index) => (
            <article className="donation-card" key={category.title}>
              <span>0{index + 1}</span>
              <h3>{category.title}</h3>
              <p>{category.text}</p>
              <ul>
                {category.items.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={17} /> {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="pix-section">
        <div>
          <p className="eyebrow">Doação financeira</p>
          <h2>Contribua via Pix</h2>
          <p>
            A chave Pix oficial será publicada aqui após a confirmação dos dados
            do abrigo.
          </p>
        </div>
        <div className="pix-card">
          <small>Chave Pix</small>
          <strong>Escaneie para contribuir</strong>
          <img
            className="pix-qr-code"
            src="/pix-exemplo.png"
            alt="QR Code Pix demonstrativo"
          />
          <p className="pix-warning">
            QR Code demonstrativo — não efetua pagamentos.
          </p>
        </div>
      </section>

      <section className="dropoff-section">
        <div>
          <p className="eyebrow">Entrega de doações</p>
          <h2>Antes de levar, fale com a equipe</h2>
        </div>
        <p>
          Assim conseguimos confirmar os itens mais urgentes e combinar o melhor
          horário para receber sua contribuição.
        </p>
      </section>
    </main>
  );
}

function getNextSaturdays() {
  const dates = [],
    cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + ((6 - cursor.getDay() + 7) % 7));
  for (let i = 0; i < 4; i += 1) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return dates;
}

function WalkPage() {
  const saturdays = useMemo(() => getNextSaturdays(), []);
  const [submitted, setSubmitted] = useState(false);
  const [visitType, setVisitType] = useState("individual");
  const isInstitutional = visitType === "institutional";
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main>
      <section className="walk-hero">
        <div>
          <p className="eyebrow">
            <Icon name="calendar" size={17} /> Todo sábado
          </p>
          <h1>
            Um passeio.
            <br />
            Muitos rabos felizes.
          </h1>
          <p>
            O Rolê do Abrigo é um momento de carinho, movimento e socialização
            para os cães. Você leva a guia; eles levam a alegria.
          </p>
        </div>
        <div className="walk-card">
          <span>Sábados</span>
          <strong>8h às 16h</strong>
          <p>Abrigo Animal Joinville</p>
          <small>Não precisa ter experiência</small>
        </div>
      </section>
      <section className="booking-section">
        <div className="booking-copy">
          <p className="eyebrow">Agende seu rolê</p>
          <h2>
            {isInstitutional
              ? "Uma visita que conecta gerações"
              : "Qual sábado combina com você?"}
          </h2>
          <p>
            {isInstitutional
              ? "Escolas e lares de idosos podem solicitar visitas em grupo durante a semana."
              : "Escolha uma data e deixe seus dados. Nossa equipe confirma o agendamento antes do passeio."}
          </p>
          <ul>
            <li>
              <Icon name="check" size={18} /> Use roupa confortável
            </li>
            <li>
              <Icon name="check" size={18} /> Chegue 15 minutos antes
            </li>
            <li>
              <Icon name="check" size={18} /> Menores devem estar acompanhados
            </li>
          </ul>
        </div>
        {submitted ? (
          <div className="success-card" role="status">
            <span>
              <Icon name="check" size={32} />
            </span>
            <h3>Pedido de agendamento enviado!</h3>
            <p>
              Recebemos seus dados. A equipe do abrigo entrará em contato para
              confirmar o seu rolê.
            </p>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => setSubmitted(false)}
            >
              Fazer outro agendamento
            </button>
          </div>
        ) : (
          <form
            className="booking-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <fieldset>
              <legend>Tipo de visita</legend>
              <div className="visit-options">
                <label>
                  <input
                    type="radio"
                    name="visitType"
                    value="individual"
                    checked={!isInstitutional}
                    onChange={() => setVisitType("individual")}
                  />
                  <span>Rolê individual</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="visitType"
                    value="institutional"
                    checked={isInstitutional}
                    onChange={() => setVisitType("institutional")}
                  />
                  <span>Escola ou lar de idosos</span>
                </label>
              </div>
            </fieldset>
            <label>
              Nome do responsável
              <input
                name="name"
                required
                placeholder="Como podemos te chamar?"
              />
            </label>
            <label>
              WhatsApp
              <input
                name="phone"
                type="tel"
                required
                placeholder="(47) 99999-9999"
              />
            </label>
            {isInstitutional && (
              <div className="institution-fields">
                <label>
                  Nome da instituição
                  <input name="institution" required />
                </label>
                <div className="form-row">
                  <label>
                    Tipo de instituição
                    <select name="institutionType" required defaultValue="">
                      <option value="" disabled>
                        Selecione
                      </option>
                      <option>Escola</option>
                      <option>Lar de idosos</option>
                      <option>Outro projeto social</option>
                    </select>
                  </label>
                  <label>
                    Número de visitantes
                    <input name="groupSize" type="number" min="2" required />
                  </label>
                </div>
              </div>
            )}
            {isInstitutional ? (
              <label>
                Data desejada, de segunda a sexta
                <input
                  name="date"
                  type="date"
                  min={today}
                  required
                  onChange={(event) => {
                    const day = new Date(
                      `${event.target.value}T12:00:00`,
                    ).getDay();
                    event.target.setCustomValidity(
                      day === 0 || day === 6
                        ? "Escolha um dia de segunda a sexta-feira."
                        : "",
                    );
                  }}
                />
              </label>
            ) : (
              <fieldset>
                <legend>Escolha o sábado</legend>
                <div className="date-options">
                  {saturdays.map((date, index) => {
                    const value = date.toISOString().slice(0, 10);
                    return (
                      <label key={value}>
                        <input
                          type="radio"
                          name="date"
                          value={value}
                          required
                          defaultChecked={index === 0}
                        />
                        <span>
                          <small>
                            {date
                              .toLocaleDateString("pt-BR", { month: "short" })
                              .replace(".", "")}
                          </small>
                          <strong>{date.getDate()}</strong>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}
            <label>
              Horário
              <select name="time" defaultValue="08:00">
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
              </select>
            </label>
            <button className="button" type="submit">
              Solicitar agendamento <Icon name="arrow" size={18} />
            </button>
            <small className="form-note">
              O envio não garante a vaga. Aguarde a confirmação da equipe.
            </small>
          </form>
        )}
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <img src={logo} alt="Logo do Abrigo Animal Joinville" />
        <p>Cuidando de quem sempre cuidou da gente.</p>
      </div>
      <div>
        <strong>Visite o abrigo</strong>
        <p>Joinville — Santa Catarina</p>
        <p>Sábados, das 8h às 16h</p>
      </div>
      <div>
        <strong>Fale com a gente</strong>
        <a href="mailto:contato@abrigoanimal.org.br">
          contato@abrigoanimal.org.br
        </a>
        <a href="tel:+554700000000">(47) 0000-0000</a>
      </div>
      <p className="footer-note">
        © {new Date().getFullYear()} Abrigo Animal Joinville
      </p>
    </footer>
  );
}

function App() {
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(null);
  const account = accounts.find((item) => item.id === user);
  function updateAccount(transform) {
    setAccounts((current) => current.map((item) => item.id === user ? transform(item) : item));
  }
  function toggleFavorite(dog) {
    if (!account) {
      setPending({ dog, type: "favorite" });
      window.location.assign("#/login");
      return;
    }
    updateAccount((item) => ({ ...item, favorites: item.favorites.includes(dog.name)
      ? item.favorites.filter((name) => name !== dog.name) : [...item.favorites, dog.name] }));
  }
  function apply(dog, type) {
    if (!account) {
      setPending({ dog, type });
      window.location.assign("#/login");
      return;
    }
    setRequest({ dog, type });
  }
  function finishLogin(accountId) {
    window.location.assign("#/perfil");
    if (pending?.type === "favorite") {
      setAccounts((current) => current.map((item) => item.id === accountId
        ? { ...item, favorites: [...new Set([...item.favorites, pending.dog.name])] } : item));
    } else if (pending) setRequest(pending);
    setPending(null);
  }
  function addRequest(value) {
    updateAccount((item) => ({ ...item, requests: item.requests.some((entry) =>
      entry.dog.name === value.dog.name && entry.type === value.type)
      ? item.requests : [{ ...value, id: crypto.randomUUID(), date: new Date().toISOString() }, ...item.requests] }));
  }
  const [request, setRequest] = useState(null);
  const [page, setPage] = useState(
    () => routes[window.location.hash] || "home",
  );
  useEffect(() => {
    if (!window.location.hash)
      window.history.replaceState(null, "", "#/inicio");
    const updatePage = () => {
      const nextPage = routes[window.location.hash] || "home";
      setPage(nextPage);
      updateMetadata(nextPage);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    updatePage();
    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);
  const pages = {
    login: <AuthPage key="login" />,
    register: <AuthPage key="register" register />,
    profile: <ProfilePage DogCard={DogCard} onApply={(dog) => apply(dog, "adoption")} onSponsor={(dog) => apply(dog, "sponsorship")} />,
    home: <HomePage />,
    adoption: (
      <AdoptionPage
        onApply={(dog) => apply(dog, "adoption")}
        onSponsor={(dog) => apply(dog, "sponsorship")}
      />
    ),
    sponsorship: (
      <SponsorshipPage
        onApply={(dog) => apply(dog, "sponsorship")}
      />
    ),
    donations: <DonationsPage />,
    walk: <WalkPage />,
  };
  return (
    <AccountContext.Provider value={{ account, accounts, setAccounts, setUser, toggleFavorite, addRequest, finishLogin }}>
    <div className="site-shell">
      <Header page={page} />
      {pages[page]}
      <Footer />
      {request && account && (
        <ApplicationForm request={request} onClose={() => setRequest(null)} />
      )}
    </div>
    </AccountContext.Provider>
  );
}

export default App;




