import { Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { sombra } from '../../theme/ui';
import CampoBusca from '../comuns/CampoBusca';
import { useTema } from '../../theme/ThemeContext';

export default function Cabecalho({ nomeUsuario, valorPesquisa, onChangePesquisa }) {
  const navigation = useNavigation();
  const { t } = useTema();

  return (
    <View style={styles.container}>
      <View style={styles.linhaTopo}>
        <View style={styles.avatarBox}>
          <Image style={styles.avatar} source={require('../../../assets/images/perfilzinho.png')} />
        </View>
        <View style={styles.textos}>
          <Text style={styles.saudacao}>Bem-vindo</Text>
          <Text style={styles.nome} numberOfLines={1}>{nomeUsuario || 'Visitante'}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.btnConfig, pressed ? styles.btnPressionado : null]}
          onPress={() => navigation.navigate('Configuracao')}
          accessibilityLabel="Abrir configurações">
          <Image
            style={styles.imgConfig}
            source={require('../../../assets/images/icone-configuracoes.png')}
          />
        </Pressable>
      </View>
      <CampoBusca
        style={[styles.busca, { backgroundColor: t.campo, borderColor: t.borda }]}
        inputStyle={[styles.inputBusca, { color: t.texto }]}
        placeholder="Pesquisar grupo"
        placeholderTextColor={t.placeholder}
        value={valorPesquisa}
        onChangeText={onChangePesquisa}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 18,
    padding: 18,
    backgroundColor: cores.verde,
    borderRadius: 22,
    ...sombra,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
  },
  textos: {
    flex: 1,
    marginLeft: 12,
  },
  saudacao: {
    fontSize: 13,
    fontFamily: fontes.padraoMedio,
    color: 'rgba(255,255,255,0.86)',
  },
  nome: {
    color: cores.branco,
    fontFamily: fontes.padraoBold,
    fontSize: 22,
    marginTop: 2,
  },
  busca: {
    height: 50,
    backgroundColor: cores.branco,
    marginTop: 18,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  inputBusca: {
    fontFamily: fontes.campo,
    color: cores.cinzaTexto,
    fontSize: 15,
  },
  btnConfig: {
    backgroundColor: cores.branco,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPressionado: {
    opacity: 0.75,
  },
  imgConfig: {
    width: 34,
    height: 34,
  },
});
