import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listarSolicitacoes, mudarStatus } from '../../api/solicitacoes';
import { rotulo, STATUS_SOLICITACAO, TIPOS_SOLICITACAO } from '../../api/rotulos';
import useCarregar from '../../hooks/useCarregar';
import { tempoRelativo } from '../../utils/formato';
import { numeroWhatsApp } from '../../utils/contato';
import { useAvisos } from '../../context/Avisos';
import Carregando from '../../components/ui/Carregando';
import Vazio from '../../components/ui/Vazio';
import Folha from '../../components/ui/Folha';
import { CampoTexto } from '../../components/ui/Campos';

const cor = (s) => STATUS_SOLICITACAO.find((x) => x.valor === s)?.cor ?? 'cinza';
const ABAS = [{ valor: '', rotulo: 'Abertos' }, ...STATUS_SOLICITACAO];

/**
 * Caixa de pedidos que chegam pelo formulário do site.
 * Fluxo: Nova → Em contato → Concluída (ou Descartada). Não é aprovação de adoção:
 * só acompanha se alguém já respondeu a pessoa.
 */
export default function PainelSolicitacoes() {
  const [aba, setAba] = useState('NOVA');
  const [aberta, setAberta] = useState(null);
  const [obs, setObs] = useState('');
  const avisar = useAvisos();
  const { dados, carregando } = useCarregar(
    () => listarSolicitacoes({ status: aba === '' ? undefined : aba }),
    [aba],
  );

  const lista = (dados?.itens ?? []).filter(
    (s) => aba !== '' || ['NOVA', 'EM_CONTATO'].includes(s.status),
  );

  const abrir = (s) => {
    setAberta(s);
    setObs(s.observacaoInterna || '');
  };

  const atualizar = async (status) => {
    try {
      await mudarStatus(aberta.id, status, obs);
      avisar.sucesso(`Marcado como "${rotulo(STATUS_SOLICITACAO, status)}"`);
      setAberta(null);
    } catch (e) {
      avisar.erro(e.message);
    }
  };

  const zap = aberta && numeroWhatsApp(aberta.telefone);
  const textoZap =
    aberta &&
    `Olá, ${aberta.nome.split(' ')[0]}! Aqui é do Abrigo Animal Joinville. Recebemos seu interesse em ${rotulo(TIPOS_SOLICITACAO, aberta.tipo).toLowerCase()}${aberta.animalNome ? ' o(a) ' + aberta.animalNome : ''}.`;

  return (
    <div>
      <h1 className="h3">Pedidos</h1>
      <p className="texto-suave small">Pessoas que preencheram o formulário do site.</p>

      <div className="chips chips-rolagem mb-3" role="tablist">
        {[ABAS[1], ABAS[2], ABAS[0], ABAS[3], ABAS[4]].map((a) => (
          <button
            key={a.valor}
            type="button"
            role="tab"
            className="chip"
            aria-pressed={aba === a.valor}
            onClick={() => setAba(a.valor)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {carregando && !dados ? (
        <Carregando />
      ) : lista.length === 0 ? (
        <Vazio icone="fa-inbox" titulo="Nada por aqui." />
      ) : (
        <ul className="lista-pedidos">
          {lista.map((s) => (
            <li key={s.id}>
              <button type="button" className="pedido" onClick={() => abrir(s)}>
                <span className="d-flex justify-content-between gap-2">
                  <strong>{s.nome}</strong>
                  <small className="texto-suave">{tempoRelativo(s.recebidaEm)}</small>
                </span>
                <span className="d-flex flex-wrap gap-1 my-1">
                  <span className="selo selo-laranja">{rotulo(TIPOS_SOLICITACAO, s.tipo)}</span>
                  {s.animalNome && <span className="selo selo-cinza">{s.animalNome}</span>}
                  <span className={`selo selo-${cor(s.status)}`}>
                    {rotulo(STATUS_SOLICITACAO, s.status)}
                  </span>
                </span>
                {s.mensagem && <small className="pedido-msg">{s.mensagem}</small>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Folha aberta={Boolean(aberta)} aoFechar={() => setAberta(null)} titulo={aberta?.nome ?? ''}>
        {aberta && (
          <>
            <p className="mb-2">
              Quer <strong>{rotulo(TIPOS_SOLICITACAO, aberta.tipo).toLowerCase()}</strong>
              {aberta.animalNome && (
                <>
                  {' '}
                  <strong>{aberta.animalNome}</strong>
                </>
              )}{' '}
              · {tempoRelativo(aberta.recebidaEm)}
            </p>
            {aberta.mensagem && (
              <blockquote className="pedido-citacao">{aberta.mensagem}</blockquote>
            )}

            <div className="d-grid gap-2 my-3">
              {zap && (
                <a
                  className="botao botao-verde"
                  href={`https://wa.me/${zap}?text=${encodeURIComponent(textoZap)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fa-brands fa-whatsapp" aria-hidden="true" /> WhatsApp{' '}
                  {aberta.telefone}
                </a>
              )}
              {aberta.telefone && (
                <a
                  className="botao botao-contorno"
                  href={`tel:${aberta.telefone.replace(/\D/g, '')}`}
                >
                  <i className="fa-solid fa-phone" aria-hidden="true" /> Ligar
                </a>
              )}
              {aberta.email && (
                <a className="botao botao-contorno" href={`mailto:${aberta.email}`}>
                  <i className="fa-solid fa-envelope" aria-hidden="true" /> {aberta.email}
                </a>
              )}
            </div>

            <CampoTexto
              rotulo="Anotação da equipe"
              multilinha
              rows={2}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex.: Liguei dia 14, volta a falar sexta"
            />

            <span className="campo-rotulo d-block mb-2">Marcar como</span>
            <div className="d-grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {STATUS_SOLICITACAO.filter((x) => x.valor !== aberta.status).map((x) => (
                <button
                  key={x.valor}
                  type="button"
                  className={`botao ${x.valor === 'DESCARTADA' ? 'botao-perigo' : 'botao-contorno'}`}
                  onClick={() => atualizar(x.valor)}
                >
                  {x.rotulo}
                </button>
              ))}
            </div>
            {aberta.tipo === 'APADRINHAR' && (
              <Link
                to={`/painel/padrinhos?novo=1&nome=${encodeURIComponent(aberta.nome)}&telefone=${encodeURIComponent(aberta.telefone || '')}&email=${encodeURIComponent(aberta.email || '')}`}
                className="botao botao-principal botao-bloco mt-3"
              >
                <i className="fa-solid fa-hand-holding-heart" aria-hidden="true" /> Cadastrar como
                padrinho
              </Link>
            )}
          </>
        )}
      </Folha>
    </div>
  );
}
