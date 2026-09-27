import { Text, View, StyleSheet, Image, Pressable, Alert } from 'react-native';

const OPCOES = [
  { label: 'Fale conosco', imagem: require('../../../assets/images/icone-suporte.png') },
  { label: 'Relato de erros', imagem: require('../../../assets/images/icone-feedback.png') },
];

// Bloco "Caso esteja tendo problemas" — idêntico nas 3 páginas do fluxo de
// redefinir senha no Snack original, por isso virou um componente só.
export default function Suporte() {
  return (
    <View style={styles.divSuporte}>
      <Text style={styles.textoSup}> Caso esteja tendo problemas: </Text>
      {OPCOES.map((opcao) => (
        <Pressable
          key={opcao.label}
          style={({ pressed }) => [styles.btnFeedback, pressed ? styles.btnPressionado : null]}
          onPress={() => Alert.alert('Em breve', `${opcao.label} ainda não implementado.`)}
          accessibilityLabel={opcao.label}>
          <Image style={styles.imgFeedback} source={opcao.imagem} />
          <Text style={styles.textoBtn}> {opcao.label} </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  divSuporte: {
    width: 335,
    height: 230,
  },
  textoSup: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  btnFeedback: {
    width: 335,
    height: 70,
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'center',
    borderRadius: 10,
  },
  btnPressionado: {
    backgroundColor: '#f0f0f0',
  },
  textoBtn: {
    marginLeft: 10,
  },
  imgFeedback: {
    width: 80,
    height: 80,
    marginLeft: 20,
  },
});
