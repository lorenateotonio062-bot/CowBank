import { View, StyleSheet, Image } from 'react-native';

export default function Logo() {
  return (
    <View style={styles.divMae}>
      <View style={styles.divDois}>
        <Image style={styles.ramo} source={require('../../../assets/images/ramo-folhas-transparente.png')} />
      </View>
      <View style={styles.divTres}>
        <Image style={styles.cow} source={require('../../../assets/images/logo-app-transparente.png')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divMae: {
    flex: 0.45,
  },
  divDois: {
    height: 120,
    width: '100%',
    justifyContent: 'flex-start',
  },
  ramo: {
    height: 120,
    width: 160,
    margin: 10,
  },
  divTres: {
    height: 260,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cow: {
    height: 210,
    width: 250,
  },
});
