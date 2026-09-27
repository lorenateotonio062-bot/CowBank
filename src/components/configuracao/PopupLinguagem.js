import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, Pressable, Modal } from 'react-native';

import { getUsuario, salvarIdioma } from '../../db/database';
import { useTema } from '../../theme/ThemeContext';

// Mesmo visual do Snack "Pop-up de Linguagem". O seletor funciona e a
// escolha é salva de verdade no perfil — mas traduzir o app inteiro pra
// 3 idiomas é um projeto de internacionalização à parte (centenas de
// textos em dezenas de arquivos), fora do escopo de um toggle de
// configuração. Por enquanto a interface continua em português
// independente da escolha; ver README para detalhes.
const IDIOMAS = [
  { valor: 'pt', label: 'Português', imagem: require('../../../assets/images/bandeira-brasil.png'), estiloImagem: 'brasil' },
  { valor: 'es', label: 'Espanhol', imagem: require('../../../assets/images/bandeira-espanha.png'), estiloImagem: 'espanha' },
  { valor: 'en', label: 'Inglês', imagem: require('../../../assets/images/bandeira-eua.png'), estiloImagem: 'eua' },
];

export default function PopupLinguagem({ visivel, onFechar }) {
  const { t } = useTema();
  const [idiomaSelecionado, setIdiomaSelecionado] = useState('pt');

  useEffect(() => {
    if (visivel) {
      getUsuario()
        .then((usuario) => {
          setIdiomaSelecionado(usuario?.idioma ?? 'pt');
        })
        .catch(() => {});
    }
  }, [visivel]);

  async function selecionar(valor) {
    setIdiomaSelecionado(valor);
    try {
      await salvarIdioma(valor);
    } catch (e) {
      // não conseguiu salvar (sem conexão) — a escolha vale só até fechar o app
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={[styles.fundo, { backgroundColor: t.overlay }]} onPress={onFechar}>
        <Pressable style={[styles.container, { backgroundColor: t.card, borderColor: t.borda }]} onPress={() => {}}>
          {IDIOMAS.map((idioma, indice) => (
            <Pressable
              key={idioma.valor}
              style={[
                indice === IDIOMAS.length - 1 ? styles.divLinguagem2 : styles.divLinguagem,
                indice === IDIOMAS.length - 1 ? null : { borderBottomColor: t.divisoria },
              ]}
              onPress={() => selecionar(idioma.valor)}
              accessibilityLabel={idioma.label}>
              <Image style={styles[`img${idioma.estiloImagem}`]} source={idioma.imagem} />
              <Text style={[styles.texto, { color: t.texto }]}>{idioma.label}</Text>
              <Image
                style={styles.seletor}
                source={
                  idiomaSelecionado === idioma.valor
                    ? require('../../../assets/images/seletor-ativado.png')
                    : require('../../../assets/images/seletor-desativado.png')
                }
              />
            </Pressable>
          ))}
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
  divLinguagem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    width: 270,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  divLinguagem2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    width: 270,
    marginTop: 5,
    borderBottomColor: 'gray',
  },
  imgbrasil: {
    width: 70,
    height: 70,
  },
  imgeua: {
    width: 75,
    height: 50,
  },
  imgespanha: {
    width: 70,
    height: 65,
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
});
