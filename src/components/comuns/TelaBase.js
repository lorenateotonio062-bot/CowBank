import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Estrutura padrão de todas as telas do app. Resolve, num lugar só, três
// coisas que antes cada tela resolvia (mal) por conta própria:
//
// 1. Áreas seguras: o app roda em modo "edge to edge" no Android, então
//    sem isso o conteúdo passa por baixo da barra de status e dos botões
//    de navegação do celular. O respiro vem dos insets reais do aparelho,
//    por isso aparece desde o primeiro render — e não só depois que algo
//    redimensiona a tela.
//
// 2. Rodapé fixo: o RodapeNav fica FORA da área que rola, colado no fim da
//    tela. Antes ele ia dentro do ScrollView e "flutuava" no meio do
//    conteúdo, grudando no último campo.
//
// 3. Teclado: o conteúdo sobe e continua rolável, deixando visível o campo
//    que está sendo digitado. Enquanto o teclado está aberto o rodapé é
//    escondido — senão ele ficaria espremido logo acima do teclado.
export default function TelaBase({
  children,
  rodape,
  sobreposicao,
  backgroundColor,
  rolavel = true,
  paddingInferior = 0,
}) {
  const insets = useSafeAreaInsets();
  const tecladoAberto = useTecladoAberto();

  const conteudo = rolavel ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.conteudoRolavel, { paddingBottom: paddingInferior }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, { paddingBottom: paddingInferior }]}>{children}</View>
  );

  return (
    <View style={[styles.flex, { backgroundColor, paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {conteudo}
        {rodape && !tecladoAberto ? (
          <View style={{ paddingBottom: insets.bottom }}>{rodape}</View>
        ) : null}
      </KeyboardAvoidingView>
      {/* Sem rodapé, o respiro de baixo ainda precisa existir (ex: telas de
          login e de redefinir senha). */}
      {!rodape ? <View style={{ height: insets.bottom }} /> : null}
      {/* Fica por cima de tudo e fora da área que rola — é onde entram
          avisos flutuantes como o Toast, que senão rolariam junto com o
          conteúdo em vez de ficar parados na tela. */}
      {sobreposicao}
    </View>
  );
}

function useTecladoAberto() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const eventoAbrir = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const eventoFechar = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const aoAbrir = Keyboard.addListener(eventoAbrir, () => setAberto(true));
    const aoFechar = Keyboard.addListener(eventoFechar, () => setAberto(false));
    return () => {
      aoAbrir.remove();
      aoFechar.remove();
    };
  }, []);

  return aberto;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  conteudoRolavel: {
    flexGrow: 1,
  },
});
