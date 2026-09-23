import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

const opcoesEspecie = [{ valor: 'todos', titulo: 'Todos' }, { valor: 'cachorro', titulo: 'Cães' }, { valor: 'gato', titulo: 'Gatos' }];
const opcoesIdade = [{ valor: 'todos', titulo: 'Todas' }, { valor: 'filhote', titulo: 'Filhotes' }, { valor: 'adulto', titulo: 'Adultos' }, { valor: 'idoso', titulo: 'Idosos' }];
const opcoesPorte = [{ valor: 'todos', titulo: 'Todos' }, { valor: 'pequeno', titulo: 'Pequeno' }, { valor: 'medio', titulo: 'Médio' }, { valor: 'grande', titulo: 'Grande' }];

function normalizar(texto = '') { return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function definirFaixaEtaria(idade = '') {
  const texto = idade.toLowerCase();
  if (texto.includes('filhote') || texto.includes('mês')) return 'filhote';
  if (texto.includes('idos')) return 'idoso';
  const anos = Number(texto.match(/\d+/)?.[0]);
  if (!Number.isNaN(anos)) return anos <= 1 ? 'filhote' : anos >= 8 ? 'idoso' : 'adulto';
  return 'adulto';
}

export default function TelaAnimaisDisponiveis({ listaAnimais, carregando, aoVoltar, aoSelecionarAnimal }) {
  const [busca, setBusca] = useState('');
  const [especie, setEspecie] = useState('todos');
  const [idade, setIdade] = useState('todos');
  const [porte, setPorte] = useState('todos');
  const animaisFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return listaAnimais.filter((animal) => {
      const buscaOk = !termo || [animal.nome, animal.descricao, animal.temperamento].some((campo) => normalizar(campo).includes(termo));
      return buscaOk && (especie === 'todos' || animal.especie === especie) && (idade === 'todos' || definirFaixaEtaria(animal.idade) === idade) && (porte === 'todos' || normalizar(animal.porte) === porte);
    });
  }, [busca, especie, idade, porte, listaAnimais]);
  const filtros = (opcoes, valor, aoMudar) => <View style={estilos.linhaFiltros}>{opcoes.map((opcao) => <TouchableOpacity key={opcao.valor} onPress={() => aoMudar(opcao.valor)} style={[estilos.chip, valor === opcao.valor && estilos.chipAtivo]}><Text style={[estilos.textoChip, valor === opcao.valor && estilos.textoChipAtivo]}>{opcao.titulo}</Text></TouchableOpacity>)}</View>;
  const card = ({ item }) => <TouchableOpacity style={estilos.cardAnimal} onPress={() => aoSelecionarAnimal(item)} activeOpacity={0.9}>
    <Image source={{ uri: item.urlFoto }} style={estilos.fotoAnimal} resizeMode="cover" />
    <View style={estilos.conteudoCard}><View style={estilos.cabecalhoCard}><View><Text style={estilos.nomeAnimal}>{item.nome}</Text><Text style={estilos.idadeAnimal}>{item.idade} • {item.sexo}</Text></View><View style={estilos.badgeEspecie}><Text style={estilos.textoBadge}>{item.especie === 'gato' ? 'Gato' : 'Cão'}</Text></View></View>
      <Text style={estilos.descricaoAnimal} numberOfLines={2}>{item.descricao}</Text><View style={estilos.tags}><Text style={estilos.tag}>{item.porte}</Text>{item.vacinado && <Text style={estilos.tag}>Vacinado</Text>}{item.castrado && <Text style={estilos.tag}>Castrado</Text>}</View><View style={estilos.botaoConhecer}><Text style={estilos.textoBotaoConhecer}>Conhecer {item.nome} →</Text></View>
    </View>
  </TouchableOpacity>;
  return <View style={estilos.conteiner}>
    <View style={estilos.barraTopo}><TouchableOpacity onPress={aoVoltar} style={estilos.botaoVoltar}><Text style={estilos.textoVoltar}>← Início</Text></TouchableOpacity><Text style={estilos.tituloTopo}>Adoção</Text></View>
    {carregando ? <View style={estilos.areaCarregando}><ActivityIndicator size="large" color="#10B981" /><Text style={estilos.textoCarregando}>Procurando novos amigos...</Text></View> : <FlatList data={animaisFiltrados} renderItem={card} keyExtractor={(item) => String(item.id)} showsVerticalScrollIndicator={false} contentContainerStyle={estilos.lista} ListHeaderComponent={<View><Text style={estilos.titulo}>Animais disponíveis para adoção</Text><Text style={estilos.subtitulo}>Encontre um companheiro que combine com a sua rotina e transforme duas vidas.</Text><TextInput value={busca} onChangeText={setBusca} placeholder="Buscar por nome ou perfil" placeholderTextColor="#64748B" style={estilos.campoBusca} /><Text style={estilos.rotuloFiltro}>Espécie</Text>{filtros(opcoesEspecie, especie, setEspecie)}<Text style={estilos.rotuloFiltro}>Faixa etária</Text>{filtros(opcoesIdade, idade, setIdade)}<Text style={estilos.rotuloFiltro}>Porte</Text>{filtros(opcoesPorte, porte, setPorte)}<Text style={estilos.contagem}>{animaisFiltrados.length} {animaisFiltrados.length === 1 ? 'animal encontrado' : 'animais encontrados'}</Text></View>} ListEmptyComponent={<View style={estilos.vazio}><Text style={estilos.tituloVazio}>Nenhum animal encontrado</Text><Text style={estilos.textoVazio}>Ajuste os filtros para conhecer outros amigos do abrigo.</Text></View>} />}
  </View>;
}

const estilos = StyleSheet.create({
  conteiner: { flex: 1, backgroundColor: '#0F172A' }, barraTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' }, botaoVoltar: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8 }, textoVoltar: { color: '#E2E8F0', fontWeight: '700', fontSize: 13 }, tituloTopo: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 }, lista: { padding: 20, paddingBottom: 40 }, titulo: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 8 }, subtitulo: { color: '#94A3B8', fontSize: 14, lineHeight: 21, marginBottom: 20 }, campoBusca: { color: '#F8FAFC', backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 13, fontSize: 14, marginBottom: 20 }, rotuloFiltro: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', marginBottom: 9 }, linhaFiltros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 17 }, chip: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }, chipAtivo: { borderColor: '#10B981', backgroundColor: '#064E3B' }, textoChip: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' }, textoChipAtivo: { color: '#D1FAE5' }, contagem: { color: '#10B981', fontSize: 13, fontWeight: '700', marginBottom: 14 }, cardAnimal: { backgroundColor: '#1E293B', borderRadius: 14, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#334155' }, fotoAnimal: { height: 185, width: '100%', backgroundColor: '#334155' }, conteudoCard: { padding: 16 }, cabecalhoCard: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, nomeAnimal: { color: '#FFFFFF', fontSize: 21, fontWeight: '800', marginBottom: 3 }, idadeAnimal: { color: '#94A3B8', fontSize: 13, textTransform: 'capitalize' }, badgeEspecie: { alignSelf: 'flex-start', backgroundColor: '#0F766E', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5 }, textoBadge: { color: '#CCFBF1', fontSize: 11, fontWeight: '800' }, descricaoAnimal: { color: '#CBD5E1', fontSize: 13, lineHeight: 19, marginTop: 13, minHeight: 38 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }, tag: { color: '#A7F3D0', backgroundColor: '#064E3B', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }, botaoConhecer: { backgroundColor: '#059669', marginTop: 16, borderRadius: 8, paddingVertical: 12, alignItems: 'center' }, textoBotaoConhecer: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' }, areaCarregando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 15 }, textoCarregando: { color: '#94A3B8', fontSize: 14 }, vazio: { paddingVertical: 48, alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12 }, tituloVazio: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', marginBottom: 7 }, textoVazio: { color: '#94A3B8', fontSize: 13, textAlign: 'center', paddingHorizontal: 30, lineHeight: 19 },
});
