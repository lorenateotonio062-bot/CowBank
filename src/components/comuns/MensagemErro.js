import { Text, View, StyleSheet } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';

// O espaço da mensagem existe sempre, mesmo sem erro nenhum. Assim, quando
// um aviso aparece ("Preencha usuário e senha", "Usuário ou senha
// incorretos"), ele preenche um lugar que já estava reservado em vez de
// empurrar os botões e campos para baixo e desmontar o layout da tela.
export default function MensagemErro({ mensagem, largura = 270 }) {
  return (
    <View style={[styles.area, { width: largura }]}>
      {mensagem ? (
        <Text style={styles.texto} numberOfLines={2}>
          {mensagem}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    height: 34,
    justifyContent: 'center',
  },
  texto: {
    color: cores.erro,
    fontFamily: fontes.padrao,
    fontSize: 12,
    textAlign: 'center',
  },
});
