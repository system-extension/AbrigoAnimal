import { useState } from 'react';
import { Link } from 'react-router-dom';
import Folha from '../ui/Folha';
import { USAR_API_REAL } from '../../api/config';
import './videos.css';

/**
 * Vídeos dos animais (ADR 0009).
 * - Na vitrine aparecem só a capa e o botão de play: nada é baixado até a pessoa tocar
 *   (no 4G, cinco vídeos tocando sozinhos gastariam dados e bateria).
 * - Vídeo do YouTube: toca pelo youtube-nocookie.com (sem cookies de rastreamento antes do play).
 * - Vídeo de exemplo (demonstração): arquivo local.
 */
const capa = (v) =>
  v.poster || (v.youtubeId ? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg` : null);

export function CartaoVideo({ video, aoAbrir, mostrarAnimal = true }) {
  return (
    <button
      type="button"
      className="cartao-video"
      onClick={() => aoAbrir(video)}
      aria-label={`Assistir: ${video.titulo}`}
    >
      {capa(video) ? (
        <img src={capa(video)} alt="" loading="lazy" />
      ) : (
        <span className="cartao-video-sem-capa" />
      )}
      <span className="cartao-video-play" aria-hidden="true">
        <i className="fa-solid fa-play" />
      </span>
      <span className="cartao-video-texto">
        <strong>{video.titulo}</strong>
        {mostrarAnimal && <small>{video.animalNome}</small>}
      </span>
      {!USAR_API_REAL && <span className="cartao-video-exemplo">Exemplo</span>}
    </button>
  );
}

export function Reprodutor({ video, aoFechar, mostrarLinkAnimal = true }) {
  return (
    <Folha aberta={Boolean(video)} aoFechar={aoFechar} titulo={video?.titulo ?? ''}>
      {video && (
        <>
          <div className="reprodutor">
            {video.youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&playsinline=1&rel=0`}
                title={video.titulo}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={video.arquivo}
                poster={video.poster}
                controls
                autoPlay
                playsInline
                muted
                loop
              />
            )}
          </div>
          {!USAR_API_REAL && (
            <p className="small texto-suave mt-2 mb-0">
              Vídeo de exemplo, montado com fotos do mural. Na versão final, os vídeos vêm do canal
              da ONG no YouTube.
            </p>
          )}
          {mostrarLinkAnimal && (
            <Link
              to={`/animais/${video.animalSlug}`}
              className="botao botao-principal botao-bloco mt-3"
              onClick={aoFechar}
            >
              Conhecer {video.animalNome}{' '}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          )}
        </>
      )}
    </Folha>
  );
}

/** Trilho horizontal de vídeos + reprodutor. */
export default function TrilhoVideos({ videos, mostrarAnimal = true }) {
  const [aberto, setAberto] = useState(null);
  if (!videos?.length) return null;
  return (
    <>
      <div className="trilho-videos">
        {videos.map((v) => (
          <CartaoVideo key={v.id} video={v} aoAbrir={setAberto} mostrarAnimal={mostrarAnimal} />
        ))}
      </div>
      <Reprodutor
        video={aberto}
        aoFechar={() => setAberto(null)}
        mostrarLinkAnimal={mostrarAnimal}
      />
    </>
  );
}
