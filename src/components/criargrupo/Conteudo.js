import {
  TextInput,
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import MensagemErro from '../comuns/MensagemErro';
import { useTema } from '../../theme/ThemeContext';
import { sombraLeve } from '../../theme/ui';

const BADGES_POR_TIPO = {
  Vaca: require('../../../assets/images/badge-vaca.png'),
  Bezerro: require('../../../assets/images/badge-bezerro.png'),
  Boi: require('../../../assets/images/badge-boi.png'),
};

export default function Conteudo({
  nome,
  descricao,
  onChangeNome,
  onChangeDescricao,
  bovinosAdicionados,
  onPressAdicionar,
  onPressCriar,
  erro,
  carregando,
}) {
  const { t } = useTema();

  return (
    <View style={styles.containerP}>
      <View style={[styles.containerS, { backgroundColor: t.card, borderColor: t.borda }]}>
        <Text style={[styles.texto, { color: t.textoSecundario }]}>Nome</Text>
        <TextInput
          style={[styles.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          placeholder="Nome do grupo"
          placeholderTextColor={t.placeholder}
          value={nome}
          onChangeText={onChangeNome}
        />
        <Text style={[styles.texto, { color: t.textoSecundario }]}>Descrição</Text>
        <TextInput
          style={[styles.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          placeholder="Descrição do grupo"
          placeholderTextColor={t.placeholder}
          value={descricao}
          onChangeText={onChangeDescricao}
        />
        <Text style={[styles.texto, { color: t.textoSecundario }]}>Bovinos</Text>
        <View style={styles.containerQ}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bovinos}>
            {bovinosAdicionados.map((bovino) => (
              <View key={bovino.id} style={styles.btnWrapper}>
                <View style={[styles.btnBovino, { backgroundColor: t.campo, borderColor: t.borda }]}>
                  <Image
                    style={styles.imagemBovino}
                    source={require('../../../assets/images/vaquinha.png')}
                  />
                  {BADGES_POR_TIPO[bovino.tipo] ? (
                    <Image style={styles.badgeMini} source={BADGES_POR_TIPO[bovino.tipo]} />
                  ) : null}
                </View>
              </View>
            ))}
            <View style={styles.btnWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: t.campo, borderColor: t.borda },
                  pressed ? { backgroundColor: t.verdeSuave } : null,
                ]}
                onPress={onPressAdicionar}
                accessibilityLabel="Adicionar bovino ao grupo">
                <Text style={styles.btnT}> + </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
        <MensagemErro mensagem={erro} />
        <Pressable
          style={({ pressed }) => [styles.btnCriar, pressed ? styles.btnCriarPressionado : null]}
          onPress={onPressCriar}
          disabled={carregando}>
          {carregando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.textoCriar}> Criar </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    minHeight: 380,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  containerS: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    ...sombraLeve,
  },
  containerQ: {
    minHeight: 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bovinos: {
    minHeight: 110,
  },
  texto: {
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: 5,
    color: cores.cinzaTexto,
    fontFamily: fontes.padraoMedio,
  },
  campo: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    fontFamily: fontes.campo,
  },
  btn: {
    width: 80,
    height: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  btnBovino: {
    width: 80,
    height: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  imagemBovino: {
    width: 55,
    height: 55,
  },
  badgeMini: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
  },
  btnPressionado: {
    backgroundColor: '#eafbe0',
  },
  btnWrapper: {
    width: 80,
    height: 110,
    marginRight: 10,
  },
  btnT: {
    fontSize: 70,
    fontFamily: fontes.padraoBold,
    color: cores.verde,
  },
  btnCriar: {
    marginTop: 30,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.roxo,
    borderRadius: 14,
  },
  btnCriarPressionado: {
    backgroundColor: '#7440d6',
  },
  textoCriar: {
    color: 'white',
    fontFamily: fontes.botao,
  },
  erro: {
    color: cores.erro,
    fontFamily: fontes.padrao,
    fontSize: 12,
    marginTop: 10,
  },
});
