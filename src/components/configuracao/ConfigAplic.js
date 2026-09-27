import { View, StyleSheet, Text, Pressable, Image, Alert } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';
import { sombraLeve } from '../../theme/ui';

const OPCOES = [
  { chave: 'aparencia', label: 'Aparência', imagem: require('../../../assets/images/icone-aparencia.png') },
  { chave: 'linguagem', label: 'Linguagem', imagem: require('../../../assets/images/icone-linguagens.png') },
  { chave: 'camera', label: 'Câmera', imagem: require('../../../assets/images/icone-camera-config.png') },
];

export default function ConfigAplic({ onAbrirAparencia, onAbrirLinguagem }) {
  const { t } = useTema();

  function handlePress(chave, label) {
    if (chave === 'aparencia') return onAbrirAparencia();
    if (chave === 'linguagem') return onAbrirLinguagem();
    Alert.alert('Em breve', `Configurações de ${label} ainda não implementadas.`);
  }

  return (
    <View style={styles.containerP}>
      <Text style={[styles.contText, { color: t.texto }]}>Aplicativo</Text>
      {OPCOES.map((opcao) => (
        <Pressable
          key={opcao.chave}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: t.card, borderColor: t.borda },
            pressed ? { backgroundColor: t.fundoNeutro } : null,
          ]}
          onPress={() => handlePress(opcao.chave, opcao.label)}
          accessibilityLabel={opcao.label}>
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
    marginTop: 30,
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
