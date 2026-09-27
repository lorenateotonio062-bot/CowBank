import { Text, View, StyleSheet, Image, ScrollView, Pressable, RefreshControl } from 'react-native';

import { fontes } from '../../theme/fonts';
import { cores } from '../../theme/colors';
import { sombraLeve } from '../../theme/ui';
import { useTema } from '../../theme/ThemeContext';

export default function Grupos({ grupos, onAbrirGrupo, onSolicitarExclusao, mensagemVazio, atualizando, onAtualizar, corTexto }) {
  const { t } = useTema();

  return (
    <ScrollView
      style={styles.conteinerP}
      refreshControl={
        onAtualizar ? (
          <RefreshControl refreshing={!!atualizando} onRefresh={onAtualizar} colors={[cores.verde]} />
        ) : undefined
      }>
      <View style={styles.cabecalhoSecao}>
        <View>
          <Text style={[styles.titulo, corTexto ? { color: corTexto } : null]}>Grupos</Text>
          <Text style={[styles.subtitulo, { color: t.textoSecundario }]}>{grupos.length} {grupos.length === 1 ? 'grupo ativo' : 'grupos ativos'}</Text>
        </View>
      </View>
      <View style={styles.conteinerS}>
        {grupos.length === 0 ? (
          <View style={[styles.estadoVazio, { backgroundColor: t.card, borderColor: t.borda }]}>
            <Image style={styles.vazioImagem} source={require('../../../assets/images/vaquinha.png')} />
            <Text style={[styles.vazioTitulo, { color: t.texto }]}>Nada por aqui ainda</Text>
            <Text style={[styles.vazio, { color: t.textoSecundario }]}>{mensagemVazio || 'Nenhum grupo criado ainda.'}</Text>
          </View>
        ) : (
          grupos.map((grupo) => (
            <Pressable
              key={grupo.id}
              style={({ pressed }) => [
                styles.grupo,
                { backgroundColor: t.card, borderColor: t.borda },
                pressed ? styles.grupoPressionado : null,
              ]}
              onPress={() => onAbrirGrupo(grupo)}
              onLongPress={() => onSolicitarExclusao(grupo)}
              accessibilityLabel={`Grupo ${grupo.nome}, ${grupo.totalBovinos} bovinos`}>
              <Pressable
                style={[styles.btnExcluir, { backgroundColor: t.deletarSuave }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => onSolicitarExclusao(grupo)}
                accessibilityLabel={`Excluir grupo ${grupo.nome}`}>
                <Image style={styles.iconeLixeira} source={require('../../../assets/images/lixeira.png')} />
              </Pressable>
              <View style={[styles.iconeGrupo, { backgroundColor: t.verdeSuave }]}>
                <Image style={styles.imagem} source={require('../../../assets/images/vaquinha.png')} />
              </View>
              <Text style={[styles.textoGrupo, { color: t.texto }]} numberOfLines={1}>{grupo.nome}</Text>
              <View style={[styles.pill, { backgroundColor: t.roxoSuave }]}>
                <Text style={styles.textoContagem}>
                  {grupo.totalBovinos} {grupo.totalBovinos === 1 ? 'bovino' : 'bovinos'}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteinerP: {
    flex: 1,
    flexDirection: 'column',
  },
  cabecalhoSecao: {
    marginHorizontal: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  conteinerS: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  grupo: {
    width: '48%',
    minHeight: 148,
    marginBottom: 14,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: cores.card,
    borderWidth: 1,
    borderColor: cores.borda,
    ...sombraLeve,
  },
  grupoPressionado: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  btnExcluir: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: cores.deletarSuave,
  },
  iconeLixeira: {
    width: 22,
    height: 22,
  },
  iconeGrupo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: cores.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: {
    width: 46,
    height: 46,
  },
  textoGrupo: {
    fontFamily: fontes.padraoSemiBold,
    fontSize: 16,
    color: cores.cinzaTexto,
    marginTop: 12,
    maxWidth: '100%',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: cores.roxoSuave,
    marginTop: 10,
  },
  textoContagem: {
    fontFamily: fontes.padraoMedio,
    fontSize: 11,
    color: cores.roxoEscuro,
  },
  titulo: {
    fontSize: 22,
    fontFamily: fontes.padraoBold,
  },
  subtitulo: {
    marginTop: 2,
    fontFamily: fontes.padrao,
    color: cores.textoSecundario,
    fontSize: 12,
  },
  estadoVazio: {
    width: '100%',
    minHeight: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    ...sombraLeve,
  },
  vazioImagem: {
    width: 70,
    height: 70,
    opacity: 0.85,
  },
  vazioTitulo: {
    marginTop: 10,
    fontFamily: fontes.padraoSemiBold,
    color: cores.cinzaTexto,
    fontSize: 16,
  },
  vazio: {
    fontFamily: fontes.padrao,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 4,
  },
});
