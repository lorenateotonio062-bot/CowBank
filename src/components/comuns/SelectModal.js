import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, FlatList } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';

// Modal simples de seleção em lista — usado nos botões "Vacas" (tipo) e
// "Grupo" da tela de Registrar bovino, que no design original eram apenas
// botões com uma setinha (sem funcionalidade). Não existia uma tela própria
// desenhada para essa escolha, então esse modal segue o mesmo estilo visual
// do resto do app (cantos arredondados, verde como cor de destaque).
export default function SelectModal({ visivel, titulo, opcoes, valorSelecionado, onSelecionar, onFechar }) {
  const { t } = useTema();

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={[styles.fundo, { backgroundColor: t.overlay }]} onPress={onFechar}>
        <Pressable style={[styles.caixa, { backgroundColor: t.card, borderColor: t.borda }]} onPress={() => {}}>
          <Text style={[styles.titulo, { color: t.texto }]}>{titulo}</Text>
          <FlatList
            data={opcoes}
            keyExtractor={(item) => String(item.value)}
            style={styles.lista}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.opcao,
                  { backgroundColor: t.fundoNeutro, borderColor: t.borda },
                  item.value === valorSelecionado ? styles.opcaoSelecionada : null,
                ]}
                onPress={() => onSelecionar(item.value)}>
                <Text
                  style={[
                    styles.textoOpcao,
                    { color: t.texto },
                    item.value === valorSelecionado ? styles.textoOpcaoSelecionada : null,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={[styles.vazio, { color: t.textoSecundario }]}>Nenhuma opção disponível</Text>}
          />
          <TouchableOpacity style={styles.btnFechar} onPress={onFechar}>
            <Text style={styles.textoFechar}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  caixa: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  titulo: {
    fontFamily: fontes.padraoSemiBold,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  lista: {
    maxHeight: 260,
  },
  opcao: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
  },
  opcaoSelecionada: {
    backgroundColor: cores.verde,
  },
  textoOpcao: {
    fontFamily: fontes.campo,
    fontSize: 14,
  },
  textoOpcaoSelecionada: {
    color: cores.branco,
    fontFamily: fontes.campoMedio,
  },
  vazio: {
    fontFamily: fontes.padrao,
    color: cores.cinzaTexto,
    textAlign: 'center',
    paddingVertical: 10,
  },
  btnFechar: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  textoFechar: {
    color: cores.roxo,
    fontFamily: fontes.botao,
  },
});
