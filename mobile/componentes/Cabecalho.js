import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Componente de Cabeçalho principal da aplicação React Native.
 * Exibe a identidade do Abrigo Animal Joinville e o botão de doação rápida via PIX.
 */
export default function Cabecalho({ aoAbrirModalPix, statusConexaoBackend }) {
  return (
    <View style={estilos.conteinerCabecalho}>
      <View style={estilos.areaMarca}>
        <View style={estilos.iconePatinha}>
          <Text style={estilos.textoIcone}>🐾</Text>
        </View>
        <View>
          <Text style={estilos.tituloMarca}>Abrigo Animal</Text>
          <Text style={estilos.subtituloMarca}>Joinville - SC</Text>
        </View>
      </View>

      <View style={estilos.areaAcoes}>
        {/* Indicador visual de conexão com o servidor Java */}
        <View style={estilos.indicadorStatus}>
          <View style={[estilos.pontoStatus, statusConexaoBackend ? estilos.pontoOnline : estilos.pontoOff]} />
          <Text style={estilos.textoStatus}>
            {statusConexaoBackend ? 'API Java Online' : 'Conectando API...'}
          </Text>
        </View>

        <TouchableOpacity 
          style={estilos.botaoPix}
          onPress={aoAbrirModalPix}
          activeOpacity={0.8}
        >
          <Text style={estilos.textoBotaoPix}>💚 Doar via PIX</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  conteinerCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  areaMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconePatinha: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoIcone: {
    fontSize: 22,
  },
  tituloMarca: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtituloMarca: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  areaAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indicadorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pontoStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pontoOnline: {
    backgroundColor: '#10B981',
  },
  pontoOff: {
    backgroundColor: '#F59E0B',
  },
  textoStatus: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
  },
  botaoPix: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  textoBotaoPix: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  }
});
