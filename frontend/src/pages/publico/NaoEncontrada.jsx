import { Link } from 'react-router-dom';
import Vazio from '../../components/ui/Vazio';

export default function NaoEncontrada() {
  return (
    <div className="container secao">
      <Vazio icone="fa-map-signs" titulo="Página não encontrada">
        <p>O endereço não existe ou mudou.</p>
        <Link to="/" className="botao botao-principal">
          Voltar ao início
        </Link>
      </Vazio>
    </div>
  );
}
