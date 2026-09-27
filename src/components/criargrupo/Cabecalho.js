import { Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';

export default function Cabecalho() {
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
        <Image style={styles.imagem} source={require('../../../assets/images/vaquinha.png')} />
        <Text style={styles.titulo}>Criar um novo grupo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    minHeight: 280,
  },
  containerS: {
    height: 40,
    backgroundColor: cores.verde,
    marginRight: 30,
    marginLeft: 30,
    borderRadius: 10,
  },
  containerT: {
    marginTop: 40,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: {
    width: 110,
    height: 110,
  },
  titulo: {
    fontSize: 32,
    fontFamily: fontes.tituloRoxo,
    color: cores.roxo,
  },
  contConfigBtn: {
    width: 270,
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
