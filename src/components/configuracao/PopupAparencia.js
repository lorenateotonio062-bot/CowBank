import { Text, View, StyleSheet, Image, Pressable, Modal } from 'react-native';

import { useTema } from '../../theme/ThemeContext';

// Mesmo visual do Snack "Pop-up de Aparência" — só que agora o seletor
// realmente alterna entre claro/escuro (e o app todo reage a isso via
// ThemeContext).
export default function PopupAparencia({ visivel, onFechar }) {
  const { modo, definirModo, t } = useTema();

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={[styles.fundo, { backgroundColor: t.overlay }]} onPress={onFechar}>
        <Pressable style={[styles.container, { backgroundColor: t.card, borderColor: t.borda }]} onPress={() => {}}>
          <Text style={[styles.textApare, { color: t.texto }]}>Escolha um tema</Text>

          <Pressable
            style={[styles.divAparencia, { borderBottomColor: t.divisoria }]}
            onPress={() => definirModo('claro')}
            accessibilityLabel="Tema claro">
            <Image style={styles.imgClaro} source={require('../../../assets/images/icone-sol.png')} />
            <Text style={[styles.texto, { color: t.texto }]}>Claro</Text>
            <Image
              style={styles.seletor}
              source={
                modo === 'claro'
                  ? require('../../../assets/images/seletor-ativado.png')
                  : require('../../../assets/images/seletor-desativado.png')
              }
            />
          </Pressable>

          <Pressable
            style={styles.divAparencia2}
            onPress={() => definirModo('escuro')}
            accessibilityLabel="Tema escuro">
            <Image style={styles.imgEscuro} source={require('../../../assets/images/icone-lua.png')} />
            <Text style={[styles.texto, { color: t.texto }]}>Escuro</Text>
            <Image
              style={styles.seletor}
              source={
                modo === 'escuro'
                  ? require('../../../assets/images/seletor-ativado.png')
                  : require('../../../assets/images/seletor-desativado.png')
              }
            />
          </Pressable>
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
  },
  container: {
    height: 220,
    width: 300,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
  },
  divAparencia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    width: 270,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  divAparencia2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    width: 270,
    marginTop: 5,
    borderBottomColor: 'gray',
  },
  imgEscuro: {
    width: 50,
    height: 50,
  },
  imgClaro: {
    width: 55,
    height: 55,
  },
  seletor: {
    width: 30,
    height: 30,
    marginRight: 20,
    marginLeft: 30,
  },
  texto: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  textApare: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'gray',
    marginBottom: 20,
    marginTop: 20,
  },
});
