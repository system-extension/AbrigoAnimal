import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as pessoas from '../../api/pessoas';
import * as apadrinhamentos from '../../api/apadrinhamentos';
import * as animais from '../../api/animais';
import { rotulo, TIPOS_APOIO } from '../../api/rotulos';
import useCarregar from '../../hooks/useCarregar';
import { useAvisos } from '../../context/Avisos';
import { mascaraTelefone, dataBR } from '../../utils/formato';
import Carregando from '../../components/ui/Carregando';
import Vazio from '../../components/ui/Vazio';
import Folha from '../../components/ui/Folha';
import { CampoTexto, GrupoChips } from '../../components/ui/Campos';
import FotoAnimal from '../../components/pets/FotoAnimal';

const PESSOA_VAZIA = { nome: '', telefone: '', email: '', observacoes: '', consentimento: false };

/** Ficha da pessoa: afilhados + vincular a um novo animal. */
function FichaPessoa({ pessoa, aoFechar }) {
  const avisar = useAvisos();
  const vinculos = useCarregar(() => apadrinhamentos.listar({ pessoaId: pessoa.id }), [pessoa.id]);
  const [vinculando, setVinculando] = useState(false);
  const [busca, setBusca] = useState('');
  const [escolhido, setEscolhido] = useState(null);
  const [tipo, setTipo] = useState('AFETIVO');
  const opcoes = useCarregar(
    () =>
      vinculando
        ? animais.listar({ busca: busca || undefined, tamanho: 20 })
        : Promise.resolve(null),
    [vinculando, busca],
  );

  const vincular = async () => {
    try {
      await apadrinhamentos.criar({ pessoaId: pessoa.id, animalId: escolhido.id, tipoApoio: tipo });
      avisar.sucesso(`${pessoa.nome.split(' ')[0]} agora apadrinha ${escolhido.nome}`);
      setVinculando(false);
      setEscolhido(null);
      vinculos.recarregar();
    } catch (e) {
      avisar.erro(e.message);
    }
  };

  const encerrar = async (v) => {
    if (!window.confirm(`Encerrar o apadrinhamento de ${v.animalNome}?`)) return;
    try {
      await apadrinhamentos.encerrar(v.id);
      vinculos.recarregar();
    } catch (e) {
      avisar.erro(e.message);
    }
  };

  const ativos = (vinculos.dados ?? []).filter((v) => v.ativo);
  const antigos = (vinculos.dados ?? []).filter((v) => !v.ativo);

  return (
    <Folha aberta aoFechar={aoFechar} titulo={pessoa.nome}>
      <p className="small texto-suave mb-3">
        {[pessoa.telefone, pessoa.email].filter(Boolean).join(' · ')}
        {pessoa.observacoes && <span className="d-block mt-1">{pessoa.observacoes}</span>}
      </p>

      <h3 className="h6">Afilhados</h3>
      {vinculos.carregando && !vinculos.dados ? (
        <Carregando />
      ) : ativos.length === 0 ? (
        <p className="texto-suave small">Nenhum afilhado ativo.</p>
      ) : (
        <ul className="list-unstyled d-grid gap-2">
          {ativos.map((v) => (
            <li key={v.id} className="vinculo">
              <span>
                <strong>{v.animalNome}</strong>
                <small className="d-block texto-suave">
                  {rotulo(TIPOS_APOIO, v.tipoApoio)} · desde {dataBR(v.dataInicio)}
                </small>
              </span>
              <button type="button" className="botao botao-texto" onClick={() => encerrar(v)}>
                Encerrar
              </button>
            </li>
          ))}
        </ul>
      )}
      {antigos.length > 0 && (
        <p className="small texto-suave">
          Anteriores: {antigos.map((v) => `${v.animalNome} (até ${dataBR(v.dataFim)})`).join(', ')}
        </p>
      )}

      {!vinculando ? (
        <button
          type="button"
          className="botao botao-principal botao-bloco mt-2"
          onClick={() => setVinculando(true)}
        >
          <i className="fa-solid fa-link" aria-hidden="true" /> Vincular a um animal
        </button>
      ) : (
        <div className="cartao-interno mt-2 p-3">
          {!escolhido ? (
            <>
              <input
                className="entrada mb-2"
                type="search"
                placeholder="Buscar animal pelo nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                autoFocus
              />
              <ul className="list-unstyled d-grid gap-1 mb-0 escolha-animal">
                {(opcoes.dados?.itens ?? [])
                  .filter((a) => a.situacao !== 'OBITO')
                  .map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        className="linha-animal"
                        onClick={() => setEscolhido(a)}
                      >
                        <FotoAnimal
                          src={a.fotoPrincipal}
                          nome={a.nome}
                          especie={a.especie}
                          className="linha-animal-foto"
                        />
                        <span className="linha-animal-texto">
                          <strong>{a.nome}</strong>
                          {a.idoso && <small>Idoso</small>}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          ) : (
            <>
              <p>
                Apadrinhar <strong>{escolhido.nome}</strong>{' '}
                <button type="button" className="botao-link" onClick={() => setEscolhido(null)}>
                  trocar
                </button>
              </p>
              <GrupoChips
                rotulo="Tipo de apoio"
                opcoes={TIPOS_APOIO}
                valor={tipo}
                aoMudar={(v) => v && setTipo(v)}
              />
              <button
                type="button"
                className="botao botao-principal botao-bloco"
                onClick={vincular}
              >
                Confirmar
              </button>
            </>
          )}
          <button
            type="button"
            className="botao botao-texto botao-bloco mt-1"
            onClick={() => setVinculando(false)}
          >
            Cancelar
          </button>
        </div>
      )}
    </Folha>
  );
}

export default function PainelPadrinhos() {
  const [params, setParams] = useSearchParams();
  const avisar = useAvisos();
  const [busca, setBusca] = useState('');
  const [ficha, setFicha] = useState(null);
  // Vindo de um pedido (?novo=1&nome=...): abre o cadastro já preenchido.
  const [nova, setNova] = useState(() =>
    params.get('novo')
      ? {
          ...PESSOA_VAZIA,
          nome: params.get('nome') || '',
          telefone: params.get('telefone') || '',
          email: params.get('email') || '',
          consentimento: true,
        }
      : null,
  );
  const [erros, setErros] = useState({});
  const lista = useCarregar(() => pessoas.listar({ busca: busca.trim() || undefined }), [busca]);

  useEffect(() => {
    if (params.get('novo')) setParams({}, { replace: true });
  }, [params, setParams]);

  const salvarPessoa = async (e) => {
    e.preventDefault();
    try {
      const p = await pessoas.salvar({ ...nova, consentimento: nova.consentimento });
      avisar.sucesso('Pessoa cadastrada');
      setNova(null);
      setErros({});
      lista.recarregar();
      setFicha(p);
    } catch (err) {
      setErros(err.campos || {});
      avisar.erro(err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Padrinhos</h1>
        <button
          type="button"
          className="botao botao-principal"
          onClick={() => setNova(PESSOA_VAZIA)}
        >
          <i className="fa-solid fa-user-plus" aria-hidden="true" /> Nova pessoa
        </button>
      </div>

      <div className="busca mb-3">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          type="search"
          className="entrada"
          placeholder="Nome, telefone ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar pessoa"
        />
      </div>

      {lista.carregando && !lista.dados ? (
        <Carregando />
      ) : lista.dados.itens.length === 0 ? (
        <Vazio icone="fa-hand-holding-heart" titulo="Ninguém cadastrado ainda.">
          <p className="small">Cadastre os padrinhos que hoje estão nos termos em papel.</p>
        </Vazio>
      ) : (
        <ul className="lista-pedidos">
          {lista.dados.itens.map((p) => (
            <li key={p.id}>
              <button type="button" className="pedido" onClick={() => setFicha(p)}>
                <strong>{p.nome}</strong>
                <small className="texto-suave">
                  {[p.telefone, p.email].filter(Boolean).join(' · ')}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}

      {ficha && <FichaPessoa pessoa={ficha} aoFechar={() => setFicha(null)} />}

      <Folha aberta={Boolean(nova)} aoFechar={() => setNova(null)} titulo="Nova pessoa">
        {nova && (
          <form onSubmit={salvarPessoa} noValidate>
            <CampoTexto
              rotulo="Nome"
              obrigatorio
              value={nova.nome}
              onChange={(e) => setNova({ ...nova, nome: e.target.value })}
              erro={erros.nome}
              autoCapitalize="words"
            />
            <CampoTexto
              rotulo="Telefone"
              type="tel"
              inputMode="tel"
              value={nova.telefone}
              onChange={(e) => setNova({ ...nova, telefone: mascaraTelefone(e.target.value) })}
              erro={erros.telefone}
            />
            <CampoTexto
              rotulo="E-mail"
              type="email"
              inputMode="email"
              value={nova.email}
              onChange={(e) => setNova({ ...nova, email: e.target.value })}
              erro={erros.email}
            />
            <CampoTexto
              rotulo="Observações"
              multilinha
              rows={2}
              value={nova.observacoes}
              onChange={(e) => setNova({ ...nova, observacoes: e.target.value })}
            />
            <label className="consentimento mb-3">
              <input
                type="checkbox"
                checked={nova.consentimento}
                onChange={(e) => setNova({ ...nova, consentimento: e.target.checked })}
              />
              <span>
                A pessoa autorizou guardar estes dados (termo assinado ou formulário do site).
              </span>
            </label>
            <button type="submit" className="botao botao-principal botao-grande botao-bloco">
              Salvar
            </button>
          </form>
        )}
      </Folha>
    </div>
  );
}
