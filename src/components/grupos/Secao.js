import { Text, View, StyleSheet, Pressable } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';

const OPCOES = [
  { label: 'Todos', tipo: null },
  { label: 'Vacas', tipo: 'Vaca' },
  { label: 'Bezerros', tipo: 'Bezerro' },
  { label: 'Bois', tipo: 'Boi' },
];

export default function Secao({ tipoSelecionado, onSelecionar }) {
  const { t } = useTema();

  return (
    <View style={styles.container}>
      {OPCOES.map((opcao) => {
        const selecionado = tipoSelecionado === opcao.tipo;
        return (
          <Pressable
            key={opcao.tipo ?? 'todos'}
            style={[
              styles.btn,
              { backgroundColor: t.card, borderColor: t.borda },
              selecionado ? styles.btnSelecionado : null,
            ]}
            onPress={() => onSelecionar(opcao.tipo)}
            accessibilityLabel={`Filtrar por ${opcao.label}`}>
            <Text style={[styles.texto, { color: t.textoSecundario }, selecionado ? styles.textoSelecionado : null]}>
              {opcao.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginBottom: 4,
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSelecionado: {
    backgroundColor: cores.roxo,
    borderColor: cores.roxo,
  },
  texto: {
    color: cores.textoSecundario,
    fontFamily: fontes.padraoMedio,
    fontSize: 13,
  },
  textoSelecionado: {
    color: cores.branco,
  },
});
