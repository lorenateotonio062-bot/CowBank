import { Text, View, StyleSheet } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { sombra } from '../../theme/ui';

export default function Cabecalho() {
  return (
    <View style={styles.containerP}>
      <Text style={styles.texto}> Configurações </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    minHeight: 96,
    backgroundColor: cores.verde,
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...sombra,
  },
  texto: {
    color: 'white',
    fontFamily: fontes.padraoBold,
    fontSize: 22,
  },
});
