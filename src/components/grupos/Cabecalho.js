import { Text, View, StyleSheet, Image } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { sombra } from '../../theme/ui';

export default function Cabecalho({ nomeGrupo }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconeBox}>
        <Image style={styles.imagem} source={require('../../../assets/images/vaca-b.png')} />
      </View>
      <View style={styles.textoBox}>
        <Text style={styles.label}>Grupo</Text>
        <Text style={styles.texto} numberOfLines={1}>{nomeGrupo || 'Carregando...'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 104,
    backgroundColor: cores.verde,
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 22,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    ...sombra,
  },
  iconeBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: {
    width: 54,
    height: 54,
  },
  textoBox: {
    flex: 1,
    marginLeft: 14,
  },
  label: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontFamily: fontes.padraoMedio,
  },
  texto: {
    color: cores.branco,
    fontSize: 22,
    fontFamily: fontes.padraoBold,
    marginTop: 2,
  },
});
