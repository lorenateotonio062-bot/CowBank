import { Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';

export default function Cabecalho({ titulo = 'Registrar bovino' }) {
  const navigation = useNavigation();

  return (
    <View style={styles.containerP}>
      <View style={styles.containerS} />
      <View style={styles.containerT}>
        <View style={styles.contConfigBtn}>
          <Pressable style={styles.btnConfig} onPress={() => navigation.navigate('Configuracao')}>
            <Image
              style={styles.imgConfig}
              source={require('../../../assets/images/icone-configuracoes.png')}
            />
          </Pressable>
        </View>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    minHeight: 170,
  },
  containerS: {
    height: 40,
    backgroundColor: cores.verde,
    marginRight: 30,
    marginLeft: 30,
    borderRadius: 10,
  },
  containerT: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titulo: {
    fontSize: 32,
    fontFamily: fontes.tituloRoxo,
    color: cores.roxo,
  },
  contConfigBtn: {
    width: 340,
    height: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btnConfig: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  imgConfig: {
    width: 45,
    height: 45,
  },
});
