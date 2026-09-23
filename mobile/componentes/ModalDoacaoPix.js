import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Modal explicativo para arrecadação de doações via PIX com botão para copiar a chave PIX.
 */
export default function ModalDoacaoPix({ informacoes, visivel, aoFechar }) {
  const [copiado, setCopiado] = useState(false);

  const chavePix = informacoes?.chavePix || '12.345.678/0001-99';

  const copiarChavePix = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(chavePix);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (e) {
      setCopiado(true);
    }
  };

  return (
    <Modal
      visible={visivel}
      animationType="fade"
      transparent={true}
      onRequestClose={aoFechar}
    >
      <View style={estilos.fundoEscuroModal}>
        <View style={estilos.caixaDoacao}>
          {/* Botão Fechar */}
          <TouchableOpacity style={estilos.botaoFecharModal} onPress={aoFechar}>
            <Text style={estilos.textoBotaoFechar}>✕</Text>
          </TouchableOpacity>

          <View style={estilos.iconeHeader}>
            <Text style={estilos.emojiCoracao}>💚</Text>
          </View>

          <Text style={estilos.tituloDoacao}>Doação via PIX</Text>
          <Text style={estilos.subtituloDoacao}>
            Sua contribuição apoia a alimentação, vacinas e cuidados veterinários dos cães e gatos resgatados em Joinville.
          </Text>

          <View style={estilos.caixaChavePix}>
            <Text style={estilos.rotuloChave}>CHAVE PIX (CNPJ)</Text>
            <Text style={estilos.valorChavePix}>{chavePix}</Text>
          </View>

          <TouchableOpacity
            style={[estilos.botaoCopiarPix, copiado && estilos.botaoCopiarSucesso]}
            onPress={copiarChavePix}
            activeOpacity={0.8}
          >
            <Text style={estilos.textoBotaoCopiar}>
              {copiado ? '✓ Chave PIX Copiada!' : '📋 Copiar Chave PIX'}
            </Text>
          </TouchableOpacity>

          <View style={estilos.detalhesBancarios}>
            <Text style={estilos.itemDetalhe}>
              <Text style={estilos.negrito}>Titular:</Text> {informacoes?.titular || 'Associação de Proteção Animal Joinville'}
            </Text>
            <Text style={estilos.itemDetalhe}>
              <Text style={estilos.negrito}>Banco:</Text> {informacoes?.banco || 'Banco do Brasil'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundoEscuroModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  caixaDoacao: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  botaoFecharModal: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoFechar: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconeHeader: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiCoracao: {
    fontSize: 28,
  },
  tituloDoacao: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtituloDoacao: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  caixaChavePix: {
    backgroundColor: '#1E293B',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rotuloChave: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  valorChavePix: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botaoCopiarPix: {
    backgroundColor: '#059669',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoCopiarSucesso: {
    backgroundColor: '#10B981',
  },
  textoBotaoCopiar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  detalhesBancarios: {
    width: '100%',
    backgroundColor: '#090D16',
    padding: 14,
    borderRadius: 10,
    gap: 6,
  },
  itemDetalhe: {
    color: '#94A3B8',
    fontSize: 12,
  },
  negrito: {
    color: '#E2E8F0',
    fontWeight: 'bold',
  },
});
