import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';

// Popup de confirmação de exclusão — mesmo visual desenhado no Snack
// "Popups - CB", agora reutilizável e funcional (com overlay real).
// Usado tanto para deletar um bovino quanto um grupo, trocando o `titulo`.
export default function ConfirmModal({ visivel, titulo, onCancelar, onConfirmar }) {
  const { t } = useTema();

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <Pressable style={[styles.fundo, { backgroundColor: t.overlay }]} onPress={onCancelar}>
        <Pressable style={[styles.caixa, { backgroundColor: t.card, borderColor: t.borda }]} onPress={() => {}}>
          <Text style={[styles.titulo, { color: t.texto }]}>{titulo}</Text>

          <View style={styles.linhaBotoes}>
            <TouchableOpacity onPress={onCancelar}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>

            <Text style={[styles.separador, { color: t.textoSecundario }]}>|</Text>

            <TouchableOpacity onPress={onConfirmar}>
              <Text style={styles.deletar}>Deletar</Text>
            </TouchableOpacity>
          </View>
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
    padding: 8,
  },
  caixa: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
    width: '80%',
  },
  titulo: {
    fontFamily: fontes.padraoSemiBold,
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  linhaBotoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelar: {
    color: cores.verde,
    fontFamily: fontes.botao,
    fontSize: 13,
  },
  separador: {
    marginHorizontal: 10,
    color: '#555',
  },
  deletar: {
    color: cores.deletar,
    fontFamily: fontes.botao,
    fontSize: 13,
  },
});
