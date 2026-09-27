import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { sombraLeve } from '../../theme/ui';
import { useTema } from '../../theme/ThemeContext';

export default function Opcoes({ corTexto }) {
  const navigation = useNavigation();
  const { t } = useTema();

  return (
    <View style={styles.conteinerP}>
      <Text style={[styles.titulo, corTexto ? { color: corTexto } : null]}> Opções </Text>
      <View style={styles.conteinerS}>
        <Pressable
          style={({ pressed }) => [styles.cardAcao, styles.cardPrimario, pressed ? styles.btnPressionado : null]}
          onPress={() => navigation.navigate('RegistrarBovino')}>
          <Text style={styles.iconeTexto}>+</Text>
          <View style={styles.textoBox}>
            <Text style={styles.texto}>Registrar bovino</Text>
            <Text style={[styles.descricao, styles.descricaoPrimaria]}>Adicionar animal ao rebanho</Text>
          </View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.cardAcao,
            { backgroundColor: t.card, borderColor: t.borda },
            pressed ? styles.btnPressionado : null,
          ]}
          onPress={() => navigation.navigate('CriarGrupo')}>
          <Text style={[styles.iconeTexto, styles.iconeSecundario, { backgroundColor: t.verdeSuave }]}>#</Text>
          <View style={styles.textoBox}>
            <Text style={[styles.texto, { color: t.texto }]}>Criar grupo</Text>
            <Text style={[styles.descricao, { color: t.textoSecundario }]}>Organizar por lote ou fazenda</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteinerP: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  conteinerS: {
    gap: 10,
  },
  cardAcao: {
    minHeight: 74,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.card,
    borderWidth: 1,
    borderColor: cores.borda,
    ...sombraLeve,
  },
  cardPrimario: {
    backgroundColor: cores.roxo,
    borderColor: cores.roxo,
  },
  btnPressionado: {
    opacity: 0.78,
  },
  iconeTexto: {
    width: 40,
    height: 40,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 39,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: cores.branco,
    fontFamily: fontes.padraoBold,
    fontSize: 24,
  },
  iconeSecundario: {
    color: cores.verdeEscuro,
    backgroundColor: cores.verdeSuave,
  },
  textoBox: {
    flex: 1,
    marginLeft: 12,
  },
  texto: {
    color: cores.branco,
    fontFamily: fontes.botao,
    fontSize: 15,
  },
  textoSecundario: {
    color: cores.cinzaTexto,
  },
  descricao: {
    marginTop: 2,
    color: cores.textoSecundario,
    fontFamily: fontes.padrao,
    fontSize: 12,
  },
  descricaoPrimaria: {
    color: 'rgba(255,255,255,0.78)',
  },
  titulo: {
    fontSize: 22,
    fontFamily: fontes.padraoBold,
    marginBottom: 12,
  },
});
