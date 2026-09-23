import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  ActivityIndicator
} from 'react-native';

/**
 * Modal nativo para apresentação do perfil completo do animal e envio da proposta de adoção.
 */
export default function ModalPerfilAnimal({ 
  animal, 
  visivel, 
  aoFechar, 
  aoEnviarSolicitacaoAdocao 
}) {
  const [nomeInteressado, setNomeInteressado] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  if (!animal) return null;

  const tratarEnvioFormulario = async () => {
    if (!nomeInteressado || !telefone) {
      alert('Por favor, informe seu nome e telefone de contato.');
      return;
    }

    setEnviando(true);
    try {
      await aoEnviarSolicitacaoAdocao({
        animalId: animal.id,
        nomeAnimal: animal.nome,
        nomeAdotante: nomeInteressado,
        telefone,
        email,
        mensagem
      });
      setMensagemSucesso('Solicitação enviada com sucesso! Nossa equipe entrará em contato.');
      setTimeout(() => {
        setMensagemSucesso('');
        setExibirFormulario(false);
        setNomeInteressado('');
        setTelefone('');
        setEmail('');
        setMensagem('');
        aoFechar();
      }, 3000);
    } catch (erro) {
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent={true}
      onRequestClose={aoFechar}
    >
      <View style={estilos.fundoModal}>
        <View style={estilos.conteinerModal}>
          {/* Botão Fechar no Canto Superior */}
          <TouchableOpacity style={estilos.botaoFechar} onPress={aoFechar}>
            <Text style={estilos.textoFechar}>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={{ uri: animal.urlFoto }} style={estilos.imagemPerfil} />

            <View style={estilos.corpoModal}>
              <View style={estilos.cabecalhoPerfil}>
                <View>
                  <Text style={estilos.nomePerfil}>{animal.nome}</Text>
                  <Text style={estilos.especiePerfil}>
                    {animal.especie === 'cachorro' ? 'Cão' : 'Gato'} • {animal.sexo === 'macho' ? 'Macho' : 'Fêmea'} • Porte {animal.porte}
                  </Text>
                </View>

                <View style={estilos.badgeIdade}>
                  <Text style={estilos.textoIdade}>{animal.idade}</Text>
                </View>
              </View>

              <View style={estilos.divisor} />

              <Text style={estilos.tituloSecao}>Sobre o {animal.nome}</Text>
              <Text style={estilos.descricaoPerfil}>{animal.descricao}</Text>

              <View style={estilos.caixaTemperamento}>
                <Text style={estilos.tituloTemperamento}>Temperamento & Personalidade</Text>
                <Text style={estilos.textoTemperamento}>{animal.temperamento}</Text>
              </View>

              <View style={estilos.linhaSaude}>
                <View style={estilos.itemSaude}>
                  <Text style={estilos.iconeSaude}>💉</Text>
                  <Text style={estilos.rotuloSaude}>Vacinação</Text>
                  <Text style={estilos.valorSaude}>{animal.vacinado ? 'Em dia' : 'Pendente'}</Text>
                </View>

                <View style={estilos.itemSaude}>
                  <Text style={estilos.iconeSaude}>✂️</Text>
                  <Text style={estilos.rotuloSaude}>Castração</Text>
                  <Text style={estilos.valorSaude}>{animal.castrado ? 'Castrado(a)' : 'Pendente'}</Text>
                </View>
              </View>

              {mensagemSucesso ? (
                <View style={estilos.caixaSucesso}>
                  <Text style={estilos.textoSucesso}>✓ {mensagemSucesso}</Text>
                </View>
              ) : !exibirFormulario ? (
                <TouchableOpacity
                  style={estilos.botaoQueroAdotar}
                  onPress={() => setExibirFormulario(true)}
                  activeOpacity={0.8}
                >
                  <Text style={estilos.textoBotaoQueroAdotar}>
                    🐾 Quero Adotar ou Apadrinhar o {animal.nome}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={estilos.areaFormulario}>
                  <Text style={estilos.tituloFormulario}>Formulário de Interesse</Text>

                  <Text style={estilos.rotuloCampo}>Seu Nome *</Text>
                  <TextInput
                    style={estilos.campoEntrada}
                    placeholder="Ex: João da Silva"
                    placeholderTextColor="#64748B"
                    value={nomeInteressado}
                    onChangeText={setNomeInteressado}
                  />

                  <Text style={estilos.rotuloCampo}>Seu Telefone / WhatsApp *</Text>
                  <TextInput
                    style={estilos.campoEntrada}
                    placeholder="(47) 99999-0000"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    value={telefone}
                    onChangeText={setTelefone}
                  />

                  <Text style={estilos.rotuloCampo}>E-mail</Text>
                  <TextInput
                    style={estilos.campoEntrada}
                    placeholder="seuemail@exemplo.com"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />

                  <Text style={estilos.rotuloCampo}>Mensagem / Conte um pouco sobre seu lar</Text>
                  <TextInput
                    style={[estilos.campoEntrada, estilos.campoMensagem]}
                    placeholder="Tenho casa com quintal fechado..."
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={3}
                    value={mensagem}
                    onChangeText={setMensagem}
                  />

                  <View style={estilos.botoesFormulario}>
                    <TouchableOpacity
                      style={estilos.botaoCancelarForm}
                      onPress={() => setExibirFormulario(false)}
                    >
                      <Text style={estilos.textoCancelarForm}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={estilos.botaoEnviarForm}
                      onPress={tratarEnvioFormulario}
                      disabled={enviando}
                    >
                      {enviando ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={estilos.textoEnviarForm}>Enviar Proposta</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  conteinerModal: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    position: 'relative',
  },
  botaoFechar: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFechar: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagemPerfil: {
    width: '100%',
    height: 260,
  },
  corpoModal: {
    padding: 20,
  },
  cabecalhoPerfil: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nomePerfil: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  especiePerfil: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  badgeIdade: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  textoIdade: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  divisor: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 16,
  },
  tituloSecao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descricaoPerfil: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  caixaTemperamento: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  tituloTemperamento: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  textoTemperamento: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  linhaSaude: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  itemSaude: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  iconeSaude: {
    fontSize: 20,
    marginBottom: 4,
  },
  rotuloSaude: {
    color: '#94A3B8',
    fontSize: 12,
  },
  valorSaude: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
  },
  botaoQueroAdotar: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotaoQueroAdotar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  caixaSucesso: {
    backgroundColor: '#064E3B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoSucesso: {
    color: '#6EE7B7',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  areaFormulario: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
  },
  tituloFormulario: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rotuloCampo: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
    marginTop: 8,
  },
  campoEntrada: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  campoMensagem: {
    height: 70,
    textAlignVertical: 'top',
  },
  botoesFormulario: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  botaoCancelarForm: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoCancelarForm: {
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  botaoEnviarForm: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoEnviarForm: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
