import { View, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTema } from '../../theme/ThemeContext';

export default function Topo() {
  const navigation = useNavigation();
  const { t } = useTema();

  return (
    <View style={styles.conteiner}>
      <View style={styles.priImg}>
        <Pressable
          style={({ pressed }) => [styles.seta, pressed ? { backgroundColor: t.card } : null]}
          onPress={() => navigation.goBack()}>
          <Image style={styles.seta} source={require('../../../assets/images/seta-voltar.png')} />
        </Pressable>
      </View>
      <View style={styles.segImg}>
        <Image style={styles.ramo} source={require('../../../assets/images/ramo.png')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteiner: {
    minHeight: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priImg: {
    flexBasis: 150,
    justifyContent: 'center',
  },
  seta: {
    width: 100,
    height: 100,
    borderRadius: 200,
  },
  segImg: {
    flexBasis: 200,
    justifyContent: 'center',
  },
  ramo: {
    width: 200,
    height: 200,
  },
});
