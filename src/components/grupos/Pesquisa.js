import { View, StyleSheet } from 'react-native';

import { fontes } from '../../theme/fonts';
import { cores } from '../../theme/colors';
import CampoBusca from '../comuns/CampoBusca';
import { useTema } from '../../theme/ThemeContext';

export default function Pesquisa({ valor, onChange }) {
  const { t } = useTema();

  return (
    <View style={styles.container}>
      <CampoBusca
        style={[styles.input, { backgroundColor: t.campo, borderColor: t.borda }]}
        inputStyle={[styles.textoInput, { color: t.texto }]}
        placeholder="Pesquisar bovino"
        placeholderTextColor={t.placeholder}
        value={valor}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 2,
    marginBottom: 10,
    borderRadius: 14,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    backgroundColor: cores.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  textoInput: {
    fontFamily: fontes.campo,
    color: cores.cinzaTexto,
    fontSize: 15,
  },
});
