import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

const LARGURA_TELA = Dimensions.get('window').width;

/**
 * Componente de Carrossel de Destaques em React Native.
 * Apresenta campanhas, doações PIX e projetos do abrigo Joinville.
 */
export default function CarrosselDestaques({ listaDestaques, aoSelecionarAcao }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const refScrollView = useRef(null);

  useEffect(() => {
    if (!listaDestaques || listaDestaques.length === 0) return;
    const temporizador = setInterval(() => {
      const proximoIndice = (indiceAtual + 1) % listaDestaques.length;
      setIndiceAtual(proximoIndice);
      refScrollView.current?.scrollTo({ x: proximoIndice * LARGURA_TELA, animated: true });
    }, 6000);

    return () => clearInterval(temporizador);
  }, [indiceAtual, listaDestaques]);

  if (!listaDestaques || listaDestaques.length === 0) {
    return null;
  }

  return (
    <View style={estilos.conteinerCarrossel}>
      <ScrollView
        ref={refScrollView}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const novoIndice = Math.round(x / LARGURA_TELA);
          if (novoIndice !== indiceAtual) {
            setIndiceAtual(novoIndice);
          }
        }}
        scrollEventThrottle={16}
      >
        {listaDestaques.map((item) => (
          <View key={item.id} style={[estilos.cardSlide, { width: LARGURA_TELA }]}>
            <Image 
              source={{ uri: item.imagemUrl }} 
              style={estilos.imagemSlide} 
              resizeMode="cover"
            />
            <View style={estilos.gradienteSobreposicao}>
              <Text style={estilos.subtituloBadge}>{item.subtitulo}</Text>
              <Text style={estilos.tituloSlide}>{item.titulo}</Text>
              <Text style={estilos.descricaoSlide}>{item.descricao}</Text>
              
              <TouchableOpacity 
                style={estilos.botaoAcaoSlide}
                onPress={() => aoSelecionarAcao(item.acao)}
                activeOpacity={0.8}
              >
                <Text style={estilos.textoBotaoAcao}>Saber Mais →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Indicadores de Paginação (Pontos) */}
      <View style={estilos.conteinerPontos}>
        {listaDestaques.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              setIndiceAtual(index);
              refScrollView.current?.scrollTo({ x: index * LARGURA_TELA, animated: true });
            }}
            style={[
              estilos.pontoPaginacao,
              indiceAtual === index ? estilos.pontoAtivo : estilos.pontoInativo
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  conteinerCarrossel: {
    height: 320,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  cardSlide: {
    height: 320,
    position: 'relative',
  },
  imagemSlide: {
    width: '100%',
    height: '100%',
  },
  gradienteSobreposicao: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    padding: 24,
    justifyContent: 'flex-end',
  },
  subtituloBadge: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tituloSlide: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descricaoSlide: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 600,
  },
  botaoAcaoSlide: {
    backgroundColor: '#059669',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotaoAcao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  conteinerPontos: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    flexDirection: 'row',
    gap: 8,
  },
  pontoPaginacao: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pontoAtivo: {
    backgroundColor: '#10B981',
    width: 24,
  },
  pontoInativo: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
