import { useState } from 'react';
import { StyleSheet, ScrollView, Text, Pressable, Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';

import Cabecalho from '../components/configuracao/Cabecalho';
import ConfigAplic from '../components/configuracao/ConfigAplic';
import ConfigSup from '../components/configuracao/ConfigSup';
import PopupAparencia from '../components/configuracao/PopupAparencia';
import PopupLinguagem from '../components/configuracao/PopupLinguagem';
import RodapeNav from '../components/comuns/RodapeNav';
import TelaBase from '../components/comuns/TelaBase';
import { cores } from '../theme/colors';
import { fontes } from '../theme/fonts';
import { useTema } from '../theme/ThemeContext';
import { sair } from '../db/database';

export default function ConfiguracaoScreen() {
  const navigation = useNavigation();
  const { t, carregarModoSalvo } = useTema();
  const [aparenciaAberta, setAparenciaAberta] = useState(false);
  const [linguagemAberta, setLinguagemAberta] = useState(false);

  function handleSair() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await sair();
            await carregarModoSalvo(); // sem usuário, volta ao tema claro
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
          } catch (e) {
            Alert.alert('Erro', e.message || 'Não foi possível sair. Tente novamente.');
          }
        },
      },
    ]);
  }

  return (
    <TelaBase backgroundColor={t.fundo} rolavel={false} rodape={<RodapeNav />}>
      <Cabecalho />
      {/* As seções rolam por dentro: assim o botão "Sair" nunca empurra o
          rodapé de navegação para fora da tela, mesmo em telas menores. */}
      <ScrollView
        style={styles.lista}
        contentContainerStyle={styles.listaConteudo}
        showsVerticalScrollIndicator={false}>
        <ConfigAplic
          onAbrirAparencia={() => setAparenciaAberta(true)}
          onAbrirLinguagem={() => setLinguagemAberta(true)}
        />
        <ConfigSup />
        <Pressable
          style={({ pressed }) => [styles.btnSair, pressed ? styles.btnSairPressionado : null]}
          onPress={handleSair}
          accessibilityLabel="Sair da conta">
          <Text style={styles.textoSair}> Sair </Text>
        </Pressable>
      </ScrollView>

      <PopupAparencia visivel={aparenciaAberta} onFechar={() => setAparenciaAberta(false)} />
      <PopupLinguagem visivel={linguagemAberta} onFechar={() => setLinguagemAberta(false)} />
    </TelaBase>
  );
}

const styles = StyleSheet.create({
  lista: {
    flex: 1,
  },
  listaConteudo: {
    paddingBottom: 20,
  },
  // mesmo formato dos outros botões de ação do app (altura 45, canto 5,
  // largura alinhada aos cartões das seções acima)
  btnSair: {
    alignSelf: 'center',
    width: '90%',
    height: 50,
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: cores.deletar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSairPressionado: {
    backgroundColor: '#c40000',
  },
  textoSair: {
    color: 'white',
    fontFamily: fontes.botao,
  },
});
