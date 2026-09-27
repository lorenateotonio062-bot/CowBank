import { View, StyleSheet, Text, Pressable, Image, Alert } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';
import { sombraLeve } from '../../theme/ui';

const OPCOES = [
  { label: 'Fale conosco', imagem: require('../../../assets/images/icone-suporte.png') },
  { label: 'Relato de erros', imagem: require('../../../assets/images/icone-feedback.png') },
];

export default function ConfigSup() {
  const { t } = useTema();

  return (
    <View style={styles.containerP}>
      <Text style={[styles.contText, { color: t.texto }]}>Suporte</Text>
      {OPCOES.map((opcao) => (
        <Pressable
          key={opcao.label}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: t.card, borderColor: t.borda },
            pressed ? { backgroundColor: t.fundoNeutro } : null,
          ]}
          onPress={() => Alert.alert('Em breve', `${opcao.label} ainda não implementado.`)}>
          <Image style={styles.imagem} source={opcao.imagem} />
          <Text style={[styles.textbtn, { color: t.texto }]}>{opcao.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    marginHorizontal: 18,
    marginTop: 20,
  },
  contText: {
    marginBottom: 10,
    color: cores.cinzaTexto,
    fontFamily: fontes.padraoBold,
    fontSize: 20,
  },
  btn: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 72,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    ...sombraLeve,
  },
  textbtn: {
    marginLeft: 10,
    fontFamily: fontes.padraoMedio,
    fontSize: 15,
  },
  imagem: {
    width: 60,
    height: 60,
  },
});
