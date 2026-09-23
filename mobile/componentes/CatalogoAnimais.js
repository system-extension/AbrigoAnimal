import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';

/**
 * Componente do Catálogo de Animais em React Native.
 * Exibe a grade de animais resgatados e a barra de seleção por espécie.
 */
export default function CatalogoAnimais({ 
  listaAnimais, 
  filtroEspecie, 
  aoAlterarFiltro, 
  aoSelecionarAnimal,
  aoVerTodos
}) {
  const opcoesFiltro = [
    { chave: 'todos', rotulo: '🐾 Todos os Amigos' },
    { chave: 'cachorro', rotulo: '🐶 Cães' },
    { chave: 'gato', rotulo: '🐱 Gatos' }
  ];

  const renderizarCardAnimal = ({ item }) => (
    <View style={estilos.cardAnimal}>
      <View style={estilos.conteinerFoto}>
        <Image 
          source={{ uri: item.urlFoto }} 
          style={estilos.fotoAnimal} 
          resizeMode="cover"
        />
        <View style={estilos.badgeEspecie}>
          <Text style={estilos.textoBadgeEspecie}>
            {item.especie === 'cachorro' ? '🐶 Cão' : '🐱 Gato'}
          </Text>
        </View>
      </View>

      <View style={estilos.conteudoCard}>
        <View style={estilos.cabecalhoCard}>
          <Text style={estilos.nomeAnimal}>{item.nome}</Text>
          <Text style={estilos.idadeAnimal}>{item.idade}</Text>
        </View>

        <Text style={estilos.descricaoCard} numberOfLines={2}>
          {item.descricao}
        </Text>

        <View style={estilos.conteinerTags}>
          <View style={estilos.tagInfo}>
            <Text style={estilos.textoTag}>Porte: {item.porte}</Text>
          </View>
          {item.vacinado && (
            <View style={estilos.tagVacina}>
              <Text style={estilos.textoTagVacina}>✓ Vacinado</Text>
            </View>
          )}
          {item.castrado && (
            <View style={estilos.tagCastrado}>
              <Text style={estilos.textoTagCastrado}>✓ Castrado</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={estilos.botaoConhecer}
          onPress={() => aoSelecionarAnimal(item)}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotaoConhecer}>Conhecer {item.nome} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={estilos.conteinerCatalogo}>
      <View style={estilos.cabecalhoSecao}>
        <Text style={estilos.tituloSecao}>Animais para Adoção</Text>
        <Text style={estilos.subtituloSecao}>
          Conheça nossos companheiros resgatados em Joinville buscando um novo lar
        </Text>
      </View>

      {/* Barra de Filtro por Espécie */}
      <View style={estilos.barraFiltros}>
        {opcoesFiltro.map((opcao) => (
          <TouchableOpacity
            key={opcao.chave}
            style={[
              estilos.botaoFiltro,
              filtroEspecie === opcao.chave && estilos.botaoFiltroAtivo
            ]}
            onPress={() => aoAlterarFiltro(opcao.chave)}
          >
            <Text style={[
              estilos.textoFiltro,
              filtroEspecie === opcao.chave && estilos.textoFiltroAtivo
            ]}>
              {opcao.rotulo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista / Grade de Cards de Animais */}
      {listaAnimais.length === 0 ? (
        <View style={estilos.areaVazia}>
          <Text style={estilos.textoVazio}>Nenhum animal encontrado para esta categoria.</Text>
        </View>
      ) : (
        <FlatList
          data={listaAnimais}
          keyExtractor={(item) => item.id}
          renderItem={renderizarCardAnimal}
          contentContainerStyle={estilos.gradeAnimais}
          scrollEnabled={false} // Rola com o ScrollView principal do App
        />
      )}

      <TouchableOpacity style={estilos.botaoVerTodos} onPress={aoVerTodos} activeOpacity={0.8}>
        <Text style={estilos.textoBotaoVerTodos}>Ver todos os animais disponíveis →</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  conteinerCatalogo: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#090D16',
  },
  cabecalhoSecao: {
    marginBottom: 20,
  },
  tituloSecao: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtituloSecao: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  barraFiltros: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  botaoFiltro: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  botaoFiltroAtivo: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  textoFiltro: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  textoFiltroAtivo: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gradeAnimais: {
    gap: 20,
  },
  cardAnimal: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  conteinerFoto: {
    height: 200,
    position: 'relative',
  },
  fotoAnimal: {
    width: '100%',
    height: '100%',
  },
  badgeEspecie: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoBadgeEspecie: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conteudoCard: {
    padding: 16,
  },
  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nomeAnimal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  idadeAnimal: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
  },
  descricaoCard: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  conteinerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagInfo: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  textoTag: {
    color: '#94A3B8',
    fontSize: 12,
  },
  tagVacina: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  textoTagVacina: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
  },
  tagCastrado: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  textoTagCastrado: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
  },
  botaoConhecer: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotaoConhecer: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  botaoVerTodos: {
    alignSelf: 'center',
    marginTop: 22,
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 9,
  },
  textoBotaoVerTodos: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  areaVazia: {
    padding: 40,
    alignItems: 'center',
  },
  textoVazio: {
    color: '#94A3B8',
    fontSize: 15,
  }
});
