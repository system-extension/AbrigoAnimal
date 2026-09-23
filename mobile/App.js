import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';

import Cabecalho from './componentes/Cabecalho';
import CarrosselDestaques from './componentes/CarrosselDestaques';
import CatalogoAnimais from './componentes/CatalogoAnimais';
import TelaAnimaisDisponiveis from './componentes/TelaAnimaisDisponiveis';
import ModalPerfilAnimal from './componentes/ModalPerfilAnimal';
import ModalDoacaoPix from './componentes/ModalDoacaoPix';

// URL base da API Java REST
const URL_BASE_API = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

/**
 * Componente principal da Aplicação React Native do Abrigo Animal Joinville.
 */
export default function App() {
  const [animais, setAnimais] = useState([]);
  const [destaques, setDestaques] = useState([]);
  const [informacoes, setInformacoes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [filtroEspecie, setFiltroEspecie] = useState('todos');
  const [statusBackend, setStatusBackend] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState('inicio');

  // Estados dos Modais
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [modalPixVisivel, setModalPixVisivel] = useState(false);

  // Carrega dados iniciais da API REST Java
  useEffect(() => {
    carregarDadosBackend();
  }, [filtroEspecie]);

  const carregarDadosBackend = async () => {
    try {
      setCarregando(true);
      
      // Busca a lista de animais filtrada por espécie
      const resAnimais = await fetch(`${URL_BASE_API}/animais?especie=${filtroEspecie}`);
      if (resAnimais.ok) {
        const dadosAnimais = await resAnimais.json();
        setAnimais(dadosAnimais);
        setStatusBackend(true);
      }

      // Busca destaques
      const resDestaques = await fetch(`${URL_BASE_API}/destaques`);
      if (resDestaques.ok) {
        const dadosDestaques = await resDestaques.json();
        setDestaques(dadosDestaques);
      }

      // Busca informações gerais do abrigo
      const resInfo = await fetch(`${URL_BASE_API}/informacoes`);
      if (resInfo.ok) {
        const dadosInfo = await resInfo.json();
        setInformacoes(dadosInfo);
      }
    } catch (erro) {
      console.log('Erro ao conectar à API Java REST:', erro);
      setStatusBackend(false);
    } finally {
      setCarregando(false);
    }
  };

  const enviarSolicitacaoAdocao = async (dadosSolicitacao) => {
    const resposta = await fetch(`${URL_BASE_API}/adocoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosSolicitacao)
    });
    return await resposta.json();
  };

  const tratarAcaoCarrossel = (acao) => {
    if (acao === 'doar_pix') {
      setModalPixVisivel(true);
    } else if (acao === 'ver_animais') {
      setFiltroEspecie('todos');
      setTelaAtiva('animais');
    } else if (acao === 'apadrinhar') {
      setFiltroEspecie('cachorro');
    }
  };

  return (
    <SafeAreaView style={estilos.conteinerRaiz}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      
      {/* Cabeçalho da Aplicação */}
      <Cabecalho 
        aoAbrirModalPix={() => setModalPixVisivel(true)} 
        statusConexaoBackend={statusBackend}
      />

      {telaAtiva === 'animais' ? (
        <TelaAnimaisDisponiveis
          listaAnimais={animais}
          carregando={carregando}
          aoVoltar={() => setTelaAtiva('inicio')}
          aoSelecionarAnimal={(animal) => setAnimalSelecionado(animal)}
        />
      ) : (
      <ScrollView style={estilos.areaRolagem} showsVerticalScrollIndicator={false}>
        {/* Carrossel de Banners e Campanhas */}
        <CarrosselDestaques 
          listaDestaques={destaques}
          aoSelecionarAcao={tratarAcaoCarrossel}
        />

        {/* Indicador de Carregamento */}
        {carregando ? (
          <View style={estilos.areaCarregando}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={estilos.textoCarregando}>Conectando ao Abrigo Joinville...</Text>
          </View>
        ) : (
          /* Catálogo de Animais Resgatados */
          <CatalogoAnimais 
            listaAnimais={animais}
            filtroEspecie={filtroEspecie}
            aoAlterarFiltro={setFiltroEspecie}
            aoSelecionarAnimal={(animal) => setAnimalSelecionado(animal)}
            aoVerTodos={() => {
              setFiltroEspecie('todos');
              setTelaAtiva('animais');
            }}
          />
        )}

        {/* Rodapé Informativo */}
        <View style={estilos.rodape}>
          <Text style={estilos.tituloRodape}>Abrigo Animal Joinville</Text>
          <Text style={estilos.textoRodape}>
            {informacoes?.endereco || 'Estrada Mário Bächtold, 445, Joinville, Santa Catarina'}
          </Text>
          <Text style={estilos.textoRodape}>
            {informacoes?.telefone || '(47) 99999-8888'} • {informacoes?.email || 'contato@abrigojoinville.org.br'}
          </Text>
          <Text style={estilos.copyright}>
            © 2026 Abrigo Animal Joinville — Backend Java 21 & React Native.
          </Text>
        </View>
      </ScrollView>
      )}

      {/* Modal de Perfil do Animal & Adoção */}
      <ModalPerfilAnimal 
        animal={animalSelecionado}
        visivel={!!animalSelecionado}
        aoFechar={() => setAnimalSelecionado(null)}
        aoEnviarSolicitacaoAdocao={enviarSolicitacaoAdocao}
      />

      {/* Modal de Doação PIX */}
      <ModalDoacaoPix 
        informacoes={informacoes}
        visivel={modalPixVisivel}
        aoFechar={() => setModalPixVisivel(false)}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  conteinerRaiz: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  areaRolagem: {
    flex: 1,
  },
  areaCarregando: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
  },
  textoCarregando: {
    color: '#94A3B8',
    fontSize: 14,
  },
  rodape: {
    backgroundColor: '#090D16',
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
  },
  tituloRodape: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textoRodape: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  copyright: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 16,
  }
});
