import { useEffect, useMemo, useState } from 'react';
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
import SeletorFotos from '../../components/painel/SeletorFotos';
import Carregando from '../../components/ui/Carregando';
import Folha from '../../components/ui/Folha';
import { useAvisos } from '../../context/Avisos';
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
  const [ocupadoFotos, setOcupadoFotos] = useState(false);
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

  const mudar = (campo, valor) => {
    setAlterado(true);
    setF((x) => ({ ...x, [campo]: valor }));
    setErros((x) => ({ ...x, [campo]: undefined }));
  };
  const texto = (campo) => (e) => mudar(campo, e.target.value);

  /* Carrega o animal (edição) ou oferece o rascunho (novo). */
  const aplicarAnimal = (a) => {
    setOriginal(a);
    setF({
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
    });
    setFotos(
      a.fotos.map((x) => ({ chave: x.id, fotoId: x.id, url: x.url, principal: x.principal })),
    );
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
  const adicionarFotos = async (blobs) => {
    const novas = blobs.map((b, i) => ({
      chave: novoId(),
      url: URL.createObjectURL(b),
      blob: b,
      principal: fotos.length === 0 && i === 0,
      enviando: editando,
    }));
    setFotos((l) => [...l, ...novas]);
    if (!editando) return; // no cadastro novo, sobem junto com o "Salvar"

    setOcupadoFotos(true);
    try {
      let atual;
      for (const n of novas) atual = await api.enviarFoto(id, n.blob);
      aplicarFotosDoServidor(atual);
      avisar.sucesso(novas.length > 1 ? 'Fotos adicionadas' : 'Foto adicionada');
    } catch (e) {
      avisar.erro(e.message);
      setFotos((l) => l.filter((x) => !novas.includes(x)));
    } finally {
      setOcupadoFotos(false);
    }
  };

  const aplicarFotosDoServidor = (a) => {
    setOriginal(a);
    setFotos(
      a.fotos.map((x) => ({ chave: x.id, fotoId: x.id, url: x.url, principal: x.principal })),
    );
  };

  const removerFoto = async (foto) => {
    if (!foto.fotoId) {
      setFotos((l) => {
        const resto = l.filter((x) => x !== foto);
        if (foto.principal && resto[0]) resto[0] = { ...resto[0], principal: true };
        return resto;
      });
      return;
    }
    if (!window.confirm('Remover esta foto?')) return;
    setOcupadoFotos(true);
    try {
      aplicarFotosDoServidor(await api.removerFoto(id, foto.fotoId));
    } catch (e) {
      avisar.erro(e.message);
    } finally {
      setOcupadoFotos(false);
    }
  };

  const tornarPrincipal = async (foto) => {
    if (!foto.fotoId) {
      setFotos((l) =>
        [foto, ...l.filter((x) => x !== foto)].map((x) => ({ ...x, principal: x === foto })),
      );
      return;
    }
    setOcupadoFotos(true);
    try {
      aplicarFotosDoServidor(await api.definirFotoPrincipal(id, foto.fotoId));
    } catch (e) {
      avisar.erro(e.message);
    } finally {
      setOcupadoFotos(false);
    }
  };

  /* ------------------------------ Salvar ----------------------------- */
  const salvar = async (ev) => {
    ev?.preventDefault();
    const e = {};
    if (!f.nome.trim()) e.nome = 'Informe o nome';
    if (!f.especie) e.especie = 'Escolha cão ou gato';
    setErros(e);
    if (Object.keys(e).length) {
      document.getElementById('basico')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        const a = await api.editar(id, paraApi(f, original));
        if (a.visivelNaVitrine !== f.visivelNaVitrine)
          await api.definirVitrine(id, f.visivelNaVitrine);
        setAlterado(false);
        avisar.sucesso('Alterações salvas');
        navegar('/painel/animais');
        return;
      }
      let a = await api.criar(paraApi(f));
      // fotos na ordem: a principal primeiro (o backend marca a primeira enviada como principal)
      const ordem = [...fotos].sort((x, y) => Number(y.principal) - Number(x.principal));
      for (const foto of ordem) a = await api.enviarFoto(a.id, foto.blob);
      if (!f.visivelNaVitrine) a = await api.definirVitrine(a.id, false);
      try {
        localStorage.removeItem(RASCUNHO);
      } catch {
        /* nada */
      }
      setAlterado(false);
      setCriado(a);
    } catch (err) {
      setErros(err.campos || {});
      avisar.erro(err.message);
      if (err.status === 409) aplicarAnimal(await api.buscar(id));
    } finally {
      setSalvando(false);
    }
  };

  const novoCadastro = () => {
    setCriado(null);
    setF(VAZIO);
    setFotos([]);
    setAlterado(false);
    window.scrollTo(0, 0);
  };

  /* --------------------------- Situação/Óbito ------------------------ */
  const mudarSituacao = async (situacao) => {
    if (!situacao || situacao === original.situacao) return;
    try {
      const a = await api.mudarSituacao(id, situacao);
      setOriginal(a);
      avisar.sucesso(`Situação: ${rotulo(SITUACOES, situacao)}`);
    } catch (e) {
      avisar.erro(e.message);
    }
  };

  const confirmarObito = async () => {
    try {
      const a = await api.registrarObito(id, dataObito);
      setOriginal(a);
      setF((x) => ({ ...x, visivelNaVitrine: false }));
      setFolhaObito(false);
      avisar.info(`Óbito registrado. ${a.nome} saiu da vitrine.`);
    } catch (e) {
      avisar.erro(e.message);
    }
  };

  if (carregando) return <Carregando texto="Abrindo cadastro…" />;

  const emObito = original?.situacao === 'OBITO';
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

      <nav className="form-atalhos chips chips-rolagem" aria-label="Seções do cadastro">
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
      </nav>

      <Secao id="fotos" icone="fa-camera" titulo="Fotos" descricao="A primeira aparece na vitrine">
        <SeletorFotos
          fotos={fotos}
          aoAdicionar={adicionarFotos}
          aoRemover={removerFoto}
          aoTornarPrincipal={tornarPrincipal}
          ocupado={ocupadoFotos || salvando}
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
        <GrupoChips rotulo="Sexo" opcoes={SEXOS} valor={f.sexo} aoMudar={(v) => mudar('sexo', v)} />

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
              emObito ? 'Indisponível após óbito' : 'Desligue para esconder do site público'
            }
            marcado={f.visivelNaVitrine && !emObito}
            aoMudar={(v) => !emObito && mudar('visivelNaVitrine', v)}
          />
        </div>
      </Secao>

      {editando && (
        <Secao
          id="situacao"
          icone="fa-signal"
          titulo="Situação"
          descricao="Muda na hora, sem precisar salvar"
        >
          {emObito ? (
            <p className="mb-0 texto-suave">Óbito é definitivo: a situação não muda mais.</p>
          ) : (
            <>
              <GrupoChips
                rotulo="Situação atual"
                opcoes={SITUACOES.filter((s) => s.valor !== 'OBITO')}
                valor={original.situacao}
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
            <p className="texto-suave small mb-0">Ninguém ainda. Vincule pela tela Padrinhos.</p>
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
          {original?.atualizadoPor && (
            <p className="campo-dica mt-3 mb-0">
              Última alteração por {original.atualizadoPor}
              {original.atualizadoEm
                ? ` em ${new Date(original.atualizadoEm).toLocaleString('pt-BR')}`
                : ''}
              .
            </p>
          )}
        </Secao>
      )}

      <div className="barra-salvar">
        <Link to="/painel/animais" className="botao botao-contorno">
          Cancelar
        </Link>
        <button
          type="submit"
          className="botao botao-principal botao-grande"
          disabled={salvando || ocupadoFotos}
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

      <Folha aberta={folhaObito} aoFechar={() => setFolhaObito(false)} titulo="Registrar óbito">
        <p>
          {original?.nome} sai da vitrine e o cadastro fica guardado.{' '}
          <strong>Não dá para desfazer.</strong>
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
