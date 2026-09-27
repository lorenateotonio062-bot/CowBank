import { View, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { cores } from '../../theme/colors';
import { escolherImagemPerfil } from '../../services/imagePicker';
import { sombra } from '../../theme/ui';

export default function Cabecalho({ fotoUri, onEscolherFoto }) {
  const navigation = useNavigation();

  async function handleEscolherFoto() {
    try {
      const uri = await escolherImagemPerfil();
      if (uri) onEscolherFoto(uri);
    } catch (e) {
      Alert.alert('Erro', e.message || 'Não foi possível escolher a foto.');
    }
  }

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
        <Image
          style={styles.imagem}
          source={fotoUri ? { uri: fotoUri } : require('../../../assets/images/perfilzinho.png')}
        />
        <View style={styles.contFotoBtn}>
          <Pressable style={styles.btnFoto} onPress={handleEscolherFoto}>
            <Image
              style={styles.imagem2}
              source={require('../../../assets/images/camerazinha.png')}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    minHeight: 290,
  },
  containerS: {
    height: 40,
    backgroundColor: cores.verde,
    marginHorizontal: 18,
    borderRadius: 18,
    ...sombra,
  },
  containerT: {
    minHeight: 230,
    marginTop: 20,
    marginRight: 30,
    marginLeft: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  imagem: {
    width: 120,
    height: 120,
    backgroundColor: cores.roxo,
    borderRadius: 60,
  },
  contFotoBtn: {
    width: 160,
    height: 55,
    alignItems: 'flex-end',
  },
  btnFoto: {
    backgroundColor: cores.verde,
    width: 55,
    height: 55,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem2: {
    width: 40,
    height: 30,
  },
  contConfigBtn: {
    width: 270,
    height: 50,
    alignItems: 'flex-end',
  },
  btnConfig: {
    width: 50,
    height: 50,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgConfig: {
    width: 45,
    height: 45,
  },
});
