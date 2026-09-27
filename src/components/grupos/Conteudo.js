import { StyleSheet, ScrollView, Text, RefreshControl, View, Image } from 'react-native';

import Cartao from './Cartao';
import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';

export default function Conteudo({ bovinos, onSolicitarExclusao, onEditar, mensagemVazio, atualizando, onAtualizar }) {
  const { t } = useTema();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onAtualizar ? (
          <RefreshControl refreshing={!!atualizando} onRefresh={onAtualizar} colors={[cores.verde]} />
        ) : undefined
      }>
      {bovinos.length === 0 ? (
        <View style={[styles.estadoVazio, { backgroundColor: t.card, borderColor: t.borda }]}>
          <Image style={styles.vazioImagem} source={require('../../../assets/images/vaquinha.png')} />
          <Text style={[styles.vazioTitulo, { color: t.texto }]}>Rebanho vazio</Text>
          <Text style={[styles.vazio, { color: t.textoSecundario }]}>{mensagemVazio || 'Nenhum bovino registrado neste grupo ainda.'}</Text>
        </View>
      ) : (
        bovinos.map((bovino) => (
          <Cartao
            key={bovino.id}
            bovino={bovino}
            onSolicitarExclusao={onSolicitarExclusao}
            onEditar={onEditar}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  estadoVazio: {
    minHeight: 220,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  vazioImagem: {
    width: 76,
    height: 76,
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
