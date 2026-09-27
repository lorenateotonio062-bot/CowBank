import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';

export default function Ajuda() {
  const navigation = useNavigation();
  const { t } = useTema();

  return (
    <View style={styles.divMae}>
      <Pressable onPress={() => navigation.navigate('RedefinirSenhaEmail')}>
        <Text style={[styles.Textinho, { color: t.textoSecundario }]}>Esqueceu a senha?</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('CriarConta')}>
        <Text style={[styles.Textinho, { color: t.textoSecundario }]}>Criar conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  divMae: {
    minHeight: 90,
    justifyContent: 'center',
    paddingTop: 5,
  },
  Textinho: {
    fontFamily: fontes.padrao,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 5,
  },
});
