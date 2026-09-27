import { Text, View, StyleSheet } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';

export default function TextoLogin() {
  const { t } = useTema();

  return (
    <View style={styles.divMae}>
      <Text style={styles.login}> CowBank</Text>
      <Text style={[styles.loginTextinho, { color: t.textoSecundario }]}>Entre para continuar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  divMae: {
    minHeight: 120,
    padding: 5,
    justifyContent: 'center',
  },
  login: {
    color: cores.verde,
    fontSize: 48,
    fontFamily: fontes.padraoBold,
    textAlign: 'center',
  },
  loginTextinho: {
    fontSize: 15,
    fontFamily: fontes.padrao,
    textAlign: 'center',
  },
});
