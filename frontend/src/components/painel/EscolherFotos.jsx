import { useMemo, useState } from 'react';
import Folha from '../ui/Folha';

/**
 * Quando a pessoa escolhe na galeria mais fotos do que cabem.
 *
 * O seletor de arquivos do navegador não aceita limite de quantidade (o site não controla a
 * galeria do celular). Então, se vierem mais fotos do que cabem, esta folha mostra todas com as
 * primeiras já marcadas (na ordem em que vieram): na maioria das vezes basta tocar em Adicionar.
 * Para trocar, a pessoa desmarca uma e marca outra, como no Instagram: cada foto marcada tem um
 * número (1, 2, 3...) e, com o limite atingido, as outras ficam apagadas.
 *
 * arquivos: File[] escolhidos · limite: quantas cabem · aoConfirmar(File[]) · aoCancelar()
 */
export default function EscolherFotos({ arquivos, limite, aoConfirmar, aoCancelar }) {
  // índices, na ordem do toque; começa com as primeiras que cabem já marcadas
  const [escolhidas, setEscolhidas] = useState(() => arquivos.slice(0, limite).map((_, i) => i));
  // Endereços temporários para mostrar as fotos antes de enviar; liberados ao fechar.
  const previas = useMemo(() => arquivos.map((a) => URL.createObjectURL(a)), [arquivos]);
  const cheio = escolhidas.length >= limite;

  const liberar = () => previas.forEach((u) => URL.revokeObjectURL(u));

  const alternar = (i) =>
    setEscolhidas((atual) => {
      if (atual.includes(i)) return atual.filter((x) => x !== i);
      if (atual.length >= limite) return atual;
      return [...atual, i];
    });

  const confirmar = () => {
    liberar();
    aoConfirmar(escolhidas.map((i) => arquivos[i]));
  };

  const cancelar = () => {
    liberar();
    aoCancelar();
  };

  return (
    <Folha
      aberta
      aoFechar={cancelar}
      titulo={`Escolha até ${limite} ${limite === 1 ? 'foto' : 'fotos'}`}
    >
      <p className="campo-dica mb-3">
        Você selecionou {arquivos.length} fotos, mas só{' '}
        {limite === 1 ? 'cabe mais 1' : `cabem mais ${limite}`}. Já marcamos as primeiras; para
        trocar, desmarque uma e toque em outra.
      </p>
      <ul className="escolher-fotos" aria-label="Fotos selecionadas na galeria">
        {previas.map((url, i) => {
          const posicao = escolhidas.indexOf(i);
          const marcada = posicao >= 0;
          return (
            <li key={url}>
              <button
                type="button"
                className={`escolher-foto ${marcada ? 'marcada' : ''} ${cheio && !marcada ? 'bloqueada' : ''}`}
                onClick={() => alternar(i)}
                aria-pressed={marcada}
                aria-label={
                  marcada ? `Foto ${i + 1}, escolhida em ${posicao + 1}º` : `Foto ${i + 1}`
                }
              >
                <img src={url} alt="" />
                <span className="escolher-numero" aria-hidden="true">
                  {marcada ? posicao + 1 : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="escolher-rodape">
        <span className="escolher-contador">
          {escolhidas.length} de {limite}
        </span>
        <button type="button" className="botao botao-contorno" onClick={cancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="botao botao-principal"
          onClick={confirmar}
          disabled={escolhidas.length === 0}
        >
          Adicionar
        </button>
      </div>
    </Folha>
  );
}
