import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../../api/animais';
import * as apadrinhamentos from '../../api/apadrinhamentos';
import {
  ALAS,
  CASTRADO,
  CORES_COMUNS,
  ESPECIES,
  PORTES,
  SEXOS,
  SITUACOES,
  TEMPERAMENTOS,
  VACINAS,
  dataPorIdade,
  idadePorData,
  rotulo,
  TIPOS_APOIO,
} from '../../api/rotulos';
import { CampoTexto, GrupoChips, Interruptor } from '../../components/ui/Campos';
import SeletorFotos, { MAX_FOTOS } from '../../components/painel/SeletorFotos';
import Carregando from '../../components/ui/Carregando';
import Folha from '../../components/ui/Folha';
import TrilhoChips from '../../components/ui/TrilhoChips';
import { useAvisos } from '../../context/Avisos';
import usePresencaEdicao from '../../hooks/usePresencaEdicao';
import { novoId } from '../../utils/id';
import './painel.css';

// v2: vacinas viraram [{ tipo, ultimaDose }]; rascunhos no formato antigo são ignorados
const RASCUNHO = 'abrigo-rascunho-animal-v2';

const VAZIO = {
  nome: '',
  especie: 'CAO',
  sexo: null,
  idadeAnos: null,
  idoso: false,
  cor: '',
  porte: null,
  temperamento: [],
  ala: null,
  canil: '',
  chip: '',
  chipAdicional: '',
  castrado: null,
  medicacaoContinua: false,
  medicacoes: '',
  condicoesSaude: '',
  /** [{ tipo, ultimaDose }] — ultimaDose '' = não sabe quando */
  vacinas: [],
  descricao: '',
  visivelNaVitrine: true,
};

/** Chips marcados → lista de vacinas, preservando as datas já digitadas. */
function vacinasMarcadas(atuais, tipos) {
  return tipos.map((tipo) => atuais.find((v) => v.tipo === tipo) ?? { tipo, ultimaDose: '' });
}

const hoje = () => new Date().toISOString().slice(0, 10);
const hora = (instante) =>
  new Date(instante).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Campos que a outra pessoa mudou (conflito 409), para dizer "mudou: Descrição, Vacinas". */
const CAMPOS_CONFLITO = [
  ['nome', 'Nome'],
  ['especie', 'Espécie'],
  ['sexo', 'Sexo'],
  ['dataNascimentoEstimada', 'Idade'],
  ['idoso', 'Idoso'],
  ['porte', 'Porte'],
  ['cor', 'Cor'],
  ['castrado', 'Castrado'],
  ['medicacoes', 'Medicações'],
  ['condicoesSaude', 'Condições de saúde'],
  ['vacinas', 'Vacinas'],
  ['temperamento', 'Temperamento'],
  ['descricao', 'História'],
  ['ala', 'Ala'],
  ['canil', 'Canil'],
  ['chip', 'Chip'],
  ['chipAdicional', 'Segundo chip'],
  ['visivelNaVitrine', 'Vitrine'],
  ['situacao', 'Situação'],
];
/** Animal como veio do servidor → estado do formulário. */
function formDe(a) {
  return {
    ...VAZIO,
    ...a,
    sexo: a.sexo === 'INDEFINIDO' ? 'INDEFINIDO' : a.sexo,
    cor: a.cor ?? '',
    canil: a.canil ?? '',
    chip: a.chip ?? '',
    chipAdicional: a.chipAdicional ?? '',
    medicacoes: a.medicacoes ?? '',
    condicoesSaude: a.condicoesSaude ?? '',
    descricao: a.descricao ?? '',
    temperamento: a.temperamento ?? [],
    idadeAnos: idadePorData(a.dataNascimentoEstimada),
    vacinas: (a.vacinas ?? []).map((v) => ({ tipo: v.tipo, ultimaDose: v.ultimaDose ?? '' })),
  };
}

/** Campos que a pessoa pode mudar na tela (o resto do estado é do servidor: id, versão, datas). */
const CAMPOS_DO_FORMULARIO = [...Object.keys(VAZIO), 'situacao'];
const igual = (x, y) => JSON.stringify(x ?? null) === JSON.stringify(y ?? null);

/**
 * "Ficar com o que eu fiz" sem apagar o trabalho da outra pessoa: parte do que ela salvou e
 * aplica por cima SÓ os campos que eu mudei. Campo que os dois mudaram: vale o meu.
 * Óbito registrado pela outra pessoa é definitivo: minha troca de situação é descartada.
 * Devolve o formulário combinado e o que aconteceu, para avisar na tela.
 */
function combinar(meuInicio, meuAtual, deles) {
  const combinado = formDe(deles);
  const meus = [];
  for (const campo of CAMPOS_DO_FORMULARIO) {
    if (!igual(meuAtual[campo], meuInicio[campo])) {
      combinado[campo] = meuAtual[campo];
      meus.push(campo);
    }
  }
  let obitoDeles = false;
  if (deles.situacao === 'OBITO' && combinado.situacao !== 'OBITO') {
    combinado.situacao = 'OBITO';
    combinado.visivelNaVitrine = false;
    obitoDeles = meus.includes('situacao') || meus.includes('visivelNaVitrine');
  }
  return { combinado, obitoDeles };
}

/** Resumo do que mudou nas fotos entre duas versões: "adicionou 2, removeu 1, trocou a principal". */
function mudancasNasFotos(antes, depois) {
  const idsAntes = new Set((antes?.fotos ?? []).map((x) => x.id));
  const idsDepois = new Set((depois?.fotos ?? []).map((x) => x.id));
  const adicionadas = [...idsDepois].filter((x) => !idsAntes.has(x)).length;
  const removidas = [...idsAntes].filter((x) => !idsDepois.has(x)).length;
  const principalAntes = antes?.fotos?.find((x) => x.principal)?.id;
  const principalDepois = depois?.fotos?.find((x) => x.principal)?.id;
  const partes = [];
  if (adicionadas) partes.push(`adicionou ${adicionadas}`);
  if (removidas) partes.push(`removeu ${removidas}`);
  if (principalAntes !== principalDepois && principalDepois && idsAntes.has(principalDepois))
    partes.push('trocou a principal');
  return partes.length ? `Fotos (${partes.join(', ')})` : null;
}

function camposAlterados(antes, depois) {
  const campos = CAMPOS_CONFLITO.filter(([campo]) => !igual(antes?.[campo], depois?.[campo])).map(
    ([, nome]) => nome,
  );
  const fotos = mudancasNasFotos(antes, depois);
  return fotos ? [...campos, fotos] : campos;
}

/** Estado da tela → corpo que o backend espera (AnimalRequest). */
function paraApi(f, original) {
  const idadeMudou = idadePorData(original?.dataNascimentoEstimada) !== f.idadeAnos;
  return {
    nome: f.nome.trim(),
    especie: f.especie,
    sexo: f.sexo || 'INDEFINIDO',
    cor: f.cor.trim() || null,
    // Só recalcula a data se a idade mudou: evita "andar" a data a cada edição.
    dataNascimentoEstimada: idadeMudou
      ? dataPorIdade(f.idadeAnos)
      : (original?.dataNascimentoEstimada ?? null),
    castrado: f.castrado,
    chip: f.chip.trim() || null,
    chipAdicional: f.chipAdicional.trim() || null,
    canil: f.canil.trim() || null,
    ala: f.ala,
    idoso: f.idoso,
    descricao: f.descricao.trim() || null,
    medicacoes: f.medicacaoContinua ? f.medicacoes.trim() || null : null,
    condicoesSaude: f.condicoesSaude.trim() || null,
    // a lista enviada substitui a anterior no backend
    vacinas: f.vacinas.map((v) => ({ tipo: v.tipo, ultimaDose: v.ultimaDose || null })),
    porte: f.porte,
    temperamento: f.temperamento,
    versao: original?.versao,
  };
}

function Secao({ id, icone, titulo, descricao, children }) {
  return (
    <section id={id} className="cartao form-secao" aria-labelledby={id + '-t'}>
      <div className="form-secao-cabeca">
        <span className="form-secao-icone">
          <i className={`fa-solid ${icone}`} aria-hidden="true" />
        </span>
        <div>
          <h2 id={id + '-t'} className="h6 mb-0">
            {titulo}
          </h2>
          {descricao && <small className="texto-suave">{descricao}</small>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function FormularioAnimal() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navegar = useNavigate();
  const avisar = useAvisos();

  const [original, setOriginal] = useState(null);
  const [f, setF] = useState(VAZIO);
  const [fotos, setFotos] = useState([]);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [removidas, setRemovidas] = useState([]); // ids de fotos gravadas que a pessoa tirou
  // principal quando a pessoa abriu o cadastro: só trocamos a principal no servidor se ela trocou
  const [principalCarregada, setPrincipalCarregada] = useState(null);
  const [criado, setCriado] = useState(null);
  const [folhaObito, setFolhaObito] = useState(false);
  const [dataObito, setDataObito] = useState(new Date().toISOString().slice(0, 10));
  const [padrinhos, setPadrinhos] = useState([]);
  const [temRascunho, setTemRascunho] = useState(() => {
    if (editando) return false;
    try {
      return Boolean(localStorage.getItem(RASCUNHO));
    } catch {
      return false;
    }
  });
  const [alterado, setAlterado] = useState(false);
  // Aviso de presença (ADR 0014): outra pessoa com este cadastro aberto
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [decidiuEditar, setDecidiuEditar] = useState(false);
  const outros = usePresencaEdicao('animal', id, editando && !carregando && !somenteLeitura);
  // Conflito 409: alguém salvou antes. Guarda a versão atual do servidor; a digitação fica na tela.
  const [conflito, setConflito] = useState(null);

  const mudar = (campo, valor) => {
    setAlterado(true);
    setF((x) => ({ ...x, [campo]: valor }));
    setErros((x) => ({ ...x, [campo]: undefined }));
  };
  const texto = (campo) => (e) => mudar(campo, e.target.value);

  /* Carrega o animal (edição) ou oferece o rascunho (novo). */
  const aplicarAnimal = (a) => {
    setOriginal(a);
    setF(formDe(a));
    setFotos(
      a.fotos.map((x) => ({ chave: x.id, fotoId: x.id, url: x.mini, principal: x.principal })),
    );
    setRemovidas([]);
    setPrincipalCarregada(a.fotos.find((x) => x.principal)?.id ?? null);
  };

  useEffect(() => {
    if (!editando) return;
    api
      .buscar(id)
      .then(aplicarAnimal)
      .catch((e) => avisar.erro(e.message))
      .finally(() => setCarregando(false));
    apadrinhamentos
      .listar({ animalId: id })
      .then(setPadrinhos)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /*
   * "Só visualizar": a tela não fica parada numa versão velha. A cada 30 s (e ao voltar para a
   * aba) confere se alguém salvou e, se sim, mostra a versão nova com um aviso.
   */
  const versaoNaTela = useRef(null);
  useEffect(() => {
    versaoNaTela.current = original?.versao ?? null;
  }, [original]);
  useEffect(() => {
    if (!somenteLeitura || !editando) return;
    const conferir = async () => {
      if (document.visibilityState === 'hidden') return;
      const atual = await api.buscar(id).catch(() => null);
      if (atual && atual.versao !== versaoNaTela.current) {
        aplicarAnimal(atual);
        avisar.info(`Atualizado com o que ${atual.atualizadoPorNome || 'outra pessoa'} salvou.`);
      }
    };
    const relogio = setInterval(conferir, 30_000);
    document.addEventListener('visibilitychange', conferir);
    return () => {
      clearInterval(relogio);
      document.removeEventListener('visibilitychange', conferir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [somenteLeitura, editando, id]);

  /** "Editar mesmo assim": antes de liberar os campos, garante que a tela tem a versão mais nova. */
  const editarMesmoAssim = async () => {
    if (!alterado) {
      const atual = await api.buscar(id).catch(() => null);
      if (atual && atual.versao !== original?.versao) {
        aplicarAnimal(atual);
        avisar.info(
          `Carregamos o que ${atual.atualizadoPorNome || 'outra pessoa'} salvou antes de você editar.`,
        );
      }
    }
    setSomenteLeitura(false);
    setDecidiuEditar(true);
  };

  /* Rascunho automático (só no cadastro novo; fotos não entram no rascunho). */
  useEffect(() => {
    if (editando || !alterado) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(RASCUNHO, JSON.stringify(f));
      } catch {
        /* sem armazenamento */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [f, editando, alterado]);

  /* Aviso ao sair com alterações não salvas. */
  useEffect(() => {
    const antes = (e) => {
      if (alterado && !criado) e.preventDefault();
    };
    window.addEventListener('beforeunload', antes);
    return () => window.removeEventListener('beforeunload', antes);
  }, [criado, alterado]);

  const sugerirIdoso = useMemo(
    () => !f.idoso && f.idadeAnos !== null && f.idadeAnos >= (f.especie === 'GATO' ? 10 : 8),
    [f.idoso, f.idadeAnos, f.especie],
  );

  /* ------------------------------ Fotos ------------------------------ */
  /*
   * As fotos ficam "em espera" na tela até o Salvar/Cadastrar, como o resto do cadastro:
   * adicionar, remover e trocar a principal só mexem nesta lista. O Cancelar descarta tudo
   * (nada foi enviado). `removidas` guarda as fotos já gravadas que a pessoa tirou.
   */
  const marcarAlterado = () => setAlterado(true);

  const adicionarFotos = (blobs) => {
    const novas = blobs.map((b, i) => ({
      chave: novoId(),
      url: URL.createObjectURL(b),
      blob: b,
      principal: fotos.length === 0 && i === 0,
    }));
    setFotos((l) => [...l, ...novas]);
    marcarAlterado();
  };

  const removerFoto = (foto) => {
    if (foto.fotoId) setRemovidas((r) => [...r, foto.fotoId]);
    setFotos((l) => {
      const resto = l.filter((x) => x !== foto);
      if (foto.principal && resto[0]) resto[0] = { ...resto[0], principal: true };
      return resto;
    });
    marcarAlterado();
  };

  const tornarPrincipal = (foto) => {
    setFotos((l) =>
      [foto, ...l.filter((x) => x !== foto)].map((x) => ({ ...x, principal: x === foto })),
    );
    marcarAlterado();
  };

  /**
   * Leva para o servidor as mudanças de fotos que estavam em espera: primeiro remove (libera
   * espaço no limite de 10), depois envia as novas e por fim acerta a principal.
   * Devolve o animal como ficou no servidor.
   */
  const gravarFotos = async (animalId, atual) => {
    const avisos = [];
    let a = atual;
    const noServidor = () => new Set(a.fotos.map((x) => x.id));

    // 1. Remove só o que ainda existe: a outra pessoa pode ter removido a mesma foto antes.
    for (const fotoId of removidas) {
      if (noServidor().has(fotoId)) a = await api.removerFoto(animalId, fotoId);
    }

    // 2. Envia as novas que couberem no limite (a principal primeiro, se for nova).
    const novas = fotos
      .filter((x) => x.blob)
      .sort((x, y) => Number(y.principal) - Number(x.principal));
    const cabem = novas.slice(0, Math.max(0, MAX_FOTOS - a.fotos.length));
    if (cabem.length < novas.length) {
      avisos.push(
        cabem.length
          ? `Só ${cabem.length === 1 ? 'coube 1' : `couberam ${cabem.length}`} das suas ${novas.length} fotos novas: o limite é ${MAX_FOTOS} por animal e outra pessoa também adicionou fotos.`
          : `Suas ${novas.length} fotos novas não couberam: o animal já tem ${MAX_FOTOS} fotos (outra pessoa adicionou antes).`,
      );
    }
    const idDaNova = new Map();
    for (const foto of cabem) {
      const antes = noServidor();
      a = await api.enviarFoto(animalId, foto.blob);
      const nova = a.fotos.find((x) => !antes.has(x.id));
      if (nova) idDaNova.set(foto, nova.id);
    }

    // 3. Principal: só mexe se EU troquei (senão manteria a escolha antiga por cima da outra pessoa).
    const minha = fotos.find((x) => x.principal);
    const euTroquei = minha && (minha.blob || minha.fotoId !== principalCarregada);
    if (euTroquei) {
      const principalId = minha.blob ? idDaNova.get(minha) : minha.fotoId;
      if (!principalId) {
        // a nova principal não coube: o aviso de limite já explica
      } else if (!noServidor().has(principalId)) {
        avisos.push(
          'A foto que você escolheu como principal foi removida por outra pessoa; a principal continua a que estava.',
        );
      } else if (principalId !== a.fotos.find((x) => x.principal)?.id) {
        a = await api.definirFotoPrincipal(animalId, principalId);
      }
    }
    return { a, avisos };
  };

  /**
   * Grava as fotos; se algo falhar no meio (internet caiu, por exemplo), os dados do cadastro já
   * estão salvos: avisa, recarrega do servidor o que de fato ficou gravado e devolve null.
   */
  const gravarFotosOuAvisar = async (animalId, atual) => {
    try {
      const { a, avisos } = await gravarFotos(animalId, atual);
      avisos.forEach((texto) => avisar.info(texto));
      return a;
    } catch (e) {
      avisar.erro(
        `Os dados foram salvos, mas nem todas as fotos: ${e.message} Confira e tente de novo.`,
      );
      if (editando) {
        const recarregado = await api.buscar(animalId).catch(() => null);
        if (recarregado) aplicarAnimal(recarregado);
        setAlterado(false);
      }
      return null;
    }
  };

  const temMudancaNasFotos =
    removidas.length > 0 ||
    fotos.some((x) => x.blob) ||
    fotos.find((x) => x.principal)?.fotoId !== principalCarregada;

  /* ------------------------------ Salvar ----------------------------- */
  /** base: a versão sobre a qual salvar (no "salvar por cima" é a versão que a outra pessoa gravou). */
  const salvar = async (ev, base = original, form = f) => {
    ev?.preventDefault();
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome';
    if (!form.especie) e.especie = 'Escolha cão ou gato';
    setErros(e);
    if (Object.keys(e).length) {
      document.getElementById('basico')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        let a = await api.editar(id, paraApi(form, base));
        a = await gravarSituacao(a, form);
        if (a.visivelNaVitrine !== form.visivelNaVitrine && a.situacao !== 'OBITO')
          a = await api.definirVitrine(id, form.visivelNaVitrine);
        if (temMudancaNasFotos && !(await gravarFotosOuAvisar(id, a))) return;
        setAlterado(false);
        avisar.sucesso('Alterações salvas');
        navegar('/painel/animais');
        return;
      }
      let a = await api.criar(paraApi(f));
      if (fotos.length) a = (await gravarFotosOuAvisar(a.id, a)) ?? a;
      if (!f.visivelNaVitrine) a = await api.definirVitrine(a.id, false);
      try {
        localStorage.removeItem(RASCUNHO);
      } catch {
        /* nada */
      }
      setAlterado(false);
      setCriado(a);
    } catch (err) {
      if (err.status === 409 && editando) {
        // Não recarrega o formulário: o que a pessoa digitou continua na tela e ela decide.
        const atual = await api.buscar(id).catch(() => null);
        setConflito({ atual, mudou: atual ? camposAlterados(base, atual) : [] });
      } else {
        setErros(err.campos || {});
        avisar.erro(err.message);
      }
    } finally {
      setSalvando(false);
    }
  };

  /**
   * Junta o que a outra pessoa salvou com o que eu mudei (só os campos que mudei) e coloca na
   * tela. Assim nem "Ficar com o que eu fiz" nem "Voltar e conferir" apagam o trabalho dela.
   */
  const juntarComOQueFoiSalvo = () => {
    const { atual } = conflito;
    const { combinado, obitoDeles } = combinar(formDe(original), f, atual);
    if (obitoDeles) {
      const nome = atual.atualizadoPorNome || 'Outra pessoa da equipe';
      avisar.info(
        `${nome} registrou óbito: a situação não muda mais. O resto do que você fez vale.`,
      );
    }
    setF(combinado);
    setOriginal(atual);
    setConflito(null);
    return { atual, combinado };
  };

  const salvarPorCima = () => {
    const { atual, combinado } = juntarComOQueFoiSalvo();
    salvar(null, atual, combinado);
  };

  const descartarMinhas = () => {
    aplicarAnimal(conflito.atual);
    setAlterado(false);
    setConflito(null);
    avisar.info('Pronto: agora a tela mostra o que a outra pessoa salvou.');
  };

  /** Fechar a folha sem escolher: a tela mostra os dois trabalhos juntos para conferir antes de salvar. */
  const revisarAntes = () => {
    if (!conflito.atual) {
      setConflito(null);
      return;
    }
    const { atual } = juntarComOQueFoiSalvo();
    const nome = atual.atualizadoPorNome || 'a outra pessoa';
    avisar.info(
      `A tela agora junta o que ${nome} salvou com o que você mudou. Confira e toque em Salvar.`,
    );
  };

  const novoCadastro = () => {
    setCriado(null);
    setF(VAZIO);
    setFotos([]);
    setAlterado(false);
    window.scrollTo(0, 0);
  };

  /* --------------------------- Situação/Óbito ------------------------ */
  // Como o resto do cadastro, só vale no Salvar (Cancelar desfaz).
  const mudarSituacao = (situacao) => {
    if (situacao) mudar('situacao', situacao);
  };

  const confirmarObito = () => {
    mudar('situacao', 'OBITO');
    mudar('visivelNaVitrine', false);
    setFolhaObito(false);
    avisar.info('Óbito anotado: ele só é registrado quando você tocar em Salvar.');
  };

  const desfazerObito = () => {
    mudar('situacao', original.situacao);
    mudar('visivelNaVitrine', original.visivelNaVitrine);
  };

  /** Grava a situação depois dos dados (o óbito também tira da vitrine no servidor). */
  const gravarSituacao = async (atual, form = f) => {
    if (form.situacao === atual.situacao || atual.situacao === 'OBITO') return atual;
    return form.situacao === 'OBITO'
      ? api.registrarObito(id, dataObito)
      : api.mudarSituacao(id, form.situacao);
  };

  if (carregando) return <Carregando texto="Abrindo cadastro…" />;

  const emObito = original?.situacao === 'OBITO';
  const obitoPendente = !emObito && f.situacao === 'OBITO';
  // nome de quem salvou no conflito (nunca o e-mail)
  const quemSalvou = conflito?.atual?.atualizadoPorNome || 'Outra pessoa da equipe';
  const artigo = f.sexo === 'FEMEA' ? 'a' : 'o';

  return (
    <form className="form-animal" onSubmit={salvar} noValidate>
      <div className="painel-titulo">
        <Link
          to="/painel/animais"
          className="botao botao-texto botao-icone"
          aria-label="Voltar para a lista"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="h4 mb-0">
            {editando ? `Editar ${original?.nome ?? ''}` : 'Cadastrar animal'}
          </h1>
          <small className="texto-suave">
            Só nome e espécie são obrigatórios. Dá para completar depois.
          </small>
        </div>
      </div>

      {temRascunho && (
        <div className="aviso-rascunho">
          <span>Você tem um cadastro não terminado.</span>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="botao botao-verde"
              onClick={() => {
                try {
                  setF({ ...VAZIO, ...JSON.parse(localStorage.getItem(RASCUNHO)) });
                } catch {
                  /* rascunho inválido */
                }
                setTemRascunho(false);
              }}
            >
              Continuar
            </button>
            <button
              type="button"
              className="botao botao-contorno"
              onClick={() => {
                try {
                  localStorage.removeItem(RASCUNHO);
                } catch {
                  /* nada */
                }
                setTemRascunho(false);
              }}
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {emObito && (
        <div className="aviso-obito">
          <i className="fa-solid fa-dove" aria-hidden="true" /> Óbito registrado
          {original.dataObito
            ? ` em ${new Date(original.dataObito + 'T12:00').toLocaleDateString('pt-BR')}`
            : ''}
          . O cadastro fica guardado, mas fora da vitrine.
        </div>
      )}

      {outros.length > 0 && !decidiuEditar && !alterado && (
        <div className="aviso-presenca" role="alert">
          <span>
            <i className="fa-solid fa-user-pen" aria-hidden="true" />{' '}
            <strong>{outros[0].nome}</strong> está editando este cadastro desde{' '}
            {hora(outros[0].desde)}
            {outros.length > 1 && ` (e mais ${outros.length - 1})`}.
          </span>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="botao botao-principal"
              onClick={() => setSomenteLeitura(true)}
            >
              Só visualizar
            </button>
            <button type="button" className="botao botao-contorno" onClick={editarMesmoAssim}>
              Editar mesmo assim
            </button>
          </div>
        </div>
      )}
      {outros.length > 0 && (decidiuEditar || alterado) && (
        <p className="aviso-presenca-discreto" role="status">
          <i className="fa-solid fa-user-pen" aria-hidden="true" />{' '}
          {outros.map((o) => o.nome).join(', ')} também {outros.length > 1 ? 'estão' : 'está'} com
          este cadastro aberto. Se as duas pessoas salvarem, o sistema avisa.
        </p>
      )}
      {somenteLeitura && (
        <div className="aviso-presenca">
          <span>
            <i className="fa-solid fa-eye" aria-hidden="true" /> Você está só visualizando.
          </span>
          <button type="button" className="botao botao-contorno" onClick={editarMesmoAssim}>
            Editar mesmo assim
          </button>
        </div>
      )}

      <TrilhoChips as="nav" className="form-atalhos" aria-label="Seções do cadastro">
        {[
          ['fotos', 'Fotos'],
          ['basico', 'Básico'],
          ['saude', 'Saúde'],
          ['historia', 'História'],
          ['abrigo', 'No abrigo'],
          ...(editando ? [['situacao', 'Situação']] : []),
        ].map(([alvo, nome]) => (
          <a key={alvo} href={'#' + alvo} className="chip chip-pequeno">
            {nome}
          </a>
        ))}
      </TrilhoChips>

      {/* "Só visualizar": um fieldset desligado trava todos os campos e botões de uma vez */}
      <fieldset className="form-campos" disabled={somenteLeitura}>
        <Secao
          id="fotos"
          icone="fa-camera"
          titulo="Fotos"
          descricao="A primeira aparece na vitrine"
        >
          <SeletorFotos
            fotos={fotos}
            aoAdicionar={adicionarFotos}
            aoRemover={removerFoto}
            aoTornarPrincipal={tornarPrincipal}
            ocupado={salvando}
            pendente={editando && temMudancaNasFotos}
          />
        </Secao>

        <Secao id="basico" icone="fa-id-card" titulo="Básico">
          <CampoTexto
            rotulo="Nome"
            obrigatorio
            value={f.nome}
            onChange={texto('nome')}
            erro={erros.nome}
            maxLength={120}
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder="Ex.: Thor"
          />
          <GrupoChips
            rotulo="Espécie *"
            opcoes={ESPECIES}
            valor={f.especie}
            aoMudar={(v) => v && mudar('especie', v)}
            erro={erros.especie}
          />
          <GrupoChips
            rotulo="Sexo"
            opcoes={SEXOS}
            valor={f.sexo}
            aoMudar={(v) => mudar('sexo', v)}
          />

          <div className="campo">
            <span className="campo-rotulo">Idade aproximada</span>
            <div className="contador">
              <button
                type="button"
                className="botao botao-contorno botao-icone"
                aria-label="Diminuir idade"
                onClick={() =>
                  mudar('idadeAnos', f.idadeAnos === null ? 0 : Math.max(0, f.idadeAnos - 1))
                }
              >
                <i className="fa-solid fa-minus" aria-hidden="true" />
              </button>
              <output aria-live="polite">
                {f.idadeAnos === null
                  ? 'Não sei'
                  : f.idadeAnos === 0
                    ? 'Filhote'
                    : `${f.idadeAnos} ${f.idadeAnos === 1 ? 'ano' : 'anos'}`}
              </output>
              <button
                type="button"
                className="botao botao-contorno botao-icone"
                aria-label="Aumentar idade"
                onClick={() =>
                  mudar('idadeAnos', f.idadeAnos === null ? 1 : Math.min(30, f.idadeAnos + 1))
                }
              >
                <i className="fa-solid fa-plus" aria-hidden="true" />
              </button>
              {f.idadeAnos !== null && (
                <button
                  type="button"
                  className="botao botao-texto"
                  onClick={() => mudar('idadeAnos', null)}
                >
                  Não sei
                </button>
              )}
            </div>
          </div>

          <div className="cartao-interno">
            <Interruptor
              titulo={`Idos${artigo}`}
              descricao="Ganha destaque na vitrine e na busca por padrinhos"
              marcado={f.idoso}
              aoMudar={(v) => mudar('idoso', v)}
            />
            {sugerirIdoso && (
              <button type="button" className="sugestao" onClick={() => mudar('idoso', true)}>
                <i className="fa-solid fa-lightbulb" aria-hidden="true" /> Com {f.idadeAnos} anos,
                marcar como idos{artigo}?
              </button>
            )}
          </div>

          <GrupoChips
            rotulo="Porte"
            opcoes={PORTES}
            valor={f.porte}
            aoMudar={(v) => mudar('porte', v)}
            dica={f.especie === 'GATO' ? 'Opcional para gatos' : undefined}
          />
          <CampoTexto
            rotulo="Cor"
            value={f.cor}
            onChange={texto('cor')}
            maxLength={80}
            list="cores-comuns"
            placeholder="Ex.: Caramelo"
          />
          <datalist id="cores-comuns">
            {CORES_COMUNS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Secao>

        <Secao
          id="saude"
          icone="fa-stethoscope"
          titulo="Saúde"
          descricao="Aparece na vitrine. Não é prontuário: só o resumo."
        >
          <div className="cartao-interno mb-3">
            <Interruptor
              titulo="Usa medicação contínua"
              marcado={f.medicacaoContinua}
              aoMudar={(v) => mudar('medicacaoContinua', v)}
            />
          </div>
          {f.medicacaoContinua && (
            <CampoTexto
              rotulo="Quais medicações?"
              multilinha
              rows={2}
              value={f.medicacoes}
              onChange={texto('medicacoes')}
              maxLength={5000}
              placeholder="Ex.: Remédio para o coração, 2x ao dia"
            />
          )}
          <GrupoChips
            rotulo={f.sexo === 'FEMEA' ? 'Castrada?' : 'Castrado?'}
            dica="Deixe sem marcar se ainda não sabe."
            opcoes={CASTRADO}
            valor={f.castrado}
            aoMudar={(v) => mudar('castrado', v)}
          />
          <GrupoChips
            rotulo="Vacinas tomadas"
            dica="Só registra o que já tomou. A data é opcional."
            multipla
            opcoes={VACINAS}
            valor={f.vacinas.map((v) => v.tipo)}
            aoMudar={(tipos) => mudar('vacinas', vacinasMarcadas(f.vacinas, tipos))}
          />
          {f.vacinas.length > 0 && (
            <div className="vacinas-datas">
              {f.vacinas.map((v) => (
                <CampoTexto
                  key={v.tipo}
                  rotulo={`${rotulo(VACINAS, v.tipo)}: última dose`}
                  type="date"
                  max={hoje()}
                  value={v.ultimaDose}
                  onChange={(e) =>
                    mudar(
                      'vacinas',
                      f.vacinas.map((x) =>
                        x.tipo === v.tipo ? { ...x, ultimaDose: e.target.value } : x,
                      ),
                    )
                  }
                />
              ))}
            </div>
          )}
          <CampoTexto
            rotulo="Condições e cuidados"
            multilinha
            rows={2}
            value={f.condicoesSaude}
            onChange={texto('condicoesSaude')}
            maxLength={5000}
            placeholder="Ex.: Artrose leve, prefere caminhadas curtas"
          />
        </Secao>

        <Secao
          id="historia"
          icone="fa-heart"
          titulo="História e jeito"
          descricao="É o que convence alguém a ajudar"
        >
          <GrupoChips
            rotulo="Temperamento"
            multipla
            opcoes={TEMPERAMENTOS}
            valor={f.temperamento}
            aoMudar={(v) => mudar('temperamento', v)}
          />
          <CampoTexto
            rotulo="Conte sobre ele(a)"
            dica="Do que gosta, como se comporta, há quanto tempo está no abrigo. Use o microfone do teclado para ditar."
            multilinha
            rows={5}
            value={f.descricao}
            onChange={texto('descricao')}
            maxLength={5000}
          />
          <p className="campo-dica text-end mt-n2">{f.descricao.length}/5000</p>
        </Secao>

        <Secao
          id="abrigo"
          icone="fa-house-chimney"
          titulo="No abrigo"
          descricao="Uso interno: não aparece na vitrine"
        >
          <GrupoChips
            rotulo="Ala"
            opcoes={ALAS}
            valor={f.ala}
            aoMudar={(v) => mudar('ala', v)}
            rolagem
          />
          <div className="row g-2">
            <div className="col-5">
              <CampoTexto
                rotulo="Canil"
                value={f.canil}
                onChange={texto('canil')}
                maxLength={40}
                placeholder="Ex.: 14A, Solto A"
              />
            </div>
            <div className="col-7">
              <CampoTexto
                rotulo="Nº do chip"
                value={f.chip}
                onChange={texto('chip')}
                erro={erros.chip}
                maxLength={40}
                inputMode="numeric"
              />
            </div>
          </div>
          <CampoTexto
            rotulo="Segundo chip (opcional)"
            dica="Quando o primeiro parou de ler e outro foi aplicado."
            value={f.chipAdicional}
            onChange={texto('chipAdicional')}
            maxLength={40}
            inputMode="numeric"
          />
          <div className="cartao-interno">
            <Interruptor
              titulo="Mostrar na vitrine"
              descricao={
                emObito || obitoPendente
                  ? 'Indisponível após óbito'
                  : 'Desligue para esconder do site público'
              }
              marcado={f.visivelNaVitrine && !emObito && !obitoPendente}
              aoMudar={(v) => !emObito && !obitoPendente && mudar('visivelNaVitrine', v)}
            />
          </div>
        </Secao>

        {editando && (
          <Secao
            id="situacao"
            icone="fa-signal"
            titulo="Situação"
            descricao="Vale quando você tocar em Salvar"
          >
            {emObito ? (
              <p className="mb-0 texto-suave">Óbito é definitivo: a situação não muda mais.</p>
            ) : obitoPendente ? (
              <div className="aviso-obito">
                <p className="mb-2">
                  <i className="fa-solid fa-dove" aria-hidden="true" /> Óbito em{' '}
                  {new Date(dataObito + 'T12:00').toLocaleDateString('pt-BR')}: será registrado
                  quando você tocar em <strong>Salvar</strong>.
                </p>
                <button type="button" className="botao botao-contorno" onClick={desfazerObito}>
                  Desfazer
                </button>
              </div>
            ) : (
              <>
                <GrupoChips
                  rotulo="Situação atual"
                  opcoes={SITUACOES.filter((s) => s.valor !== 'OBITO')}
                  valor={f.situacao}
                  aoMudar={mudarSituacao}
                />
                <button
                  type="button"
                  className="botao botao-perigo botao-bloco"
                  onClick={() => setFolhaObito(true)}
                >
                  <i className="fa-solid fa-dove" aria-hidden="true" /> Registrar óbito
                </button>
              </>
            )}
            <h3 className="h6 mt-4">Padrinhos e madrinhas</h3>
            {padrinhos.filter((p) => p.ativo).length === 0 ? (
              <p className="texto-suave small mb-0">
                {padrinhos.length === 0
                  ? 'Ninguém ainda. Vincule pela tela Padrinhos.'
                  : 'Nenhum padrinho no momento. Vincule pela tela Padrinhos.'}
              </p>
            ) : (
              <ul className="list-unstyled d-grid gap-2 mb-0">
                {padrinhos
                  .filter((p) => p.ativo)
                  .map((p) => (
                    <li key={p.id} className="d-flex justify-content-between">
                      <span>{p.pessoaNome}</span>
                      <span className="selo selo-verde">{rotulo(TIPOS_APOIO, p.tipoApoio)}</span>
                    </li>
                  ))}
              </ul>
            )}
            {padrinhos.some((p) => !p.ativo) && (
              <p className="campo-dica mt-2 mb-0">
                Já apadrinharam:{' '}
                {padrinhos
                  .filter((p) => !p.ativo)
                  .map((p) => p.pessoaNome)
                  .join(', ')}
                .
              </p>
            )}
            {original?.atualizadoEm && (
              <p className="campo-dica mt-3 mb-0">
                {/* só o nome da pessoa: o login (e-mail) não aparece para a equipe */}
                Última alteração
                {original.atualizadoPorNome ? ` por ${original.atualizadoPorNome}` : ''} em{' '}
                {new Date(original.atualizadoEm).toLocaleString('pt-BR')}.
              </p>
            )}
          </Secao>
        )}
      </fieldset>

      {/* Salvar só fica disponível depois de alguma mudança (campos, fotos, situação, óbito) */}
      <div className="barra-salvar">
        <Link to="/painel/animais" className="botao botao-contorno">
          {somenteLeitura ? 'Voltar' : 'Cancelar'}
        </Link>
        <button
          type="submit"
          className="botao botao-principal botao-grande"
          disabled={salvando || somenteLeitura || !alterado}
        >
          {salvando ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Salvando…
            </>
          ) : (
            <>
              <i className="fa-solid fa-check" aria-hidden="true" />{' '}
              {editando ? 'Salvar' : 'Cadastrar'}
            </>
          )}
        </button>
      </div>

      <Folha
        aberta={Boolean(criado)}
        aoFechar={() => navegar('/painel/animais')}
        titulo="Cadastrado!"
      >
        {criado && (
          <div className="text-center">
            <div className="sucesso-mini">
              <i className="fa-solid fa-check" aria-hidden="true" />
            </div>
            <p>
              <strong>{criado.nome}</strong> já está no sistema
              {criado.visivelNaVitrine ? ' e aparece na vitrine.' : ' (fora da vitrine).'}
            </p>
            <div className="d-grid gap-2">
              <button
                type="button"
                className="botao botao-principal botao-grande"
                onClick={novoCadastro}
              >
                <i className="fa-solid fa-plus" aria-hidden="true" /> Cadastrar outro
              </button>
              {criado.visivelNaVitrine && (
                <Link
                  to={`/animais/${criado.slug}`}
                  className="botao botao-contorno"
                  target="_blank"
                >
                  Ver na vitrine
                </Link>
              )}
              <Link to="/painel/animais" className="botao botao-texto">
                Voltar para a lista
              </Link>
            </div>
          </div>
        )}
      </Folha>

      <Folha
        aberta={Boolean(conflito)}
        aoFechar={revisarAntes}
        titulo="Outra pessoa salvou este cadastro"
      >
        {conflito && (
          <>
            <p>
              <strong>{quemSalvou}</strong> salvou
              {conflito.atual ? ` às ${hora(conflito.atual.atualizadoEm)}` : ''}, enquanto você
              editava. <strong>O que você escreveu ainda está na tela.</strong>
            </p>
            {conflito.mudou.length > 0 && (
              <p className="small">
                O que mudou: <strong>{conflito.mudou.join(', ')}</strong>.
              </p>
            )}
            <div className="d-grid gap-2">
              {conflito.atual && (
                <button
                  type="button"
                  className="botao botao-principal botao-grande"
                  onClick={salvarPorCima}
                >
                  Ficar com o que eu fiz
                </button>
              )}
              {conflito.atual && (
                <button type="button" className="botao botao-contorno" onClick={descartarMinhas}>
                  {conflito.atual.atualizadoPorNome
                    ? `Ficar com o que ${conflito.atual.atualizadoPorNome} salvou`
                    : 'Ficar com o que foi salvo'}
                </button>
              )}
              <button type="button" className="botao botao-texto" onClick={revisarAntes}>
                Voltar e conferir
              </button>
            </div>
          </>
        )}
      </Folha>

      <Folha aberta={folhaObito} aoFechar={() => setFolhaObito(false)} titulo="Registrar óbito">
        <p>
          {original?.nome} sai da vitrine e o cadastro fica guardado. O óbito é registrado ao tocar
          em Salvar; <strong>depois disso, não dá para desfazer.</strong>
        </p>
        <CampoTexto
          rotulo="Data"
          type="date"
          value={dataObito}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDataObito(e.target.value)}
        />
        {padrinhos.some((p) => p.ativo) && (
          <p className="small aviso-obito">Lembre de avisar os padrinhos de {original?.nome}.</p>
        )}
        <div className="d-grid gap-2">
          <button
            type="button"
            className="botao botao-perigo botao-grande"
            onClick={confirmarObito}
          >
            Confirmar óbito
          </button>
          <button type="button" className="botao botao-texto" onClick={() => setFolhaObito(false)}>
            Cancelar
          </button>
        </div>
      </Folha>
    </form>
  );
}
