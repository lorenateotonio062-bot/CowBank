import { Text, View, StyleSheet, Image, TextInput, Pressable } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';
import { sombraLeve } from '../../theme/ui';

export default function Comp2({
  nome,
  onChangeNome,
  tipo,
  onAbrirSeletorTipo,
  nomeGrupoSelecionado,
  onAbrirSeletorGrupo,
  fotoUri,
  onEscolherFoto,
}) {
  const { t } = useTema();

  return (
    <View style={styles.containerP}>
      <View style={[styles.containerS, { backgroundColor: t.card, borderColor: t.borda }]}>
        <Pressable style={[styles.fotoBotao, { backgroundColor: t.verdeSuave }]} onPress={onEscolherFoto}>
          <Image
            style={fotoUri ? styles.fotoAnimal : styles.imagem}
            source={fotoUri ? { uri: fotoUri } : require('../../../assets/images/vaquinha.png')}
          />
          <Text style={styles.fotoTexto}>{fotoUri ? 'Trocar' : 'Foto'}</Text>
        </Pressable>
        <View style={styles.containerT}>
          <Text style={[styles.InputText, { color: t.textoSecundario }]}>Nome</Text>
          <TextInput
            placeholder="Numeração"
            placeholderTextColor={t.placeholder}
            style={[styles.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
            value={nome}
            onChangeText={onChangeNome}
          />
          <View style={styles.containerQ}>
            <Pressable style={styles.btn} onPress={onAbrirSeletorTipo}>
              <Text style={styles.textobtn}>{tipo || 'Vacas'} </Text>
              <Image
                style={styles.imgBtn}
                source={require('../../../assets/images/setinha-branca.png')}
              />
            </Pressable>
            <Pressable style={styles.btn} onPress={onAbrirSeletorGrupo}>
              <Text style={styles.textobtn} numberOfLines={1}>
                {nomeGrupoSelecionado || 'Grupo'}{' '}
              </Text>
              <Image
                style={styles.imgBtn}
                source={require('../../../assets/images/setinha-branca.png')}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  imagem: {
    width: 120,
    height: 100,
  },
  fotoBotao: {
    width: 120,
    height: 116,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fotoAnimal: {
    width: 120,
    height: 116,
  },
  fotoTexto: {
    position: 'absolute',
    bottom: 7,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: cores.branco,
    fontFamily: fontes.padraoSemiBold,
    fontSize: 11,
  },
  containerS: {
    width: '100%',
    minHeight: 150,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    ...sombraLeve,
  },
  containerT: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  campo: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 14,
    fontFamily: fontes.campo,
    paddingHorizontal: 12,
  },
  containerQ: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    minWidth: 0,
    height: 35,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 25,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  textobtn: {
    color: 'white',
    fontFamily: fontes.botao,
    flex: 1,
    fontSize: 12,
  },
  imgBtn: {
    width: 12,
    height: 10,
  },
  InputText: {
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: 5,
    color: cores.cinzaTexto,
    fontFamily: fontes.padraoMedio,
  },
});
