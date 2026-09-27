import { Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { sombra } from '../../theme/ui';
import { useTema } from '../../theme/ThemeContext';

// Rodapé de navegação usado em várias telas (Inicial, Grupos, Criar grupo,
// Registrar bovino, Perfil, Configuração). O design é idêntico em todas elas
// no projeto original — por isso virou um único componente reutilizável.
//
// Fica fixo no fim da tela (fora da área que rola), por isso tem altura
// própria e não recebe mais ajustes de flex de cada tela.
export default function RodapeNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTema();

  const itemAtivo = route.name === 'Perfil' ? 'Perfil' : route.name === 'Inicial' ? 'Inicial' : null;

  return (
    <View style={styles.container}>
      <View style={[styles.nav, { backgroundColor: t.card, borderColor: t.borda }]}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            itemAtivo === 'Inicial' ? { backgroundColor: t.verdeSuave } : null,
            pressed ? styles.btnPressionado : null,
          ]}
          onPress={() => navigation.navigate('Inicial')}
          accessibilityLabel="Ir para a tela inicial">
          <Image style={styles.icone} source={require('../../../assets/images/casa.png')} />
          <Text style={[styles.texto, { color: t.textoSecundario }, itemAtivo === 'Inicial' ? styles.textoAtivo : null]}>Início</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnCentral, pressed ? styles.btnCentralPressionado : null]}
          onPress={() => navigation.navigate('ScannerQrCode')}
          accessibilityLabel="Escanear">
          <Image
            style={styles.iconeCentral}
            source={require('../../../assets/images/camerazinha.png')}
          />
          <Text style={styles.textoCentral}>Escanear</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            itemAtivo === 'Perfil' ? { backgroundColor: t.verdeSuave } : null,
            pressed ? styles.btnPressionado : null,
          ]}
          onPress={() => navigation.navigate('Perfil')}
          accessibilityLabel="Ir para o perfil">
          <Image style={styles.icone} source={require('../../../assets/images/perfilzinho.png')} />
          <Text style={[styles.texto, { color: t.textoSecundario }, itemAtivo === 'Perfil' ? styles.textoAtivo : null]}>Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  nav: {
    height: 76,
    borderRadius: 22,
    backgroundColor: cores.card,
    borderWidth: 1,
    borderColor: cores.borda,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
  },
  btn: {
    width: 92,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  btnPressionado: {
    opacity: 0.7,
  },
  btnCentral: {
    width: 98,
    height: 62,
    marginHorizontal: 4,
    borderRadius: 18,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCentralPressionado: {
    backgroundColor: cores.verdeEscuro,
  },
  icone: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  iconeCentral: {
    width: 30,
    height: 24,
    resizeMode: 'contain',
  },
  texto: {
    color: cores.textoSecundario,
    fontFamily: fontes.padraoMedio,
    fontSize: 12,
    marginTop: 4,
  },
  textoAtivo: {
    color: cores.verdeEscuro,
  },
  textoCentral: {
    color: cores.branco,
    fontFamily: fontes.padraoSemiBold,
    fontSize: 12,
    marginTop: 5,
  },
});
