import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ProvedorAvisos } from './context/Avisos';
import ErroInesperado from './components/ui/ErroInesperado';
import { ProvedorSessao, RequerLogin } from './context/Sessao';
import LayoutPublico from './components/layout/LayoutPublico';
import LayoutPainel from './components/layout/LayoutPainel';
import Inicio from './pages/publico/Inicio';
import Animais from './pages/publico/Animais';
import Animal from './pages/publico/Animal';
import Interesse from './pages/publico/Interesse';
import ComoAjudar from './pages/publico/ComoAjudar';
import Sobre from './pages/publico/Sobre';
import Denuncia from './pages/publico/Denuncia';
import Privacidade from './pages/publico/Privacidade';
import NaoEncontrada from './pages/publico/NaoEncontrada';
import Entrar from './pages/painel/Entrar';
import PainelInicio from './pages/painel/PainelInicio';
import PainelAnimais from './pages/painel/PainelAnimais';
import FormularioAnimal from './pages/painel/FormularioAnimal';
import PainelSolicitacoes from './pages/painel/PainelSolicitacoes';
import PainelPadrinhos from './pages/painel/PainelPadrinhos';

/** Links antigos do protótipo continuam funcionando. */
function RedirecionarPet() {
  const { id } = useParams();
  return <Navigate to={`/animais/${id}`} replace />;
}

/**
 * Rotas.
 * - Público: /animais/:slug é a mesma rota que o backend usa para a prévia no WhatsApp (Open Graph).
 * - Painel: tudo em /painel, protegido por login.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ErroInesperado>
        <ProvedorAvisos>
          <ProvedorSessao>
            <Routes>
              <Route element={<LayoutPublico />}>
                <Route index element={<Inicio />} />
                <Route path="animais" element={<Animais />} />
                <Route path="animais/:slug" element={<Animal />} />
                <Route path="animais/:slug/interesse" element={<Interesse />} />
                <Route path="quero-ajudar" element={<Interesse />} />
                <Route path="como-ajudar" element={<ComoAjudar />} />
                <Route path="sobre" element={<Sobre />} />
                <Route path="denuncia" element={<Denuncia />} />
                <Route path="privacidade" element={<Privacidade />} />
                <Route path="home" element={<Navigate to="/" replace />} />
                <Route path="catalogo" element={<Navigate to="/animais" replace />} />
                <Route path="pets/:id" element={<RedirecionarPet />} />
                <Route path="termos" element={<Navigate to="/privacidade" replace />} />
                <Route path="*" element={<NaoEncontrada />} />
              </Route>

              <Route path="painel/entrar" element={<Entrar />} />
              <Route
                path="painel"
                element={
                  <RequerLogin>
                    <LayoutPainel />
                  </RequerLogin>
                }
              >
                <Route index element={<PainelInicio />} />
                <Route path="animais" element={<PainelAnimais />} />
                <Route path="animais/novo" element={<FormularioAnimal key="novo" />} />
                <Route path="animais/:id" element={<FormularioAnimal key="editar" />} />
                <Route path="solicitacoes" element={<PainelSolicitacoes />} />
                <Route path="padrinhos" element={<PainelPadrinhos />} />
              </Route>
              <Route path="admin/*" element={<Navigate to="/painel" replace />} />
            </Routes>
          </ProvedorSessao>
        </ProvedorAvisos>
      </ErroInesperado>
    </BrowserRouter>
  );
}
